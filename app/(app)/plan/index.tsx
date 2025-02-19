import { Location, undefined, Weather } from "@/app/auth/(sign-in)/join/2";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import weatherCodes from "../../../components/focus-panel/widgets/weather/weatherCodes.json";
import { getGreeting } from "../../../components/home/getGreeting";

export const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    lineHeight: 55,
    marginTop: "auto",
    fontFamily: "serifText700",
  },
  subtitle: { textAlign: "center", fontSize: 30, opacity: 0.7 },
  buttonContainer: {
    padding: 20,
    marginTop: "auto",
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "100%",
    maxWidth: 700,
  },
  buttonText: { fontSize: 20 },
});

export default function Page() {
  const theme = useColorTheme();
  const handleNext = () => router.push("/plan/1");
  const greeting = getGreeting();
  const { session } = useUser();

  const getPlan = useCallback(async () => {
    const ip = await fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((res) => res.ip);
    const device = await sendApiRequest(
      session,
      "GET",
      "user/sessions/device",
      { ip }
    );
    const { latitude, longitude } = device.location;
    const weather = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,weather_code&temperature_unit=fahrenheit`
    ).then((res) => res.json());
    return { device, weather };
  }, [session]);

  const [planData, setPlanData] = useState(null);

  useEffect(() => {
    getPlan().then(setPlanData);
  }, [getPlan]);

  console.log(planData);
  const dark = useDarkMode();
  const locationName =
    planData?.device?.city?.names?.en ||
    planData?.device?.country?.names?.en ||
    planData?.device?.continent?.names?.en;
  const temp = planData?.weather?.current?.temperature_2m;

  const orange = useColor("orange");
  const gray = useColor("gray");

  const icon =
    weatherCodes[planData?.weather?.current?.weather_code]?.[
      planData?.weather?.current?.is_day ? "day" : "night"
    ]?.icon;

  const breakpoints = useResponsiveBreakpoints();

  return (
    <LinearGradient
      colors={[theme[2], theme[3], theme[4], theme[3], theme[2]]}
      style={styles.container}
    >
      {!planData ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spinner />
        </View>
      ) : (
        <>
          <View
            style={[
              styles.title,
              {
                paddingHorizontal:
                  breakpoints.md && Platform.OS === "web" ? 10 : 0,
              },
            ]}
          >
            <Text
              style={[
                styles.title,
                {
                  marginTop: 15,
                  marginBottom: 5,
                  marginLeft: -3,
                  fontSize: breakpoints.md ? 40 : 30,
                  lineHeight: breakpoints.md ? 55 : 45,
                  color: theme[11],
                },
              ]}
            >
              {greeting}, {session.user.profile.name.split(" ")[0]}.{"\n"}
              {`It's${
                !planData.weather || !planData.device ? " currently" : ""
              }`}{" "}
              <View
                style={[
                  styles.title,
                  {
                    height: breakpoints.md ? undefined : 40,
                    backgroundColor: orange[6],
                    paddingHorizontal: 5,
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 10,
                  },
                ]}
              >
                <Icon
                  style={{
                    verticalAlign: "middle",
                    marginRight: 5,
                    color: orange[11],
                  }}
                  size={breakpoints.md ? 40 : 24}
                  bold
                >
                  access_time
                </Icon>
                <Text
                  style={{
                    color: orange[11],
                    fontSize: breakpoints.md ? 40 : 30,
                    fontFamily: "serifText700",
                  }}
                  numberOfLines={1}
                >
                  {dayjs().format("h:mm A")}
                </Text>
              </View>{" "}
              and currently{" "}
              <Weather
                weatherCode={planData?.weather?.current?.weather_code}
                isNight={!planData?.weather?.current?.is_day}
                icon={icon}
                temp={temp}
              />{" "}
              in
              <Location planData={planData} locationName={locationName} />
            </Text>
          </View>
          <Text
            style={[
              styles.subtitle,
              {
                marginRight: "auto",
                paddingHorizontal: Platform.OS === "web" ? 10 : 20,
                marginTop: 5,
                color: theme[11],
                fontSize: 25,
              },
            ]}
          >
            Let's plan out your day!
          </Text>
        </>
      )}
      <View style={styles.buttonContainer}>
        <Button
          onPress={handleNext}
          backgroundColors={{
            pressed: theme[11],
            hovered: theme[10],
            default: theme[9],
          }}
          containerStyle={{ width: "100%" }}
          height={70}
        >
          <ButtonText
            style={[styles.buttonText, { color: theme[1] }]}
            onPress={handleNext}
            weight={800}
          >
            Start
          </ButtonText>
          <Icon style={{ color: theme[1] }} bold>
            east
          </Icon>
        </Button>
      </View>
    </LinearGradient>
  );
}

