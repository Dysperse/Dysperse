import { Actions } from "@/components/home/actions";
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
import { ImageBackground as ExpoImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Fragment, memo } from "react";
import {
  Dimensions,
  Keyboard,
  Platform,
  ImageBackground as RNImageBackground,
  View,
} from "react-native";
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

const CustomizeButton = () => {
  return (
    <Button
      icon="palette"
      text="Customize"
      backgroundColors={{
        default: "transparent",
        pressed: "transparent",
        hovered: "transparent",
      }}
      containerStyle={{ marginHorizontal: "auto", opacity: 0.5 }}
      onPress={() => router.push("/home/customize")}
    />
  );
};

export const MenuButton = ({
  gradient,
  back,
  icon,
  addInsets,
}: {
  gradient?: boolean;
  back?: boolean;
  icon?: string;
  addInsets?: boolean;
}) => {
  const theme = useColorTheme();
  const { sidebarRef } = useSidebarContext();
  const insets = useSafeAreaInsets();

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
            pointerEvents: "box-none",
          }}
        >
          {children}
        </LinearGradient>
      )
    : Fragment;

  return (
    <Wrapper>
      <IconButton
        style={[styles.menuButton, addInsets && { marginTop: insets.top }]}
        icon={icon || (back ? "close" : <MenuIcon />)}
        size={45}
        pressableStyle={{ pointerEvents: "auto" }}
        onPress={() => {
          if (back) {
            if (router.canGoBack()) router.back();
            else router.push("/home");
          } else {
            sidebarRef.current.openDrawer();
          }
        }}
      />
    </Wrapper>
  );
};

const Wrapper = memo((props) => {
  const theme = useColorTheme();
  const { session } = useUser();
  const pattern = session?.user?.profile?.pattern || "none";

  const hslValues = theme[3]
    .replace("hsl", "")
    .replace("(", "")
    .replace(")", "")
    .replaceAll("%", "")
    .split(",")
    .map(Number) as [number, number, number];

  const isSafari =
    Platform.OS === "web" &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const params = new URLSearchParams({
    color: `#${hslToHex(...hslValues)}`,
    pattern: pattern,
    screenWidth: Dimensions.get("window").width.toString(),
    screenHeight: Dimensions.get("window").height.toString(),
    ...((Platform.OS !== "web" || isSafari) && { asPng: "true" }),
  });

  const uri = `${process.env.EXPO_PUBLIC_API_URL}/pattern?${params.toString()}`;
  const ImageBackgroundComponent =
    Platform.OS === "web" ? RNImageBackground : ExpoImageBackground;

  return (
    <ImageBackgroundComponent
      {...props}
      source={{ uri: pattern === "none" ? undefined : uri }}
      style={styles.imageBackground}
      cachePolicy="memory"
      resizeMode="repeat"
    />
  );
});

function Page() {
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <ContentWrapper noPaddingTop>
      <Wrapper>
        <ScrollView
          centerContent
          onScrollBeginDrag={Keyboard.dismiss}
          style={{ flex: 1 }}
          contentContainerStyle={{
            maxWidth: breakpoints.md ? 400 : undefined,
            width: "100%",
            paddingHorizontal: 30,
            gap: 20,
            paddingTop: insets.top,
            ...(Platform.OS === "android"
              ? {
                  height: "100%",
                  justifyContent: "center",
                }
              : {
                  // paddingVertical: Platform.OS === "ios" ? 40 : 100,
                }),
            marginHorizontal: Platform.OS === "ios" ? undefined : "auto",
          }}
        >
          {!breakpoints.md && <MenuButton />}
          <View
            style={{
              alignItems: "center",
              marginTop: Platform.OS === "web" ? 0 : 50,
            }}
            aria-valuetext="home-logo"
          >
            <Logo size={64} />
            <Greeting />
            <TodayText />
          </View>
          <Actions />
          <StreakGoal />
          <FriendActivity />
          <CustomizeButton />
        </ScrollView>
      </Wrapper>
    </ContentWrapper>
  );
}

export default memo(Page);

