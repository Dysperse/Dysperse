import { styles } from "@/components/home/styles";
import { ContentWrapper } from "@/components/layout/content";
import { useUser } from "@/context/useUser";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import NavigationBar from "@/ui/NavigationBar";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { WeatherWidget } from "../../components/home/weather/widget";
import Spinner from "@/ui/Spinner";
import useSWR from "swr";
import ErrorAlert from "@/ui/Error";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Chip from "@/ui/Chip";

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
  const { data, isLoading, error } = useSWR(["user/friends"]);
  const handleFriendsPress = useCallback(() => router.push("/friends"), []);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 20,
        height: 150 * 2 + 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <ErrorAlert />
      ) : (
        <FlatList
          data={[...data, "ALL_FRIENDS"]}
          style={{ width: "100%" }}
          numColumns={2}
          renderItem={({ item: friend }) =>
            friend === "ALL_FRIENDS" ? (
              <TouchableOpacity
                key={"all"}
                onPress={handleFriendsPress}
                style={{
                  height: 150,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  flex: 0.5,
                }}
              >
                <Avatar size={70} disabled>
                  <Icon size={30}>groups_2</Icon>
                </Avatar>
                <Text style={{ opacity: 0.6 }}>All Friends</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={friend.user.email}
                style={{
                  height: 150,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  flex: 0.5,
                }}
              >
                <View
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 999,
                    position: "relative",
                  }}
                >
                  <ProfilePicture
                    style={{ pointerEvents: "none" }}
                    name={friend.user.profile?.name || "--"}
                    image={friend.user.profile?.picture}
                    size={70}
                  />
                  <Chip
                    // dense
                    style={{
                      position: "absolute",
                      bottom: -3,
                      right: -3,
                      height: 30,
                      borderWidth: 5,
                      borderColor: theme[1],
                    }}
                    textStyle={{ fontSize: 13 }}
                    label={dayjs(friend.user.profile?.lastActive)
                      .fromNow(true)
                      .replace("inute", "")
                      .replace("our", "")
                      .replace("ay", "")
                      .replace("ay", "")
                      .replace("onth", "")
                      .replace("s", "")
                      .replace("ear", "")
                      .replace("an", "1")
                      .replace("a ", "1")
                      .replaceAll(" ", "")
                      .toUpperCase()}
                  />
                </View>
                <Text style={{ opacity: 0.6 }}>
                  {friend.user.profile?.name.split(" ")?.[0]}
                </Text>
              </TouchableOpacity>
            )
          }
        />
      )}
    </View>
  );
}

function SpaceInfo() {
  const { session } = useUser();
  const { width } = useWindowDimensions();

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: width > 600 ? "flex-end" : "center",
      }}
    >
      <Button variant="outlined">
        <Icon>palette</Icon>
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
        style={Platform.OS === "web" ? { height: 0 } : undefined}
        contentContainerStyle={{
          paddingHorizontal: 20,
          ...(width > 600 && {
            flexDirection: "row",
            height: "100%",
            alignItems: "center",
            gap: 50,
            paddingHorizontal: 150,
          }),
        }}
      >
        <View style={{ flex: 1.3 }}>
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
          <SpaceInfo />
          <Text variant="eyebrow">Friends</Text>
          <FriendActivity />
          <Text variant="eyebrow" style={{ marginTop: 20 }}>
            Recent activity
          </Text>
          <RecentActivity />
        </View>
      </ScrollView>
    </ContentWrapper>
  );
}
