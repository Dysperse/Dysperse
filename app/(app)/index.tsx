import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WeatherWidget } from "../../components/home/weather/widget";
import { styles } from "@/components/home/styles";
import { Button } from "@/ui/Button";
import Toast from "react-native-toast-message";

function Greeting() {
  const theme = useColorTheme();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else if (hour < 22) {
      setGreeting("Good evening");
    } else {
      setGreeting("Good night");
    }
  }, []);

  return (
    <Text
      style={{
        fontFamily: "heading",
        color: theme[12],
        textShadowColor: theme[7],
        textShadowRadius: 30,
        textShadowOffset: { height: 5, width: 5 },
        height: 100,
        paddingTop: 20,
      }}
      textClassName="uppercase text-5xl mt-5"
    >
      {greeting}
    </Text>
  );
}

function TodaysDate() {
  const theme = useColorTheme();

  return (
    <Pressable
      style={({ pressed, hovered }: any) => [
        styles.card,
        {
          backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
        },
      ]}
    >
      <Icon size={40} style={{ marginLeft: -5 }}>
        calendar_today
      </Icon>
      <Text textClassName="mt-1 text-xl" style={{ fontFamily: "body_700" }}>
        {dayjs().format("MMM Do")}
      </Text>
      <Text>{dayjs().format("YYYY")}</Text>
    </Pressable>
  );
}

function PlanDayPrompt() {
  const theme = useColorTheme();

  return (
    <Pressable
      style={({ pressed, hovered }: any) => [
        styles.card,
        {
          backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
          marginBottom: 15,
        },
      ]}
    >
      <Text>Plan your day</Text>
    </Pressable>
  );
}

function TodaysTasks() {
  const theme = useColorTheme();
  return (
    <Pressable
      style={({ pressed, hovered }: any) => [
        styles.card,
        {
          backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
          marginBottom: 15,
        },
      ]}
    >
      <Text>Today's tasks!</Text>
    </Pressable>
  );
}

function RecentActivity() {
  const theme = useColorTheme();
  return (
    <Pressable
      style={({ pressed, hovered }: any) => [
        styles.card,
        {
          backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
        },
      ]}
    >
      <Text>Recent activity</Text>
    </Pressable>
  );
}

export default function Index() {
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      overScrollMode="never"
      className="p-5"
      style={{
        marginTop: insets.top + 64,
        backgroundColor: theme[1],
        borderTopLeftRadius: 20,
      }}
    >
      <Greeting />

      <Text
        textClassName="uppercase text-sm mt-2 opacity-80"
        style={{
          fontFamily: "body_700",
          color: theme[11],
          marginTop: -25,
        }}
      >
        Today's rundown
      </Text>
      <View
        className="flex-row mt-1.5"
        style={{ columnGap: 15, marginBottom: 15 }}
      >
        <WeatherWidget />
        <TodaysDate />
      </View>
      <PlanDayPrompt />
      <TodaysTasks />
      <RecentActivity />
    </ScrollView>
  );
}
