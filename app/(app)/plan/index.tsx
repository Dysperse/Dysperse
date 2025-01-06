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
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
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

function Weather({ weatherCode, isNight, icon, temp }) {
  const weatherDescription =
    weatherCodes[weatherCode][isNight ? "night" : "day"];
  const theme = useColor(weatherDescription.colorTheme);

  return (
    <Text
      style={[
        styles.title,
        {
          color: theme[11],
          fontSize: 40,
          backgroundColor: theme[6],
          paddingHorizontal: 5,
          borderRadius: 10,
        },
      ]}
      numberOfLines={1}
    >
      <Icon size={40} style={{ verticalAlign: "middle", color: theme[11] }}>
        {icon}
      </Icon>
      {temp}°
    </Text>
  );
}

export default function Page() {
  const breakpoints = useResponsiveBreakpoints();
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

  return (
    <LinearGradient
      colors={[theme[2], theme[3], theme[4], theme[3], theme[2]]}
      style={styles.container}
    >
      <SystemBars style="light" />
      {!planData ? (
        <Spinner />
      ) : (
        <Text
          style={[
            styles.title,
            {
              paddingHorizontal: 20,
              fontSize: 40,
              color: theme[11],
            },
          ]}
        >
          {greeting}, {session.user.profile.name.split(" ")[0]}.{"\n"}It's{" "}
          <Text
            style={[
              styles.title,
              {
                color: orange[11],
                fontSize: 40,
                backgroundColor: orange[6],
                paddingHorizontal: 5,
                borderRadius: 10,
              },
            ]}
            numberOfLines={1}
          >
            <Icon
              style={{
                verticalAlign: "middle",
                marginRight: 5,
                color: orange[11],
              }}
              size={40}
            >
              access_time
            </Icon>
            {dayjs().format("h:mm A")}
          </Text>{" "}
          and currently{" "}
          <Weather
            weatherCode={planData?.weather?.current?.weather_code}
            isNight={!planData?.weather?.current?.is_day}
            icon={icon}
            temp={temp}
          />{" "}
          in
          <Text
            style={[
              styles.title,
              {
                color: gray[11],
                fontSize: 40,
                backgroundColor: gray[6],
                paddingHorizontal: 5,
                borderRadius: 10,
              },
            ]}
            numberOfLines={1}
          >
            <Text
              style={{
                verticalAlign: "top",
                marginLeft: 10,
                lineHeight: 1,
                marginRight: 15,
              }}
            >
              <Image
                source={{ uri: planData?.device?.preview }}
                style={{
                  borderRadius: 10,
                  width: 30,
                  height: 30,
                  ...(Platform.OS === "web" &&
                    dark && {
                      filter: "invert(5) brightness(2) contrast(0.8)",
                    }),
                  transform: [{ rotate: "-15deg" }, { translateY: 5 }],
                }}
              />
            </Text>
            {locationName}
          </Text>
        </Text>
      )}
      <Text
        style={[
          styles.subtitle,
          {
            marginRight: "auto",
            paddingHorizontal: 20,
            marginTop: 20,
            color: theme[11],
          },
        ]}
      >
        Let's plan out your day
      </Text>
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

