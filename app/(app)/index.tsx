import { styles } from "@/components/home/styles";
import { ContentWrapper } from "@/components/layout/content";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { WeatherWidget } from "../../components/home/weather/widget";
import { Avatar } from "@/ui/Avatar";
import { useUser } from "@/context/useUser";
import { Button, ButtonText } from "@/ui/Button";

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

  const { width } = useWindowDimensions();

  return (
    <View
      style={
        width > 600
          ? undefined
          : {
              height: 220,
              alignItems: "center",
              justifyContent: "center",
            }
      }
    >
      <Text
        style={{
          fontFamily: "heading",
          textAlign: width > 600 ? "left" : "center",
          color: theme[12],
          textShadowColor: theme[7],
          textShadowRadius: 30,
          height: "100%",
          paddingTop: width > 600 ? 0 : 90,
          fontSize: 55,
          width: "100%",
          textShadowOffset: { height: 5, width: 5 },
        }}
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
      <Icon size={40} style={{ marginLeft: -4 }}>
        calendar_today
      </Icon>
      <Text style={{ fontSize: 20, marginVertical: 5 }} weight={700}>
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
  const { width } = useWindowDimensions();
  return (
    <Pressable
      style={({ pressed, hovered }: any) => [
        styles.card,
        {
          backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
          minHeight: width > 600 ? 315 : "auto",
        },
      ]}
    >
      <Text>Recent activity</Text>
    </Pressable>
  );
}
function SpaceInfo() {
  const { session } = useUser();
  const { width } = useWindowDimensions();

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 15,
        justifyContent: width > 600 ? "flex-end" : "center",
      }}
    >
      <Button variant="outlined">
        <Icon>tag</Icon>
        <ButtonText>{session?.space?.space?.name}</ButtonText>
      </Button>
      <Button variant="outlined">
        <Icon>palette</Icon>
        <ButtonText>Customize</ButtonText>
      </Button>
    </View>
  );
}

export default function Index() {
  const { width } = useWindowDimensions();
  return (
    <ContentWrapper>
      <ScrollView
        scrollEnabled={width < 600}
        overScrollMode="never"
        contentContainerStyle={{
          paddingHorizontal: 20,
          ...(width > 600 && {
            flexDirection: "row",
            height: "100%",
            alignItems: "center",
            gap: 20,
            paddingHorizontal: 50,
          }),
        }}
      >
        <View style={{ flex: 1 }}>
          <Greeting />
          <Text variant="eyebrow">Today's rundown</Text>
          <View
            style={{
              columnGap: 15,
              marginBottom: 15,
              flexGrow: 1,
              marginTop: 15,
              flexDirection: "row",
            }}
          >
            <WeatherWidget />
            <TodaysDate />
          </View>
          <PlanDayPrompt />
          <TodaysTasks />
        </View>
        <View
          style={{
            flex: width > 600 ? 1 : undefined,
            gap: 15,
            paddingBottom: width > 600 ? 0 : 20,
            flexDirection: width > 600 ? "column" : "column-reverse",
          }}
        >
          <SpaceInfo />
          <RecentActivity />
        </View>
      </ScrollView>
    </ContentWrapper>
  );
}
