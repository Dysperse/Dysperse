import { styles } from "@/components/home/styles";
import { ContentWrapper } from "@/components/layout/content";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { WeatherWidget } from "../../components/home/weather/widget";
import { Avatar } from "@/ui/Avatar";
import { useUser } from "@/context/useUser";
import { Button, ButtonText } from "@/ui/Button";
import NavigationBar from "@/ui/NavigationBar";
import { LinearGradient } from "expo-linear-gradient";
import IconButton from "@/ui/IconButton";
import { router } from "expo-router";

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
      <Text style={{ fontSize: 20, marginTop: 5 }} weight={700}>
        {dayjs().format("MMM Do")}
      </Text>
      <Text>{dayjs().format("YYYY")}</Text>
    </Pressable>
  );
}

function PlanDayPrompt() {
  const theme = useColorTheme();

  return (
    <TouchableOpacity>
      <LinearGradient
        colors={[theme[3], theme[7], theme[6], theme[5]]}
        start={[0, 0]}
        end={[1, 1]}
        style={[
          styles.card,
          {
            marginBottom: 15,
            height: 80,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 20,
            flex: 1,
            flexDirection: "row",
          },
        ]}
      >
        <Icon size={30}>gesture</Icon>
        <View>
          <Text weight={700} style={{ fontSize: 20 }}>
            Plan your day
          </Text>
          <Text style={{ fontSize: 14, opacity: 0.7, marginTop: 1.5 }}>
            Let's optimize today's schedule
          </Text>
        </View>
        <Icon style={{ marginLeft: "auto" }}>arrow_forward_ios</Icon>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function TodaysTasks() {
  const theme = useColorTheme();
  return (
    <TouchableOpacity>
      <View
        style={[
          styles.card,
          {
            marginBottom: 15,
            height: 80,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 20,
            flexDirection: "row",
            backgroundColor: theme[3],
          },
        ]}
      >
        <Icon size={30}>transition_push</Icon>

        <View>
          <Text weight={700} style={{ fontSize: 20 }}>
            Upcoming
          </Text>
          <Text style={{ fontSize: 14, opacity: 0.7, marginTop: 1.5 }}>
            5 tasks, 7 notes
          </Text>
        </View>
        <Icon style={{ marginLeft: "auto", marginRight: 10 }}>
          arrow_forward_ios
        </Icon>
      </View>
    </TouchableOpacity>
  );
}

function RecentActivity() {
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  return (
    <View>
      <Text>(TODO: show recent activity here)</Text>
    </View>
  );
}

function FriendActivity() {
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  return (
    <>
      <Text>(TODO: show friend activity here)</Text>
    </>
  );
}

function SpaceInfo() {
  const { session } = useUser();
  const { width } = useWindowDimensions();

  const handleSpaceClick = useCallback(() => router.push("/space"), []);

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 15,
        justifyContent: width > 600 ? "flex-end" : "center",
      }}
    >
      <Button variant="outlined" onPress={handleSpaceClick}>
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
  const theme = useColorTheme();

  return (
    <ContentWrapper>
      <NavigationBar color={theme[1]} />
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
            gap: 10,
            paddingBottom: width > 600 ? 0 : 20,
          }}
        >
          <Text variant="eyebrow" style={{ marginTop: 20 }}>
            Friends
          </Text>
          <FriendActivity />
          <Text variant="eyebrow" style={{ marginTop: 20 }}>
            Recent activity
          </Text>
          <RecentActivity />
        </View>
        <View style={{ marginBottom: 100, marginTop: 20 }}>
          <SpaceInfo />
        </View>
      </ScrollView>
    </ContentWrapper>
  );
}
