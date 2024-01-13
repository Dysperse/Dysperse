import { styles } from "@/components/home/styles";
import { useTabMetadata } from "@/components/layout/bottom-navigation/tabs/useTabMetadata";
import { ContentWrapper } from "@/components/layout/content";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import ListItemText from "@/ui/ListItemText";
import Skeleton from "@/ui/Skeleton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { ProfileModal } from "../../components/ProfileModal";
import { WeatherWidget } from "../../components/home/weather/widget";

function Greeting() {
  const theme = useColorTheme();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 10) {
      setGreeting("Good morning");
    } else if (hour < 16) {
      setGreeting("Good afternoon");
    } else if (hour < 20) {
      setGreeting("Good evening");
    } else {
      setGreeting("Good night");
    }
  }, []);

  const breakpoints = useResponsiveBreakpoints();

  return (
    <Text
      numberOfLines={1}
      style={{
        fontFamily: "heading",
        color: theme[12],
        textShadowColor: theme[7],
        textShadowRadius: 30,
        fontSize: 55,
        height: 200,
        width: "100%",
        marginVertical: breakpoints.lg ? 0 : 20,
        marginBottom: breakpoints.lg ? -130 : -60,
        paddingTop: breakpoints.lg ? 0 : 70,
        textShadowOffset: { height: 5, width: 5 },
      }}
    >
      {greeting}
    </Text>
  );
}

function TodaysDate() {
  const theme = useColorTheme();
  const handlePress = () => router.push("/clock");

  return (
    <Pressable
      onPress={handlePress}
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
      <Text
        style={{ fontSize: 20, marginTop: 5 }}
        weight={700}
        numberOfLines={1}
      >
        {dayjs().format("MMM Do")}
      </Text>
      <Text numberOfLines={1}>{dayjs().format("YYYY")}</Text>
    </Pressable>
  );
}

function PlanDayPrompt() {
  const theme = useColorTheme();

  return (
    <TouchableOpacity>
      <LinearGradient
        colors={[theme[3], theme[3]]}
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
        <View style={{ flex: 1 }}>
          <Text weight={700} style={{ fontSize: 20 }} numberOfLines={1}>
            Plan your day
          </Text>
          <Text
            style={{ fontSize: 14, opacity: 0.7, marginTop: 1.5 }}
            numberOfLines={1}
          >
            Tap to begin
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

        <View style={{ flex: 1 }}>
          <Text weight={700} style={{ fontSize: 20 }} numberOfLines={1}>
            Upcoming
          </Text>
          <Text
            style={{ fontSize: 14, opacity: 0.7, marginTop: 1.5 }}
            numberOfLines={1}
          >
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
  const { data, isLoading, error } = useSWR(["user/friends"]);
  const handleFriendsPress = useCallback(() => router.push("/friends"), []);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 20,
        height: data?.length <= 1 ? 180 : 180 * 2 + 2,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
      }}
    >
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <ErrorAlert />
      ) : (
        [...data, "ALL_FRIENDS"].map((friend) =>
          friend === "ALL_FRIENDS" ? (
            <TouchableOpacity
              key={"all"}
              onPress={handleFriendsPress}
              style={{
                height: 180,
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                flex: 0.5,
              }}
            >
              <Avatar size={90} disabled>
                <Icon size={30}>groups_2</Icon>
              </Avatar>
              <Text style={{ opacity: 0.6 }}>All Friends</Text>
            </TouchableOpacity>
          ) : (
            <ProfileModal email={friend.user.email} key={friend.user.email}>
              <TouchableOpacity
                style={{
                  height: 180,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  flex: 0.5,
                }}
              >
                <View
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 999,
                    position: "relative",
                  }}
                >
                  <ProfilePicture
                    style={{ pointerEvents: "none" }}
                    name={friend.user.profile?.name || "--"}
                    image={friend.user.profile?.picture}
                    size={90}
                  />
                  <Chip
                    // dense
                    disabled
                    style={{
                      position: "absolute",
                      bottom: -3,
                      right: -3,
                      height: 30,
                      borderWidth: 5,
                      borderColor: theme[1],
                    }}
                    textStyle={{ fontSize: 13 }}
                    label={
                      dayjs(friend.user.profile?.lastActive)
                        .fromNow(true)
                        .includes("few")
                        ? "NOW"
                        : dayjs(friend.user.profile?.lastActive)
                            .fromNow(true)
                            .split(" ")[0]
                            .replace("a", "1") +
                          dayjs(friend.user.profile?.lastActive)
                            .fromNow(true)
                            .split(" ")?.[1]?.[0]
                            .toUpperCase()
                    }
                  />
                </View>
                <Text style={{ opacity: 0.6 }}>
                  {friend.user.profile?.name.split(" ")?.[0]}
                </Text>
              </TouchableOpacity>
            </ProfileModal>
          )
        )
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
        <ButtonText>Edit</ButtonText>
      </Button>
    </View>
  );
}

function JumpBackIn() {
  const theme = useColorTheme();
  const [data, setData] = useState<Record<
    string,
    string | Record<string, string>
  > | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("recentlyAccessed").then((data) => {
      setLoading(false);
      setData(JSON.parse(data));
    });
  }, []);

  const handlePress = useCallback(() => {
    if (!data) return;
    router.replace({
      pathname: data.slug as string,
      params: {
        tab: data.id,
        ...(data.params as Record<string, string>),
      },
    });
  }, [data]);

  const tabMetadata = useTabMetadata(data?.slug as string);

  return (
    data !== null && (
      <>
        <Text variant="eyebrow" style={{ marginLeft: 5 }}>
          Recent
        </Text>
        <TouchableOpacity onPress={handlePress}>
          <Skeleton
            isLoading={loading}
            height={60}
            style={{
              marginTop: 10,
              marginBottom: 20,
            }}
          >
            <View
              style={[
                styles.card,
                {
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 10,
                  paddingHorizontal: 15,
                  height: 60,
                  borderRadius: 20,
                  flexDirection: "row",
                  backgroundColor: theme[3],
                },
              ]}
            >
              <Avatar size={40}>
                <Icon size={30}>
                  {typeof tabMetadata.icon === "function"
                    ? tabMetadata.icon(data.params)
                    : tabMetadata.icon}
                </Icon>
              </Avatar>
              <ListItemText
                truncate
                primary={capitalizeFirstLetter(
                  tabMetadata.name(data.params)[0]
                )}
                secondaryProps={{
                  style: { marginTop: -4, fontSize: 13, opacity: 0.6 },
                }}
                secondary={tabMetadata.name(data.params)[1]}
              />
              <Icon>arrow_forward_ios</Icon>
            </View>
          </Skeleton>
        </TouchableOpacity>
      </>
    )
  );
}

export default function Index() {
  const { width } = useWindowDimensions();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <ContentWrapper>
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
          {!breakpoints.lg && <JumpBackIn />}
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
            paddingBottom: width > 600 ? 0 : 70,
          }}
        >
          <SpaceInfo />
          {breakpoints.lg && <JumpBackIn />}
          <Text variant="eyebrow">Friends</Text>
          <FriendActivity />
        </View>
      </ScrollView>
    </ContentWrapper>
  );
}
