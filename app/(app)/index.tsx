import { styles } from "@/components/home/styles";
import { ContentWrapper } from "@/components/layout/content";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { WeatherWidget } from "../../components/home/weather/widget";

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
    <View
      style={{
        height: 220,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: "heading",
          textAlign: "center",
          color: theme[12],
          textShadowColor: theme[7],
          textShadowRadius: 30,
          height: '100%',
          paddingTop: 90,
          width: "100%",
          textShadowOffset: { height: 5, width: 5 },
        }}
        textClassName="uppercase text-5xl mt-5"
      >
        {greeting}
      </Text>
    </View>
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

  return (
    <ContentWrapper>
      <ScrollView
        overScrollMode="never"
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
      >
        <Greeting />
        <Text
          textClassName="uppercase text-sm opacity-80"
          style={{
            fontFamily: "body_700",
            color: theme[11],
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
    </ContentWrapper>
  );
}
