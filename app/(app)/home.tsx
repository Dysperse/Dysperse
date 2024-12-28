import { Actions } from "@/components/home/actions";
import { EditWallpaper } from "@/components/home/edit-wallpaper";
import { FriendActivity } from "@/components/home/friend-activity";
import { Greeting } from "@/components/home/greeting";
import StreakGoal from "@/components/home/streaks";
import { styles } from "@/components/home/styles";
import { TodayText } from "@/components/home/today";
import ContentWrapper from "@/components/layout/content";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import MenuIcon from "@/components/menuIcon";
import { useUser } from "@/context/useUser";
import { hslToHex } from "@/helpers/hslToHex";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import IconButton from "@/ui/IconButton";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Fragment, memo, useState } from "react";
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
    <Button
      variant="outlined"
      text="Customize"
      icon={view === "edit" ? "check" : "palette"}
      backgroundColors={{
        default: "transparent",
        pressed: "transparent",
        hovered: "transparent",
      }}
      containerStyle={{
        marginHorizontal: "auto",
      }}
      onPress={() => setView((d) => (d === "edit" ? "home" : "edit"))}
    />
  );
};

export const MenuButton = ({
  gradient,
  back,
}: {
  gradient?: boolean;
  back?: boolean;
}) => {
  const theme = useColorTheme();
  const { top } = useSafeAreaInsets();
  const { sidebarRef } = useSidebarContext();

  const Wrapper = gradient
    ? ({ children }) => (
        <LinearGradient
          colors={[theme[1], addHslAlpha(theme[1], 0)]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 10,
            height: 100,
            width: "100%",
            pointerEvents: "none",
          }}
        >
          {children}
        </LinearGradient>
      )
    : Fragment;

  return (
    <Wrapper>
      <IconButton
        style={[styles.menuButton, { top: top + 20 }]}
        icon={back ? "arrow_back_ios_new" : <MenuIcon />}
        size={45}
        pressableStyle={{ pointerEvents: "auto" }}
        onPress={() => {
          if (back) {
            if (router.canGoBack()) router.back();
            else router.push("/");
          } else {
            sidebarRef.current.openDrawer();
          }
        }}
      />
    </Wrapper>
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
              {Platform.OS === "web" && (
                <CustomizeButton view={view} setView={setView} />
              )}
            </>
          )}
        </ScrollView>
      </Wrapper>
    </ContentWrapper>
  );
}

export default memo(Page);

