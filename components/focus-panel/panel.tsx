import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { MenuOption } from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationOptions,
  StackNavigationProp,
  TransitionPresets,
} from "@react-navigation/stack";
import { useKeepAwake } from "expo-keep-awake";
import { usePathname } from "expo-router";
import { LexoRank } from "lexorank";
import { lazy, memo, Suspense, useEffect, useMemo, useRef } from "react";
import { Platform, Pressable, useWindowDimensions, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { useSidebarContext } from "../layout/sidebar/context";
import { useFocusPanelContext } from "./context";
import { NewWidget } from "./widgets/new";
import { FocusPanelSpotify } from "./widgets/spotify/FocusPanelSpotify";
import { FocusPanelWeather } from "./widgets/weather/modal";
import { WordOfTheDayScreen } from "./widgets/word-of-the-day/screen";

const Assistant = lazy(() => import("./widgets/Assistant"));
const Clock = lazy(() => import("./widgets/clock"));
const Quotes = lazy(() => import("./widgets/quotes"));
const Spotify = lazy(() => import("./widgets/spotify"));
const UpNext = lazy(() => import("./widgets/up-next"));
const WeatherWidget = lazy(() => import("./widgets/weather/widget"));
const WordOfTheDay = lazy(() => import("./widgets/word-of-the-day"));
const Randomizer = lazy(() => import("./widgets/randomizer"));

export type Widget =
  | "upcoming"
  | "weather"
  | "clock"
  | "assistant"
  | "music"
  | "quotes"
  | "word of the day";

export const WakeLock = () => {
  useKeepAwake();
  return null;
};

export const ImportantChip = () => {
  const orange = useColor("orange");
  return (
    <Chip
      dense
      disabled
      label="Urgent"
      icon={
        <Icon size={22} style={{ color: orange[11] }}>
          priority_high
        </Icon>
      }
      style={{ backgroundColor: orange[4] }}
      color={orange[11]}
    />
  );
};

function RenderWidget({ navigation, widget, index }) {
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

  const handleDelete = async () => {
    try {
      mutate((oldData) => oldData.filter((w) => w.id !== widget.id));
      sendApiRequest(sessionToken, "DELETE", "user/focus-panel", {
        id: widget.id,
      });
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
    {
      icon: "remove_circle",
      text: "Remove",
      callback: handleDelete,
    },
  ] as MenuOption[];

  switch (widget.type) {
    case "upcoming":
      return <UpNext menuActions={menuActions} widget={widget} key={index} />;
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
    case "weather":
      return (
        <WeatherWidget
          navigation={navigation}
          menuActions={menuActions}
          widget={widget}
          key={index}
        />
      );
    case "assistant":
      return (
        <Assistant menuActions={menuActions} widget={widget} key={index} />
      );
    case "music":
      return (
        <Spotify
          navigation={navigation}
          menuActions={menuActions}
          params={widget}
          key={index}
        />
      );
    case "word of the day":
      return (
        <WordOfTheDay
          navigation={navigation}
          menuActions={menuActions}
          params={widget}
          key={index}
        />
      );
    case "randomizer":
      return (
        <Randomizer
          setParam={setParam}
          navigation={navigation}
          menuActions={menuActions}
          widget={widget}
          key={index}
        />
      );
    default:
      return null;
  }
}

const Stack = createStackNavigator();

export const Navbar = ({
  title,
  navigation,
  backgroundColor,
  foregroundColor,
}: {
  title: string;
  navigation: StackNavigationProp<any>;
  backgroundColor?: string;
  foregroundColor?: string;
}) => {
  const { setPanelState, panelState, collapseOnBack } = useFocusPanelContext();
  const { sidebarRef } = useSidebarContext();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const isDark = useDarkMode();

  return (
    <View
      style={{
        height: 70,
        flexDirection: title === "Focus" ? "row-reverse" : "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
        backgroundColor:
          backgroundColor || theme[panelState === "COLLAPSED" ? 2 : 1],
      }}
    >
      <IconButton
        onPress={() => {
          if (collapseOnBack.current && title !== "Focus")
            setPanelState("COLLAPSED");
          if (title === "Focus") {
            navigation.push("New");
          } else {
            navigation.goBack();
          }
        }}
        backgroundColors={
          title === "Focus"
            ? undefined
            : {
                default: "transparent",
                pressed: isDark ? "rgba(255,255,255,.1)" : "rgba(0, 0, 0, 0.1)",
                hovered: isDark ? "rgba(255,255,255,.2)" : "rgba(0, 0, 0, 0.2)",
              }
        }
        size={!breakpoints.md ? 50 : 40}
        variant={
          title === "Focus" ? (breakpoints.md ? "filled" : "text") : "text"
        }
        icon={
          <Icon
            style={{
              color: foregroundColor || theme[11],
            }}
          >
            {title === "Focus" ? "add" : "arrow_back_ios_new"}
          </Icon>
        }
        style={{
          opacity: navigation.canGoBack() || title === "Focus" ? 1 : 0,
        }}
      />
      <Text
        style={{
          fontSize: 20,
          opacity: title === "Focus" ? 0 : 1,
          color: foregroundColor || theme[11],
        }}
        weight={800}
      >
        {title}
      </Text>
      {breakpoints.md ? (
        <IconButton
          onPress={() => {
            setPanelState((t) => {
              const d = t === "COLLAPSED" ? "OPEN" : "COLLAPSED";
              collapseOnBack.current = d === "COLLAPSED";
              return d;
            });
          }}
          icon="right_panel_close"
          size={!breakpoints.md ? 50 : 40}
          style={{
            padding: 10,
            marginBottom: 0,
            opacity: title === "Focus" ? 1 : 0,
            marginRight: 0,
          }}
        />
      ) : (
        <IconButton
          icon="menu"
          variant="outlined"
          onPress={() => sidebarRef.current.openDrawer()}
        />
      )}
    </View>
  );
};

export const UpcomingSvg = () => {
  const theme = useColorTheme();
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1}
      width={24}
      height={24}
      stroke={theme[11]}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
      />
    </Svg>
  );
};

export const SpotifySvg = () => {
  return (
    <Svg
      height={24}
      width={24}
      viewBox="-33.4974 -55.829 290.3108 334.974"
      style={{ transform: [{ scale: 1.5 }] }}
    >
      <Path
        d="M177.707 98.987c-35.992-21.375-95.36-23.34-129.719-12.912-5.519 1.674-11.353-1.44-13.024-6.958-1.672-5.521 1.439-11.352 6.96-13.029 39.443-11.972 105.008-9.66 146.443 14.936 4.964 2.947 6.59 9.356 3.649 14.31-2.944 4.963-9.359 6.6-14.31 3.653m-1.178 31.658c-2.525 4.098-7.883 5.383-11.975 2.867-30.005-18.444-75.762-23.788-111.262-13.012-4.603 1.39-9.466-1.204-10.864-5.8a8.717 8.717 0 015.805-10.856c40.553-12.307 90.968-6.347 125.432 14.833 4.092 2.52 5.38 7.88 2.864 11.968m-13.663 30.404a6.954 6.954 0 01-9.569 2.316c-26.22-16.025-59.223-19.644-98.09-10.766a6.955 6.955 0 01-8.331-5.232 6.95 6.95 0 015.233-8.334c42.533-9.722 79.017-5.538 108.448 12.446a6.96 6.96 0 012.31 9.57M111.656 0C49.992 0 0 49.99 0 111.656c0 61.672 49.992 111.66 111.657 111.66 61.668 0 111.659-49.988 111.659-111.66C223.316 49.991 173.326 0 111.657 0"
        fill={"#1DB954"}
      />
    </Svg>
  );
};

function PanelContent() {
  const theme = useColorTheme();
  const r = useRef<NavigationContainerRef<any>>(null);
  const breakpoints = useResponsiveBreakpoints();
  const { panelState, collapseOnBack, setPanelState } = useFocusPanelContext();
  const { width } = useWindowDimensions();

  const opacity = useSharedValue(breakpoints.md ? 2 : 0);
  const opacityStyle = useAnimatedStyle(() => ({
    opacity: withSpring(opacity.value, { overshootClamping: true }),
  }));

  const screenOptions = useMemo<StackNavigationOptions>(
    () => ({
      ...TransitionPresets.ScaleFromCenterAndroid,
      detachPreviousScreen: false,
      headerShown: true,
      freezeOnBlur: true,
      gestureEnabled: false,
      headerMode: "screen",
      cardStyle: {
        height: "100%",
        width: breakpoints.md
          ? panelState === "COLLAPSED"
            ? 85
            : 340
          : "100%",
        borderRadius: breakpoints.md ? 18 : 0,
        display: panelState === "CLOSED" ? "none" : "flex",
      },
      header:
        panelState === "COLLAPSED"
          ? () => null
          : ({ navigation, route }) => (
              <Navbar title={route.name} navigation={navigation} />
            ),
    }),
    [panelState, breakpoints]
  );

  return (
    <Animated.View
      style={[
        {
          borderRadius: breakpoints.md ? 20 : 0,
          flex: 1,
          overflow: panelState === "COLLAPSED" ? "visible" : "hidden",
        },
        !breakpoints.md && { width: width },
      ]}
    >
      <Animated.View
        style={[
          opacityStyle,
          {
            position: "absolute",
            width: "100%",
            height: "100%",
            borderWidth: 2,
            borderColor: theme[panelState === "COLLAPSED" ? 2 : 5],
            zIndex: 99,
            borderRadius: 20,
            pointerEvents: "none",
          },
        ]}
      />
      <WakeLock />
      <NavigationContainer
        ref={r}
        documentTitle={{ enabled: false }}
        independent={true}
        onStateChange={(state) => {
          const currentRouteName = state.routes[state.index].name;
          if (
            currentRouteName === "New" ||
            currentRouteName === "Focus" ||
            currentRouteName === "Word of the day"
          ) {
            opacity.value = breakpoints.md ? 1 : 0;
          } else {
            opacity.value = 0;
          }
        }}
        theme={{
          colors: {
            background: theme[panelState === "COLLAPSED" ? 2 : 1],
            card: theme[panelState === "COLLAPSED" ? 2 : 1],
            primary: theme[1],
            border: theme[6],
            text: theme[11],
            notification: theme[9],
          },
          dark: true,
        }}
      >
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen
            name="Focus"
            options={{
              cardStyle: {
                paddingHorizontal: 2,
                width: panelState === "COLLAPSED" ? 85 : 340,
              },
            }}
            component={FocusPanelHome}
          />
          <Stack.Screen
            name="Weather"
            component={FocusPanelWeather}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Spotify"
            component={FocusPanelSpotify}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Word of the day" component={WordOfTheDayScreen} />
          <Stack.Screen name="New" component={NewWidget} />
        </Stack.Navigator>
      </NavigationContainer>
      {panelState === "COLLAPSED" && (
        <IconButton
          onPress={() => {
            setPanelState("OPEN");
            collapseOnBack.current = false;
          }}
          icon="right_panel_open"
          size={85}
          style={{ height: 40, opacity: 0.6, marginBottom: 5 }}
        />
      )}
    </Animated.View>
  );
}

function FocusPanelHome({
  navigation,
}: {
  navigation: StackNavigationProp<any>;
}) {
  const theme = useColorTheme();
  const { data } = useSWR(["user/focus-panel"], null);
  const { panelState } = useFocusPanelContext();

  return (
    <>
      <Suspense
        fallback={
          <View
            style={{
              marginHorizontal: "auto",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spinner />
          </View>
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={[
            {
              flex: 1,
              padding: panelState === "COLLAPSED" ? 0 : 20,
              paddingTop: 2,
            },
          ]}
        >
          {!data ? (
            <View style={{ marginHorizontal: "auto" }}>
              <Spinner />
            </View>
          ) : data.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                maxWidth: 250,
                marginHorizontal: "auto",
                gap: 5,
              }}
            >
              <Text style={{ textAlign: "center" }} variant="eyebrow">
                This is the focus panel
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  color: theme[11],
                  opacity: 0.45,
                }}
              >
                Here, you can add widgets to enhance & supercharge your
                productivity
              </Text>
            </View>
          ) : (
            Array.isArray(data) && (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                  gap: panelState === "COLLAPSED" ? 10 : 20,
                  minHeight: "100%",
                  paddingBottom: panelState === "COLLAPSED" ? 0 : 20,
                }}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
                {data
                  .sort(function (a, b) {
                    if (a.order < b.order) return -1;
                    if (a.order > b.order) return 1;
                    return 0;
                  })
                  .map((widget, index) => (
                    <RenderWidget
                      navigation={navigation}
                      key={index}
                      index={index}
                      widget={widget}
                    />
                  ))}
              </ScrollView>
            )
          )}
        </ScrollView>
      </Suspense>
    </>
  );
}
export function PanelSwipeTrigger({
  side = "right",
}: {
  side?: "left" | "right";
}) {
  const theme = useColorTheme();
  const width = useSharedValue(10);
  const pathname = usePathname();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(width.value, { damping: 30, stiffness: 400 }),
    };
  });

  const dotStyle = useAnimatedStyle(() => ({
    height: withSpring(width.value == 15 ? 30 : 20, {
      damping: 30,
      stiffness: 400,
    }),
  }));

  const isPullerActive = useSharedValue(0);
  const isPullerHovered = useSharedValue(0);

  const pullerStyles = useAnimatedStyle(() => ({
    width: withSpring(isPullerActive.value ? 11 : 7, {
      damping: 30,
      stiffness: 400,
    }),
    backgroundColor: withSpring(
      theme[
        !isPullerActive.value
          ? isPullerHovered.value
            ? 5
            : 2
          : isPullerHovered.value
          ? 6
          : 5
      ],
      {
        damping: 30,
        stiffness: 400,
      }
    ),
  }));

  let t: any = null;

  const onPressIn = () => {
    width.value = 15;
    isPullerActive.value = 1;
  };

  const onPressOut = () => {
    width.value = 10;
    isPullerActive.value = 0;
  };

  const onHoverIn = () => {
    isPullerHovered.value = 1;
    t = setTimeout(() => {
      width.value = 15;
    }, 500);
  };

  const onHoverOut = () => {
    if (t) clearTimeout(t);
    isPullerHovered.value = 0;
    width.value = 10;
  };

  return (
    <Pressable
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        {
          shadowRadius: 0,
          height: "100%",
          paddingHorizontal: 15,
          justifyContent: "center",
          zIndex: 1,
        },
        Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
        side === "left"
          ? { marginHorizontal: -17, marginRight: -25 }
          : { marginHorizontal: -15, marginLeft: -25 },
      ]}
    >
      <Animated.View
        style={[
          animatedStyle,
          { alignItems: "center", paddingVertical: 20 },
          pathname.includes("settings") && { display: "none" },
        ]}
      >
        <Animated.View
          style={[
            pullerStyles,
            dotStyle,
            {
              backgroundColor: theme[4],
              width: 5,
              borderRadius: 99,
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const FocusPanel = memo(function FocusPanel() {
  const { panelState, setPanelState } = useFocusPanelContext();
  const marginRight = useSharedValue(-350);
  const width = useSharedValue(350);

  useHotkeys("\\", () =>
    setPanelState(panelState === "OPEN" ? "CLOSED" : "OPEN")
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      marginRight: withSpring(marginRight.value, {
        stiffness: 200,
        damping: 30,
        overshootClamping: true,
      }),
      width: withSpring(width.value, {
        stiffness: 200,
        damping: 30,
        overshootClamping: true,
      }),
    };
  });

  useEffect(() => {
    marginRight.value = panelState === "CLOSED" ? -350 : 0;
  }, [panelState, marginRight]);

  const pan = Gesture.Pan()
    .onChange(({ changeX }) => {
      const maxMargin = 350;
      marginRight.value = Math.max(
        -maxMargin,
        Math.min(marginRight.value - changeX, 0)
      );
    })
    .onEnd(({ velocityX }) => {
      marginRight.value = velocityX > 0 ? -350 : 0;
      setPanelState(velocityX > 0 ? "OPEN" : "CLOSED");
    });

  const tap = Gesture.Tap().onEnd(() =>
    setPanelState((t) => (t === "OPEN" ? "CLOSED" : "OPEN"))
  );

  const pathname = usePathname();
  const breakpoints = useResponsiveBreakpoints();
  const { height } = useWindowDimensions();

  useEffect(() => {
    width.value = panelState === "COLLAPSED" ? 100 : 350;
  }, [panelState, width]);

  return pathname.includes("settings") ? null : (
    <View
      style={{
        flexDirection: "row",
        height,
        ...(Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any)),
      }}
    >
      {breakpoints.md && (
        <GestureDetector gesture={pan}>
          <GestureDetector gesture={tap}>
            <PanelSwipeTrigger />
          </GestureDetector>
        </GestureDetector>
      )}
      <Animated.View
        style={[
          animatedStyle,
          {
            padding: breakpoints.md ? 10 : 0,
            paddingLeft: 0,
            height,
            ...(!breakpoints.md && { width }),
            ...(Platform.OS === "web" &&
              ({
                marginTop: "env(titlebar-area-height,0)",
                height: "calc(100vh - env(titlebar-area-height,0))",
              } as any)),
          },
        ]}
      >
        <PanelContent />
      </Animated.View>
    </View>
  );
});

export default FocusPanel;
