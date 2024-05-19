import { useFocusPanelContext } from "@/components/focus-panel/context";
import { styles } from "@/components/home/styles";
import ContentWrapper from "@/components/layout/content";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import IconButton from "@/ui/IconButton";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { useState } from "react";
import {
  ImageBackground,
  Platform,
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
import { EditWallpaper } from "../../components/home/edit-wallpaper";
import { FriendActivity } from "../../components/home/friend-activity";
import { Greeting } from "../../components/home/greeting";
import { PlanDayPrompt } from "../../components/home/plan-day-trigger";
import { TodayText } from "../../components/home/today";
import { useSidebarContext } from "../../components/layout/sidebar/context";

export const getGreeting = () => {
  const now = new Date();
  const hour = now.getHours();
  if (hour < 10) return "Good morning";
  else if (hour < 16) return "Good afternoon";
  else if (hour < 20) return "Good evening";
  else return "Good night";
};

export const getProfileLastActiveRelativeTime = (time) => {
  const t = dayjs(time).fromNow(true);
  return t.includes("few") || dayjs().diff(time, "minute") < 3
    ? "NOW"
    : t.split(" ")[0].replace("an", "1").replace("a", "1") +
        t.split(" ")?.[1]?.[0].toUpperCase();
};

export const HOME_PATTERNS = [
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

const CustomizeButton = ({ view, setView }) => {
  const insets = useSafeAreaInsets();

  return (
    <IconButton
      style={[styles.settingsButton, { marginTop: insets.top + 15 }]}
      icon={view === "edit" ? "check" : "palette"}
      size={55}
      variant={view === "edit" ? "filled" : "text"}
      onPress={() => setView((d) => (d === "edit" ? "home" : "edit"))}
    />
  );
};

const MenuButton = () => {
  const { openSidebar } = useSidebarContext();

  return (
    <IconButton
      style={styles.menuButton}
      icon="menu"
      size={55}
      variant="outlined"
      onPress={openSidebar}
    />
  );
};

export default function Index() {
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();
  const { session } = useUser();
  const { isFocused } = useFocusPanelContext();
  const { height } = useWindowDimensions();
  const [view, setView] = useState<"home" | "activity" | "edit">("home");
  const pattern = session?.user?.profile?.pattern || "none";

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
  )}&pattern=${pattern}${Platform.OS !== "web" ? "&png" : ""}`;

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
        source={{ uri: pattern === "none" ? undefined : uri }}
        style={styles.imageBackground}
        resizeMode="repeat"
      >
        <CustomizeButton view={view} setView={setView} />
        <ScrollView
          scrollEnabled={!breakpoints.md}
          contentContainerStyle={breakpoints.md && { height, flex: 1 }}
          style={{ marginTop: insets.top }}
        >
          {!breakpoints.md && <MenuButton />}
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
