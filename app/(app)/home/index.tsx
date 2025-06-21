import { Actions } from "@/components/home/actions";
import { FriendActivity } from "@/components/home/friend-activity";
import { Greeting } from "@/components/home/greeting";
import StreakGoal from "@/components/home/streaks";
import { styles } from "@/components/home/styles";
import { TodayText } from "@/components/home/today";
import WindowTitle from "@/components/layout/WindowTitle";
import ContentWrapper from "@/components/layout/content";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import MenuIcon from "@/components/menuIcon";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { hslToHex } from "@/helpers/hslToHex";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import IconButton from "@/ui/IconButton";
import { MenuOption } from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { ImageBackground as ExpoImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { LexoRank } from "lexorank";
import { Fragment, lazy, memo } from "react";
import {
  Dimensions,
  Keyboard,
  Platform,
  ImageBackground as RNImageBackground,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";

const Magic8Ball = lazy(
  () => import("@/components/focus-panel/widgets/magic-8-ball")
);
const Clock = lazy(() => import("@/components/focus-panel/widgets/clock"));
const Quotes = lazy(() => import("@/components/focus-panel/widgets/quotes"));
const Spotify = lazy(() => import("@/components/focus-panel/widgets/spotify"));
const UpNext = lazy(() => import("@/components/focus-panel/widgets/up-next"));
const BatteryWidget = lazy(
  () => import("@/components/focus-panel/widgets/battery")
);
const TopStocks = lazy(
  () => import("@/components/focus-panel/widgets/top-stocks")
);
const WeatherWidget = lazy(
  () => import("@/components/focus-panel/widgets/weather/widget")
);
const WordOfTheDay = lazy(
  () => import("@/components/focus-panel/widgets/word-of-the-day")
);
const Randomizer = lazy(
  () => import("@/components/focus-panel/widgets/randomizer")
);

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
  const insets = useSafeAreaInsets();

  return (
    <Button
      text="Edit"
      variant="outlined"
      backgroundColors={{
        default: "transparent",
        pressed: "transparent",
        hovered: "transparent",
      }}
      containerStyle={{
        marginHorizontal: "auto",
        opacity: 0.7,
        marginBottom: insets.bottom + 30,
      }}
      onPress={() => router.push("/home/customize")}
    />
  );
};

export const MenuButton = ({
  gradient,
  back,
  icon,
  addInsets,
  gradientColors,
  iconColor,
  left = false,
}: {
  gradient?: boolean;
  back?: boolean;
  icon?: string;
  addInsets?: boolean;
  gradientColors?: string[];
  left?: boolean;
  iconColor?: string;
}) => {
  const theme = useColorTheme();
  const { sidebarRef } = useSidebarContext();
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();
  const { desktopCollapsed } = useSidebarContext();

  const Wrapper = gradient
    ? ({ children }) => (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 10,
            height: 150,
            overflow: "visible",
            width: "100%",
            pointerEvents: "box-none",
          }}
        >
          <LinearGradient
            colors={
              gradientColors || [
                theme[2],
                addHslAlpha(theme[2], 0.7),
                addHslAlpha(theme[2], 0),
              ]
            }
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 10,
              height: addInsets ? 140 : 60,
              overflow: "visible",
              width: "100%",
              pointerEvents: "box-none",
              zIndex: -1,
            }}
          />
          {children}
        </View>
      )
    : Fragment;

  return (
    (desktopCollapsed || !breakpoints.md || back) && (
      <Wrapper>
        <IconButton
          style={[
            styles.menuButton,
            (!back || left) && {
              right: undefined,
              left: 20,
            },
            { zIndex: 1 },
            addInsets && { marginTop: insets.top },
          ]}
          icon={icon || (back ? "close" : <MenuIcon />)}
          iconStyle={iconColor ? { color: iconColor } : undefined}
          size={45}
          variant={back ? "filled" : undefined}
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
    )
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

export function RenderWidget({ widget, index, small }) {
  const { sessionToken } = useUser();
  const { data, mutate } = useSWR(["user/focus-panel"], null);

  const setParam = async (key, value) => {
    mutate(
      (oldData) =>
        oldData.map((oldWidget) =>
          oldWidget.id === widget.id
            ? {
                ...widget,
                params: {
                  ...widget.params,
                  [key]: value,
                },
              }
            : oldWidget
        ),
      {
        revalidate: false,
      }
    );
    await sendApiRequest(
      sessionToken,
      "PUT",
      "user/focus-panel",
      {},
      {
        body: JSON.stringify({
          id: widget.id,
          params: {
            ...widget.params,
            [key]: value,
          },
        }),
      }
    );
  };

  const handleWidgetEdit = async (key, value) => {
    try {
      mutate(
        (oldData) =>
          oldData.map((w) => (w.id === widget.id ? { ...w, [key]: value } : w)),
        {
          revalidate: false,
        }
      );
      await sendApiRequest(
        sessionToken,
        "PUT",
        "user/focus-panel",
        {},
        {
          body: JSON.stringify({
            id: widget.id,
            [key]: value,
          }),
        }
      );
    } catch (e) {
      Toast.show({ type: "error" });
    }
  };

  const handlePin = async (widget) => {
    try {
      mutate(
        (oldData) =>
          oldData.map((w) =>
            w.id === widget.id ? { ...w, pinned: !w.pinned } : w
          ),
        {
          revalidate: false,
        }
      );
      await sendApiRequest(
        sessionToken,
        "PUT",
        "user/focus-panel",
        {},
        {
          body: JSON.stringify({
            id: widget.id,
            pinned: !widget.pinned,
          }),
        }
      );
    } catch (e) {
      Toast.show({ type: "error" });
    }
  };

  const menuActions = [
    {
      icon: "move_up",
      text: "Move up",
      disabled: index === 0,
      callback: () =>
        handleWidgetEdit(
          "order",
          index === 1
            ? LexoRank.parse(data[0].order).genPrev().toString()
            : // get 2 ranks before the current widget, and generate the next rank between them
              LexoRank.parse(data[index - 2].order)
                .between(LexoRank.parse(data[index - 1].order))
                .toString()
        ),
    },
    {
      icon: "move_down",
      text: "Move down",
      disabled: index === data.length - 1,
      callback: () =>
        handleWidgetEdit(
          "order",
          index === data.length - 2
            ? LexoRank.parse(data[data.length - 1].order)
                .genNext()
                .toString()
            : // get 2 ranks after the current widget, and generate the next rank between them
              LexoRank.parse(data[index + 1].order)
                .between(LexoRank.parse(data[index + 2].order))
                .toString()
        ),
    },
    // {
    //   icon: "remove_circle",
    //   text: "Remove",
    //   callback: handleDelete,
    // },
  ] as MenuOption[];

  switch (widget.type) {
    case "upcoming":
      return (
        <UpNext
          handlePin={() => handlePin(widget)}
          small={small}
          widget={widget}
          key={index}
          setParam={setParam}
          params={widget.params}
        />
      );
    case "quotes":
      return <Quotes menuActions={menuActions} widget={widget} key={index} />;
    case "clock":
      return (
        <Clock
          setParam={setParam}
          menuActions={menuActions}
          widget={widget}
          key={index}
        />
      );
    case "top stocks":
      return (
        <TopStocks
          handlePin={() => handlePin(widget)}
          widget={widget}
          key={index}
          small={small}
        />
      );
    case "weather":
      return (
        <WeatherWidget
          small={small}
          widget={widget}
          handlePin={() => handlePin(widget)}
          key={index}
        />
      );
    case "magic 8 ball":
      return (
        <Magic8Ball menuActions={menuActions} widget={widget} key={index} />
      );
    case "battery":
      return (
        <BatteryWidget menuActions={menuActions} widget={widget} key={index} />
      );
    case "recent activity":
      return <FriendActivity />;
    case "music":
      return (
        <Spotify
          setParam={setParam}
          widget={widget}
          handlePin={() => handlePin(widget)}
          small={small}
          key={index}
        />
      );
    case "word of the day":
      return (
        <WordOfTheDay
          small={small}
          widget={widget}
          handlePin={() => handlePin(widget)}
          key={index}
        />
      );
    case "randomizer":
      return (
        <Randomizer
          setParam={setParam}
          menuActions={menuActions}
          widget={widget}
          key={index}
        />
      );
    default:
      return null;
  }
}

export function Widgets() {
  const { data, error } = useSWR(["user/focus-panel"], null);

  return !Array.isArray(data) ? (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: 200,
      }}
    >
      <Spinner />
    </View>
  ) : error ? (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: 200,
      }}
    >
      <ErrorAlert />
    </View>
  ) : (
    data
      .sort(function (a, b) {
        if (a.order < b.order) return -1;
        if (a.order > b.order) return 1;
        return 0;
      })
      .map((widget, index) => (
        <RenderWidget key={index} index={index} widget={widget} />
      ))
  );
}

function Page() {
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <ContentWrapper noPaddingTop>
      <WindowTitle title="Home" />
      <Wrapper>
        <MenuButton gradient addInsets={!breakpoints.md} />
        <KeyboardAwareScrollView
          // refreshControl={<RefreshControl refreshing={false} />}
          onScrollBeginDrag={Keyboard.dismiss}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: Platform.OS === "web" ? 90 : insets.top,
          }}
        >
          <View
            style={{
              maxWidth: breakpoints.md ? 400 : undefined,
              width: "100%",
              paddingHorizontal: 30,
              gap: 30,
              marginHorizontal: "auto",
            }}
          >
            <View
              style={{
                alignItems: "center",
                marginTop: Platform.OS === "web" ? 0 : 110,
              }}
              aria-valuetext="home-logo"
            >
              <Logo size={64} />
              <Greeting />
              <TodayText />
            </View>
            <Actions />
            <StreakGoal />
            {/* <Tip
              key="CREATE_WIDGETS"
              icon="emoji_objects"
              title="Make home yours"
              description="Add widgets and customize your background"
            /> */}
            <Widgets />
            <CustomizeButton />
          </View>
        </KeyboardAwareScrollView>
      </Wrapper>
    </ContentWrapper>
  );
}

export default memo(Page);

