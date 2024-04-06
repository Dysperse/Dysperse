import { useCommandPaletteContext } from "@/components/command-palette/context";
import { useFocusPanelContext } from "@/components/focus-panel/context";
import { styles } from "@/components/home/styles";
import ContentWrapper from "@/components/layout/content";
import { useTabMetadata } from "@/components/layout/tabs/useTabMetadata";
import CreateTask from "@/components/task/create";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSWR from "swr";
import { ProfileModal } from "../../components/ProfileModal";
import { useSidebarContext } from "../../components/layout/sidebar/context";

export const getGreeting = () => {
  const now = new Date();
  const hour = now.getHours();
  if (hour < 10) {
    return "Good morning";
  } else if (hour < 16) {
    return "Good afternoon";
  } else if (hour < 20) {
    return "Good evening";
  } else {
    return "Good night";
  }
};

function Greeting() {
  const theme = useColorTheme();
  const [greeting, setGreeting] = useState(getGreeting());
  const breakpoints = useResponsiveBreakpoints();

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <Text
      weight={900}
      numberOfLines={1}
      style={{
        color: theme[12],
        fontSize: breakpoints.md ? 40 : 30,
        marginBottom: 10,
      }}
    >
      {greeting}
    </Text>
  );
}

function PlanDayPrompt() {
  const { session } = useUser();
  const theme = useColorTheme();
  const handlePress = useCallback(() => {
    router.push("/plan");
  }, []);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed, hovered }) => [
        styles.card,
        {
          minHeight: 80,
          backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
        },
      ]}
    >
      <Icon size={30}>tactic</Icon>
      <View style={{ flex: 1 }}>
        <Text
          weight={700}
          style={{ fontSize: 17, color: theme[11] }}
          numberOfLines={1}
        >
          Plan your day
        </Text>
        <Text
          style={{
            fontSize: 14,
            opacity: 0.7,
            marginTop: 1.5,
            color: theme[11],
          }}
          numberOfLines={1}
        >
          {dayjs(session.user.profile.lastPlanned).isToday()
            ? "Complete!"
            : "Tap to begin"}
        </Text>
      </View>
      <Avatar
        disabled
        icon={
          dayjs(session.user.profile.lastPlanned).isToday()
            ? "check"
            : "arrow_forward_ios"
        }
        style={{
          backgroundColor: dayjs(session.user.profile.lastPlanned).isToday()
            ? theme[8]
            : "transparent",
        }}
        iconProps={{
          bold: true,
          style: {
            color: dayjs(session.user.profile.lastPlanned).isToday()
              ? theme[1]
              : theme[11],
          },
        }}
      />
    </Pressable>
  );
}

export const getProfileLastActiveRelativeTime = (time) => {
  const t = dayjs(time).fromNow(true);
  return t.includes("few") || dayjs().diff(time, "minute") < 3
    ? "NOW"
    : t.split(" ")[0].replace("an", "1").replace("a", "1") +
        t.split(" ")?.[1]?.[0].toUpperCase();
};

function FriendActivity() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { data, isLoading, error } = useSWR(["user/friends"]);
  const { height } = useWindowDimensions();
  const handleFriendsPress = useCallback(() => router.push("/friends"), []);

  const friends = Array.isArray(data) && [...data, "ALL_FRIENDS"];

  const red = useColor("red");

  if (friends.length < 8)
    for (let i = friends.length; i < 8; i++) {
      friends.push({ placeholder: i });
    }

  const { session } = useUser();
  const { data: friendData } = useSWR(["user/friends", { requests: "true" }]);
  const hasRequest =
    Array.isArray(friendData) &&
    Boolean(
      friendData?.find(
        (user) =>
          user.accepted === false && user.followingId === session?.user?.id
      )
    );

  return (
    <>
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          marginBottom: 10,
          gap: 10,
        }}
      >
        <Text variant="eyebrow">Recent Activity</Text>
        {hasRequest && (
          <View
            style={{
              width: 10,
              borderRadius: 99,
              height: 10,
              backgroundColor: red[9],
            }}
          />
        )}
      </View>
      <ScrollView
        contentContainerStyle={{
          flexDirection: "row",
          flexWrap: "wrap",
          paddingVertical: 10,
        }}
        style={[
          {
            borderWidth: 1,
            borderColor: theme[4],
            backgroundColor: theme[2],
            borderRadius: 20,
            width: "100%",
          },
          breakpoints.md && { height: height / 3 },
        ]}
      >
        {isLoading ? (
          <View
            style={{
              height: breakpoints.md ? height / 3 - 25 : "100%",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spinner />
          </View>
        ) : error ? (
          <ErrorAlert />
        ) : (
          Array.isArray(friends) &&
          friends.map((friend, i) =>
            friend === "ALL_FRIENDS" ? (
              <TouchableOpacity
                key={"all"}
                onPress={handleFriendsPress}
                style={{
                  height: 110,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  width: breakpoints.md ? "24.99%" : "33.3333%",
                }}
              >
                <Avatar size={60} disabled>
                  <Icon size={30}>groups_2</Icon>
                </Avatar>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                  }}
                >
                  <Text style={{ opacity: 0.6 }} numberOfLines={1}>
                    All Friends
                  </Text>
                  {hasRequest && (
                    <View
                      style={{
                        width: 10,
                        borderRadius: 99,
                        height: 10,
                        backgroundColor: red[9],
                      }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ) : !friend.user ? (
              <View
                key={Math.random()}
                style={{
                  height: 110,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  width: breakpoints.md ? "24.99%" : "33.3333%",
                }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 999,
                    position: "relative",
                    backgroundColor: theme[~~(7 - i / 2)],
                  }}
                />
                <View
                  style={{
                    height: 15,
                    width: 60,
                    borderRadius: 99,
                    marginTop: 2,
                    backgroundColor: theme[~~(7 - i / 2)],
                  }}
                />
              </View>
            ) : (
              <ProfileModal email={friend.user.email} key={friend.user.email}>
                <TouchableOpacity
                  style={{
                    height: 110,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    width: breakpoints.md ? "24.99%" : "33.3333%",
                  }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 999,
                      position: "relative",
                    }}
                  >
                    <ProfilePicture
                      style={{ pointerEvents: "none" }}
                      name={friend.user.profile?.name || "--"}
                      image={friend.user.profile?.picture}
                      size={60}
                    />
                    <Chip
                      dense
                      disabled
                      style={[
                        {
                          position: "absolute",
                          bottom: -3,
                          right: -3,
                          height: 30,
                          borderWidth: 5,
                          borderColor: theme[2],
                          paddingHorizontal: 7,
                        },
                        getProfileLastActiveRelativeTime(
                          friend.user.profile?.lastActive
                        ) === "NOW" && {
                          backgroundColor: theme[10],
                          height: 26,
                          width: 26,
                          paddingHorizontal: 0,
                        },
                      ]}
                      textStyle={{ fontSize: 13 }}
                      textWeight={700}
                      label={getProfileLastActiveRelativeTime(
                        friend.user.profile?.lastActive
                      ).replace("NOW", "")}
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
      </ScrollView>
    </>
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

  const tabMetadata = useTabMetadata(data?.slug as string, data?.params);

  return (
    data !== null && (
      <Pressable
        style={({ pressed, hovered }) => [
          styles.card,
          { backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3] },
        ]}
      >
        <Icon size={30}>
          {typeof tabMetadata.icon === "function"
            ? tabMetadata.icon(data?.params)
            : tabMetadata.icon}
        </Icon>
        <View>
          <Text
            weight={700}
            style={{ fontSize: 17, color: theme[11] }}
            numberOfLines={1}
          >
            {capitalizeFirstLetter(tabMetadata.name(data?.params)[0])}
          </Text>
          <Text
            style={{
              fontSize: 14,
              opacity: 0.7,
              marginTop: 1.5,
              color: theme[11],
            }}
            numberOfLines={1}
          >
            {tabMetadata.name(data?.params)[1]}
          </Text>
        </View>
        <Icon style={{ marginLeft: "auto" }}>arrow_forward_ios</Icon>
      </Pressable>
    )
  );
}

const patterns = [
  "dots",
  "topography",
  "hideout",
  "triangles",
  "dysperse",
  "anchors",
  "diamonds",
  "leaves",
  "skulls",
  "tic-tac-toe",
  "cash",
  "shapes",
  "venn",
  "wiggle",
  "motion",
  "autumn",
  "architect",
  "sand",
  "graph",
  "hexagons",
  "plus",
];

function EditWallpaper() {
  const theme = useColorTheme();
  const { session, sessionToken, mutate } = useUser();
  const selectedPattern = session?.user?.profile?.pattern || "none";

  const handlePatternSelect = useCallback(
    async (pattern) => {
      mutate(
        (d) => ({
          ...d,
          user: {
            ...d.user,
            profile: {
              ...d.user.profile,
              pattern,
            },
          },
        }),
        {
          revalidate: false,
        }
      );
      await sendApiRequest(
        sessionToken,
        "PUT",
        "user/profile",
        {},
        {
          body: JSON.stringify({
            pattern,
          }),
        }
      );
    },
    [sessionToken, mutate]
  );

  return (
    <ScrollView
      style={{ height: "100%" }}
      contentContainerStyle={{
        justifyContent: "center",
        paddingBottom: 100,
        paddingHorizontal: 30,
        paddingTop: 100,
        maxWidth: 800,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontSize: 40, marginVertical: 20 }} weight={800}>
        Customize
      </Text>
      <Text variant="eyebrow">Color</Text>
      <Button
        onPress={() => router.push("/settings/customization/appearance")}
        variant="outlined"
        style={{
          marginVertical: 10,
          marginBottom: 40,
          height: 60,
          paddingHorizontal: 40,
        }}
      >
        <ButtonText style={{ fontSize: 17 }}>Open settings</ButtonText>
      </Button>
      <Text variant="eyebrow">Pattern</Text>
      {
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 20,
            marginTop: 10,
          }}
        >
          <Pressable
            onPress={() => {
              handlePatternSelect("none");
            }}
            style={[
              styles.patternCard,
              {
                backgroundColor: theme[1],
                borderColor: theme[selectedPattern === "none" ? 9 : 5],
              },
            ]}
          >
            <Icon size={30}>do_not_disturb_on</Icon>
          </Pressable>
          {patterns.map((pattern) => {
            const hslValues = theme[9]
              .replace("hsl", "")
              .replace("(", "")
              .replace(")", "")
              .replaceAll("%", "")
              .split(",")
              .map(Number) as [number, number, number];

            const uri = `${
              process.env.EXPO_PUBLIC_API_URL
            }/pattern?color=%23${hslToHex(...hslValues)}&pattern=${pattern}`;

            return (
              <Pressable
                key={pattern}
                onPress={() => {
                  handlePatternSelect(pattern);
                }}
                style={[
                  styles.patternCard,
                  {
                    backgroundColor: theme[1],
                    borderColor: theme[selectedPattern === pattern ? 9 : 5],
                  },
                ]}
              >
                {selectedPattern === pattern && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      style={{
                        width: 40,
                        marginLeft: -10,
                        fontSize: 40,
                        borderRadius: 999,
                      }}
                    >
                      check
                    </Icon>
                  </View>
                )}
                <ImageBackground
                  source={{
                    uri: uri,
                  }}
                  style={{ flex: 1, alignItems: "center", width: "100%" }}
                  resizeMode="repeat"
                />
              </Pressable>
            );
          })}
        </View>
      }
    </ScrollView>
  );
}

export function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // convert to Hex and prefix "0" if needed
  };
  return `${f(0)}${f(8)}${f(4)}`;
}

function TodayText() {
  const theme = useColorTheme();
  return (
    <Text
      weight={500}
      numberOfLines={1}
      style={{
        color: theme[12],
        fontSize: 20,
        marginBottom: 25,
        marginTop: -10,
        opacity: 0.6,
      }}
    >
      Today's {dayjs().format("MMMM Do, YYYY")}
    </Text>
  );
}
const actionStyles = StyleSheet.create({
  title: {
    marginBottom: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 20,
    paddingVertical: 5,
  },
});

function Actions() {
  const theme = useColorTheme();
  const { handleOpen } = useCommandPaletteContext();
  const { setFocus, isFocused }: any = useFocusPanelContext();
  const togglePanel = () => setFocus((d) => !d);
  const openEverything = () => router.push("/everything");

  const { data: sharedWithMe } = useSWR(["user/collectionAccess"]);
  const hasUnread =
    Array.isArray(sharedWithMe) && sharedWithMe?.filter((c) => !c.hasSeen);

  return (
    <View>
      <Text variant="eyebrow" style={actionStyles.title}>
        Start
      </Text>
      <CreateTask mutate={() => {}}>
        <TouchableOpacity style={actionStyles.item}>
          <Icon>note_stack_add</Icon>
          <Text style={{ color: theme[11] }} numberOfLines={1}>
            New item...
          </Text>
        </TouchableOpacity>
      </CreateTask>
      <TouchableOpacity style={actionStyles.item} onPress={openEverything}>
        <Icon>category</Icon>
        <Text style={{ color: theme[11] }} numberOfLines={1}>
          Labels & Collections...
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={actionStyles.item}
        onPress={() => handleOpen("Shared with me")}
      >
        <Icon>group</Icon>
        <Text style={{ color: theme[11] }} numberOfLines={1}>
          Shared with me
        </Text>
        {Array.isArray(hasUnread) && hasUnread?.length > 0 && (
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 99,
              marginLeft: -10,
              backgroundColor: theme[9],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 12, paddingTop: 1 }} weight={900}>
              {sharedWithMe.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={actionStyles.item} onPress={togglePanel}>
        <Icon>adjust</Icon>
        <Text style={{ color: theme[11] }} numberOfLines={1}>
          {isFocused ? "End" : "Start"} focus...
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function Index() {
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();
  const { session } = useUser();
  const { isFocused } = useFocusPanelContext();
  const { height } = useWindowDimensions();
  const [view, setView] = useState<"home" | "activity" | "edit">("home");
  const pattern = session?.user?.profile?.pattern || "none";
  const { openSidebar } = useSidebarContext();

  const hslValues = theme[5]
    .replace("hsl", "")
    .replace("(", "")
    .replace(")", "")
    .replaceAll("%", "")
    .split(",")
    .map(Number) as [number, number, number];
  const { width } = useWindowDimensions();
  const uri = `${process.env.EXPO_PUBLIC_API_URL}/pattern?color=%23${hslToHex(
    ...hslValues
  )}&pattern=${pattern}`;

  const widthStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(
        breakpoints.md ? width - (isFocused ? 550 : 300) : width - 20,
        {
          damping: 30,
          overshootClamping: true,
          stiffness: 400,
        }
      ),
    };
  });

  return (
    <ContentWrapper noPaddingTop>
      <ImageBackground
        source={{
          uri: pattern === "none" ? null : uri,
        }}
        style={{ height: "100%", width: "100%", flex: 1, alignItems: "center" }}
        resizeMode="repeat"
      >
        <IconButton
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            marginTop: insets.top,
            margin: 20,
            zIndex: 1,
            opacity: 0.7,
          }}
          icon={view === "edit" ? "check" : "palette"}
          size={55}
          variant={view === "edit" ? "filled" : "text"}
          onPress={() => setView((d) => (d === "edit" ? "home" : "edit"))}
        />
        <ScrollView
          scrollEnabled={!breakpoints.md}
          contentContainerStyle={
            breakpoints.md && {
              height,
              flex: 1,
            }
          }
          style={{
            marginTop: insets.top,
          }}
        >
          {!breakpoints.md && (
            <IconButton
              style={{
                position: "absolute",
                top: 20,
                left: 20,
                zIndex: 1,
              }}
              icon="menu"
              size={55}
              variant="outlined"
              onPress={openSidebar}
            />
          )}
          {view === "edit" ? (
            <EditWallpaper />
          ) : (
            <Animated.View
              style={[
                widthStyle,
                {
                  paddingHorizontal: 50,
                  paddingBottom: 70,
                  marginHorizontal: "auto",
                  marginVertical: "auto",
                  paddingTop: 60,
                },
                !breakpoints.md && {
                  width,
                  paddingTop: 150,
                  paddingHorizontal: 20,
                },
              ]}
            >
              <View style={{ marginTop: "auto" }} />
              <Greeting />
              <TodayText />
              <View
                style={{
                  gap: 50,
                  flexDirection: breakpoints.md ? "row" : "column",
                  marginBottom: "auto",
                  width: "100%",
                }}
              >
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      gap: 20,
                      width: "100%",
                    }}
                  >
                    <Actions />
                    <PlanDayPrompt />
                  </View>
                </View>
                <View style={breakpoints.md && { flex: 1 }}>
                  <FriendActivity />
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </ImageBackground>
    </ContentWrapper>
  );
}
