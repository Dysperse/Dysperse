import { styles } from "@/app/(app)/plan";
import weatherCodes from "@/components/focus-panel/widgets/weather/weatherCodes.json";
import { getGreeting } from "@/components/home/getGreeting";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useColor, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSignupContext } from "../_layout";

export function Weather({ weatherCode, isNight, icon, temp }) {
  const weatherDescription =
    weatherCodes[weatherCode][isNight ? "night" : "day"];
  const theme = useColor(weatherDescription.colorTheme);
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={[
        styles.title,
        {
          backgroundColor: theme[6],
          paddingHorizontal: 5,
          borderRadius: 10,
          height: breakpoints.md ? undefined : 40,
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          transform: [{ translateY: 18 }],
          verticalAlign: breakpoints.md ? "middle" : undefined,
        },
      ]}
    >
      <Icon
        bold
        size={breakpoints.md ? 40 : 24}
        style={{ marginRight: 5, verticalAlign: "middle", color: theme[11] }}
      >
        {icon}
      </Icon>
      <Text
        numberOfLines={1}
        style={{
          color: theme[11],
          fontSize: breakpoints.md ? 40 : 30,
          fontFamily: "serifText700",
        }}
      >
        {temp}°
      </Text>
    </View>
  );
}

export function Location({ planData, locationName }) {
  const breakpoints = useResponsiveBreakpoints();
  const gray = useColor("gray");
  const dark = useDarkMode();

  return (
    planData.device && (
      <View
        style={[
          styles.title,
          {
            backgroundColor: gray[6],
            paddingHorizontal: 10,
            height: breakpoints.md ? undefined : 40,
            borderRadius: 10,
            alignItems: "center",
            verticalAlign: "middle",
            flexDirection: "row",
            gap: 10,
          },
        ]}
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
            transform: [{ rotate: "-15deg" }],
          }}
        />
        <Text
          style={{
            color: gray[11],
            fontSize: breakpoints.md ? 40 : 30,
            fontFamily: "serifText700",
          }}
          numberOfLines={1}
        >
          {locationName}
        </Text>
      </View>
    )
  );
}

function Content() {
  const theme = useColorTheme();
  const params = useLocalSearchParams() as { name: string };
  const greeting = getGreeting();
  const store = useSignupContext();
  const breakpoints = useResponsiveBreakpoints();

  const [hasTouched, setHasTouched] = useState(false);

  const orange = useColor("orange");

  const [planData, setPlanData] = useState(null);

  const icon =
    weatherCodes[planData?.weather?.current?.weather_code]?.[
      planData?.weather?.current?.is_day ? "day" : "night"
    ]?.icon;

  const getPlan = useCallback(async () => {
    const ip = await fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((res) => res.ip);
    const device = await sendApiRequest("-1", "GET", "user/sessions/device", {
      ip,
    });
    const { latitude, longitude } = device.location;
    const weather = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,weather_code&temperature_unit=fahrenheit`
    ).then((res) => res.json());
    return { device, weather };
  }, []);

  useEffect(() => {
    getPlan()
      .then(setPlanData)
      .catch(() =>
        setPlanData({
          device: null,
          weather: null,
        })
      );
  }, [getPlan]);

  const locationName =
    planData?.device?.city?.names?.en ||
    planData?.device?.country?.names?.en ||
    planData?.device?.continent?.names?.en;

  const temp = planData?.weather?.current?.temperature_2m;

  return !planData ? (
    <View style={{ alignItems: "center", gap: 5 }}>
      <Spinner size={30} />
    </View>
  ) : (
    <View
      style={{
        padding: 20,
        paddingHorizontal: 30,
        flex: 1,
        paddingTop: 110,
        justifyContent: "center",
      }}
    >
      <Animated.View entering={FadeIn.delay(300)}>
        <Text variant="eyebrow">2/5</Text>
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
          {greeting}, {store.name.split(" ")[0]}.{"\n"}
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
                transform: [{ translateY: 18 }],
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
          </View>
          {planData.weather && " and currently "}
          {planData?.weather && (
            <Weather
              weatherCode={planData?.weather?.current?.weather_code}
              isNight={!planData?.weather?.current?.is_day}
              icon={icon}
              temp={temp}
            />
          )}
          {planData?.device && " in "}
          <Location planData={planData} locationName={locationName} />
        </Text>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(900)}>
        <Text
          style={{
            opacity: 0.4,
            fontSize: breakpoints.md ? 25 : 17,
            marginTop: 15,
            marginBottom: 15,
            color: theme[11],
          }}
          weight={600}
        >
          What a fine {dayjs().format("dddd")} to be alive —{"\n"}Let's set
          three goals for today!
        </Text>
      </Animated.View>
      <Animated.View
        entering={FadeIn.delay(1200)}
        style={{ gap: 10, marginBottom: 10 }}
      >
        {[...new Array(3)].map((_, index) => (
          <Animated.View
            entering={FadeIn.delay(1200 + index * 100)}
            key={index}
            style={{
              flex: 1,
              borderRadius: 20,
              backgroundColor: theme[3],
              borderColor: theme[6],
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                margin: 20,
                borderRadius: 999,
                borderColor: theme[11],
                borderWidth: 1,
              }}
            />
            <TextField
              style={{ flex: 1, height: "100%" }}
              placeholder={
                ["Drink water", "Go for a walk", "Call a friend"][index]
              }
              onChangeText={(text) => {
                store.tasks[index] = text;
                setHasTouched(true);
              }}
            />
          </Animated.View>
        ))}
      </Animated.View>
      <Animated.View
        entering={FadeIn.delay(1200 + 3 * 100)}
        style={{ marginTop: 10, flexDirection: "row", gap: 10 }}
      >
        <Button
          height={65}
          variant="filled"
          text={hasTouched ? "Next" : "Skip"}
          // containerStyle={!selected.trim() && { opacity: 0.6 }}
          containerStyle={{ flex: 1 }}
          icon={hasTouched ? "east" : ""}
          iconPosition="end"
          bold
          // disabled={!selected.trim()}
          onPress={() => {
            router.push({
              pathname: "/auth/join/3",
              params: { ...params },
            });
          }}
        />
      </Animated.View>
    </View>
  );
}

export default function Page() {
  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
    >
      <Content />
    </KeyboardAwareScrollView>
  );
}

