import { useCommandPaletteContext } from "@/components/command-palette/context";
import { useFocusPanelContext } from "@/components/focus-panel/context";
import { styles } from "@/components/home/styles";
import { ContentWrapper } from "@/components/layout/content";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSWR from "swr";
import { ProfileModal } from "../../components/ProfileModal";
import { useSidebarContext } from "../../components/layout/sidebar/context";

function Greeting() {
  const theme = useColorTheme();
  const [greeting, setGreeting] = useState("");
  const breakpoints = useResponsiveBreakpoints();

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
  const theme = useColorTheme();

  return (
    <Pressable
      disabled
      style={({ pressed, hovered }: any) => [
        styles.card,
        {
          opacity: 0.4,
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
          {/* Tap to begin */}
          Coming soon
        </Text>
      </View>
      <Icon style={{ marginLeft: "auto" }}>arrow_forward_ios</Icon>
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

  console.log(data);

  if (friends.length < 8)
    for (let i = friends.length; i < 8; i++) {
      friends.push({ placeholder: i });
    }

  return (
    <>
      <Text variant="eyebrow" style={{ marginBottom: 10 }}>
        Recent Activity
      </Text>
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
              flex: 1,
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
                <Text style={{ opacity: 0.6 }} numberOfLines={1}>
                  All Friends
                </Text>
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
        style={({ pressed, hovered }: any) => [
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

function JumpTo() {
  const { handleOpen } = useCommandPaletteContext();
  const theme = useColorTheme();

  return (
    <Pressable
      onPress={handleOpen}
      style={({ pressed, hovered }: any) => ({
        backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 20,
        gap: 20,
      })}
    >
      <Icon size={35}>bolt</Icon>
      <Text style={{ color: theme[11], fontSize: 17 }} weight={700}>
        Jump to...
      </Text>
    </Pressable>
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
        Appearance
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

            const uri = `https://my.dysperse.com/api/user/homePagePattern?color=%23${hslToHex(
              ...hslValues
            )}&pattern=${pattern}`;

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

function hslToHex(h, s, l) {
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
      <TouchableOpacity style={actionStyles.item} onPress={handleOpen}>
        <Icon>electric_bolt</Icon>
        <Text style={{ color: theme[11] }} numberOfLines={1}>
          Jump to...
        </Text>
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
  const uri = `https://my.dysperse.com/api/user/homePagePattern?color=%23${hslToHex(
    ...hslValues
  )}&pattern=${pattern}`;

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
            opacity: 0.5,
          }}
          icon={view === "edit" ? "check" : "more_horiz"}
          size={55}
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
            <View
              style={[
                {
                  paddingHorizontal: 50,
                  width: width - (isFocused ? 550 : 300),
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
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    </ContentWrapper>
  );
}
