import { useCommandPaletteContext } from "@/components/command-palette/context";
import { styles } from "@/components/home/styles";
import { ContentWrapper } from "@/components/layout/content";
import { useTabMetadata } from "@/components/layout/tabs/useTabMetadata";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
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
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
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
      weight={100}
      numberOfLines={1}
      style={{
        textAlign: "center",
        color: theme[12],
        fontSize: breakpoints.md ? 70 : 40,
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
      style={({ pressed, hovered }: any) => [
        styles.card,
        { backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3] },
      ]}
    >
      <Icon size={30}>gesture</Icon>
      <View style={{ flex: 1 }}>
        <Text
          weight={700}
          style={{ fontSize: 20, color: theme[11] }}
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
          Tap to begin
        </Text>
      </View>
      <Icon style={{ marginLeft: "auto" }}>arrow_forward_ios</Icon>
    </Pressable>
  );
}

function FriendActivity() {
  const theme = useColorTheme();
  const { data, isLoading, error } = useSWR(["user/friends"]);
  const handleFriendsPress = useCallback(() => router.push("/friends"), []);

  const friends = Array.isArray(data) && [...data, "ALL_FRIENDS"];

  if (friends.length < 6)
    for (let i = friends.length; i < 6; i++) {
      friends.push({ placeholder: i });
    }

  return (
    <>
      <Text
        style={{
          fontSize: 60,
          textAlign: "center",
          marginVertical: 20,
          marginBottom: 0,
        }}
      >
        Friends
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          paddingHorizontal: 20,
        }}
      >
        {isLoading ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spinner />
          </View>
        ) : error ? (
          <ErrorAlert />
        ) : (
          friends.map((friend, i) =>
            friend === "ALL_FRIENDS" ? (
              <TouchableOpacity
                key={"all"}
                onPress={handleFriendsPress}
                style={{
                  height: 180,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  width: "33.3333%",
                }}
              >
                <Avatar size={90} disabled>
                  <Icon size={30}>groups_2</Icon>
                </Avatar>
                <Text style={{ opacity: 0.6 }}>All Friends</Text>
              </TouchableOpacity>
            ) : !friend.user ? (
              <View
                key={Math.random()}
                style={{
                  height: 180,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  // flex: 0.5,
                  width: "33.3333%",
                }}
              >
                <View
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 999,
                    position: "relative",
                    backgroundColor: theme[~~(6 - i / 2)],
                  }}
                />
                <View
                  style={{
                    height: 15,
                    width: 60,
                    borderRadius: 99,
                    marginTop: 2,
                    backgroundColor: theme[~~(6 - i / 2)],
                  }}
                />
              </View>
            ) : (
              <ProfileModal email={friend.user.email} key={friend.user.email}>
                <TouchableOpacity
                  style={{
                    height: 180,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    // flex: 0.5,
                    width: "33.3333%",
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
            style={{ fontSize: 20, color: theme[11] }}
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
        Jump to a collection, label, or more...
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
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 100,
      }}
    >
      <Text style={{ fontSize: 60, marginVertical: 20 }}>Appearance</Text>
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
                borderColor: theme[5],
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
                    borderColor: theme[5],
                  },
                ]}
              >
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
      weight={200}
      numberOfLines={1}
      style={{
        textAlign: "center",
        color: theme[12],
        fontSize: 20,
        marginBottom: 25,
        marginTop: -10,
        opacity: 0.7,
      }}
    >
      Today's {dayjs().format("MMMM Do, YYYY")}
    </Text>
  );
}

export default function Index() {
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const { session } = useUser();
  const [view, setView] = useState<"home" | "activity" | "edit">("home");
  const pattern = session?.user?.profile?.pattern || "none";
  const { sidebarMargin } = useSidebarContext();

  const hslValues = theme[5]
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
    <ContentWrapper noPaddingTop>
      <ImageBackground
        source={{
          uri: pattern === "none" ? null : uri,
        }}
        style={{ flex: 1, alignItems: "center" }}
        resizeMode="repeat"
      >
        {!breakpoints.md && (
          <IconButton
            style={{ position: "absolute", top: 20, left: 20 }}
            icon="menu"
            size={55}
            variant="outlined"
            onPress={() => (sidebarMargin.value = 0)}
          />
        )}
        <ButtonGroup
          state={[view, setView]}
          options={[
            { icon: "home", value: "home" },
            { icon: "upcoming", value: "activity" },
            { icon: "more_horiz", value: "edit" },
          ]}
          containerStyle={{
            marginTop: 100,
            height: 50,
            width: "auto",
            maxWidth: 200,
          }}
          buttonStyle={{ flex: 1, borderBottomWidth: 0 }}
          activeComponent={
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  height: 5,
                  width: 12,
                  borderRadius: 999,
                  backgroundColor: theme[11],
                  marginHorizontal: "auto",
                }}
              />
            </View>
          }
          buttonTextStyle={{ textAlign: "center" }}
          iconStyle={{ color: theme[10] }}
          selectedIconStyle={{ color: theme[11] }}
          scrollContainerStyle={{ flex: 1, gap: 10 }}
        />
        <View
          style={{
            maxWidth: 650,
            paddingHorizontal: 50,
            paddingBottom: view === "edit" ? 0 : 70,
            width: "100%",
            marginHorizontal: "auto",
            flex: 1,
            marginVertical: "auto",
          }}
        >
          {view === "home" ? (
            <View style={{ marginVertical: "auto" }}>
              <Greeting />
              <TodayText />
              <JumpTo />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 20,
                  marginTop: 20,
                  width: "100%",
                }}
              >
                <PlanDayPrompt />
                <JumpBackIn />
              </View>
            </View>
          ) : view === "activity" ? (
            <FriendActivity />
          ) : (
            <EditWallpaper />
          )}
        </View>
      </ImageBackground>
    </ContentWrapper>
  );
}
