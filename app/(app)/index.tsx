import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import Icon from "@/ui/icon";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { StatusBar, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { WeatherWidget } from "../../components/home/weather/widget";

function Greeting() {
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
    <Text style={{ fontFamily: "heading" }} className="uppercase text-5xl mt-5">
      {greeting}
    </Text>
  );
}

function TodaysDate() {
  return (
    <View className="h-36 rounded-3xl bg-gray-200 flex-1 justify-end p-5">
      <Icon size={40} style={{ marginLeft: -5 }}>
        calendar_today
      </Icon>
      <Text className="mt-1 text-xl" style={{ fontFamily: "body_700" }}>
        {dayjs().format("MMM Do")}
      </Text>
      <Text>{dayjs().format("YYYY")}</Text>
    </View>
  );
}

function PlanDayPrompt() {
  return (
    <View
      className="h-24 rounded-3xl bg-gray-200 flex-1 p-5"
      style={{ marginBottom: 15 }}
    >
      <Text>Plan your day</Text>
    </View>
  );
}

function TodaysTasks() {
  return (
    <View
      className="h-24 rounded-3xl bg-gray-200 flex-1 p-5"
      style={{ marginBottom: 15 }}
    >
      <Text>Today's tasks!</Text>
    </View>
  );
}

function RecentActivity() {
  return (
    <View
      className="h-96 rounded-3xl bg-gray-200 flex-1 p-5"
      style={{ marginBottom: 60 }}
    >
      <Text>Recent activity</Text>
    </View>
  );
}

export default function Index() {
  const { signOut } = useSession();
  const { session, error } = useUser();

  return (
    <ScrollView className="p-5">
      <StatusBar barStyle="dark-content" />
      <Greeting />

      <Text
        className="uppercase text-sm opacity-60 mt-2"
        style={{ fontFamily: "body_700" }}
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
