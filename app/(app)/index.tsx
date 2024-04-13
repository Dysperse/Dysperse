import { useFocusPanelContext } from "@/components/focus-panel/context";
import { styles } from "@/components/home/styles";
import ContentWrapper from "@/components/layout/content";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Actions } from "../../components/home/actions";
import { FriendActivity } from "../../components/home/friend-activity";
import { PlanDayPrompt } from "../../components/home/plan-day-trigger";
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

export const getProfileLastActiveRelativeTime = (time) => {
  const t = dayjs(time).fromNow(true);
  return t.includes("few") || dayjs().diff(time, "minute") < 3
    ? "NOW"
    : t.split(" ")[0].replace("an", "1").replace("a", "1") +
        t.split(" ")?.[1]?.[0].toUpperCase();
};

const HOME_PATTERNS = [
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
        <View style={styles.patternContainer}>
          <Pressable
            onPress={() => handlePatternSelect("none")}
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
          {HOME_PATTERNS.map((pattern) => {
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
export const actionStyles = StyleSheet.create({
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
        source={{ uri: pattern === "none" ? null : uri }}
        style={styles.imageBackground}
        resizeMode="repeat"
      >
        <IconButton
          style={[styles.settingsButton, { marginTop: insets.top + 15 }]}
          icon={view === "edit" ? "check" : "palette"}
          size={55}
          variant={view === "edit" ? "filled" : "text"}
          onPress={() => setView((d) => (d === "edit" ? "home" : "edit"))}
        />
        <ScrollView
          scrollEnabled={!breakpoints.md}
          contentContainerStyle={breakpoints.md && { height, flex: 1 }}
          style={{ marginTop: insets.top }}
        >
          {!breakpoints.md && (
            <IconButton
              style={styles.menuButton}
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
                styles.content,
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
                style={[
                  styles.contentColumnContainer,
                  { flexDirection: breakpoints.md ? "row" : "column" },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.leftContainer}>
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
