import { Actions } from "@/components/home/actions";
import { EditWallpaper } from "@/components/home/edit-wallpaper";
import { FriendActivity } from "@/components/home/friend-activity";
import { Greeting } from "@/components/home/greeting";
import StreakGoal from "@/components/home/streaks";
import { styles } from "@/components/home/styles";
import { TodayText } from "@/components/home/today";
import ContentWrapper from "@/components/layout/content";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import { useUser } from "@/context/useUser";
import { hslToHex } from "@/helpers/hslToHex";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import IconButton from "@/ui/IconButton";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import dayjs from "dayjs";
import { router } from "expo-router";
import { memo, useState } from "react";
import { ImageBackground, Platform, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const CustomizeButton = ({ view, setView }) => {
  const insets = useSafeAreaInsets();

  return (
    <IconButton
      style={[styles.settingsButton, { marginTop: insets.top + 10 }]}
      icon={view === "edit" ? "check" : "palette"}
      size={55}
      onPress={() => setView((d) => (d === "edit" ? "home" : "edit"))}
    />
  );
};

const MenuButton = () => {
  const { sidebarRef } = useSidebarContext();

  return (
    <IconButton
      style={styles.menuButton}
      icon="menu"
      size={55}
      variant="outlined"
      onPress={() => sidebarRef.current.openDrawer()}
    />
  );
};

const Wrapper = (props) => {
  const theme = useColorTheme();
  const { session } = useUser();
  const pattern = session?.user?.profile?.pattern || "none";

  const hslValues = theme[5]
    .replace("hsl", "")
    .replace("(", "")
    .replace(")", "")
    .replaceAll("%", "")
    .split(",")
    .map(Number) as [number, number, number];

  const uri =
    Platform.OS === "web" && pattern !== ""
      ? `${process.env.EXPO_PUBLIC_API_URL}/pattern?color=%23${hslToHex(
          ...hslValues
        )}&pattern=${pattern}`
      : "";

  return Platform.OS === "web" ? (
    <ImageBackground
      {...props}
      source={{ uri: pattern === "none" ? undefined : uri }}
      style={styles.imageBackground}
      resizeMode="repeat"
    />
  ) : (
    <View {...props} style={styles.imageBackground} />
  );
};

function Page() {
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();
  const [view, setView] = useState<"home" | "activity" | "edit">("home");

  return (
    <ContentWrapper noPaddingTop>
      <Wrapper>
        <Button onPress={() => router.push("/test")}>Test</Button>
        {Platform.OS === "web" && (
          <CustomizeButton view={view} setView={setView} />
        )}
        <ScrollView
          centerContent
          style={{ flex: 1, marginTop: insets.top }}
          contentContainerStyle={{
            maxWidth: breakpoints.md ? 400 : undefined,
            width: "100%",
            paddingHorizontal: 20,
            gap: 20,
            ...(Platform.OS === "android"
              ? {
                  height: "100%",
                  justifyContent: "center",
                }
              : {
                  paddingVertical: 100,
                }),
            marginHorizontal: "auto",
          }}
        >
          {!breakpoints.md && <MenuButton />}
          {view === "edit" ? (
            <EditWallpaper />
          ) : (
            <>
              <View
                style={{ alignItems: "center", marginBottom: -15 }}
                aria-valuetext="home-logo"
              >
                <Logo size={64} />
              </View>
              <View style={{ alignItems: "center" }}>
                <Greeting />
                <TodayText />
              </View>
              <Actions />
              <StreakGoal />
              <FriendActivity />
            </>
          )}
        </ScrollView>
      </Wrapper>
    </ContentWrapper>
  );
}

export default memo(Page);

