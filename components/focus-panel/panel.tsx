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
  NavigationIndependentTree,
} from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationOptions,
  StackNavigationProp,
  TransitionPresets,
} from "@react-navigation/stack";
import { ErrorBoundary } from "@sentry/react-native";
import { useKeepAwake } from "expo-keep-awake";
import { usePathname } from "expo-router";
import { LexoRank } from "lexorank";
import {
  lazy,
  memo,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Freeze } from "react-freeze";
import { AppState, Platform, useWindowDimensions, View } from "react-native";
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
import MenuIcon from "../menuIcon";
import PanelSwipeTrigger from "./PanelSwipeTrigger";
import { useFocusPanelContext } from "./context";
import { NewWidget } from "./widgets/new";
import { FocusPanelSpotify } from "./widgets/spotify/FocusPanelSpotify";
import TopStocksScreen from "./widgets/top-stocks/screen";
import { FocusPanelWeather } from "./widgets/weather/modal";
import { WordOfTheDayScreen } from "./widgets/word-of-the-day/screen";

const Magic8Ball = lazy(() => import("./widgets/magic-8-ball"));
const Clock = lazy(() => import("./widgets/clock"));
const Quotes = lazy(() => import("./widgets/quotes"));
const Spotify = lazy(() => import("./widgets/spotify"));
const UpNext = lazy(() => import("./widgets/up-next"));
const BatteryWidget = lazy(() => import("./widgets/battery"));
const TopStocks = lazy(() => import("./widgets/top-stocks"));
const WeatherWidget = lazy(() => import("./widgets/weather/widget"));
const WordOfTheDay = lazy(() => import("./widgets/word-of-the-day"));
const Randomizer = lazy(() => import("./widgets/randomizer"));

export type Widget =
  | "upcoming"
  | "weather"
  | "clock"
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
    case "top stocks":
      return (
        <TopStocks
          navigation={navigation}
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
    case "magic 8 ball":
      return (
        <Magic8Ball
          navigation={navigation}
          menuActions={menuActions}
          widget={widget}
          key={index}
        />
      );
    case "battery":
      return (
        <BatteryWidget
          navigation={navigation}
          menuActions={menuActions}
          widget={widget}
          key={index}
        />
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
          icon="collapse_content"
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
          icon={<MenuIcon />}
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

  const [panelKey, setPanelKey] = useState(0);

  return (
    <>
      <Animated.View
        key={panelKey}
        style={[
          {
            borderRadius: breakpoints.md ? 20 : 0,
            flex: 1,
            overflow: "hidden",
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
        {process.env.NODE_ENV !== "development" && <WakeLock />}
        <ErrorBoundary
          showDialog
          fallback={
            <View
              style={{
                alignItems: "center",
                gap: 10,
                flex: 1,
                justifyContent: "center",
                padding: 10,
              }}
            >
              <Icon size={40}>heart_broken</Icon>
              <Text
                weight={900}
                style={{ color: theme[11], textAlign: "center" }}
              >
                Looks like the focus panel crashed, and our team has been
                notified.
              </Text>
              <IconButton
                onPress={() => setPanelKey((t) => t + 1)}
                icon="refresh"
                variant="filled"
              />
            </View>
          }
        >
          <NavigationIndependentTree>
            <NavigationContainer
              ref={r}
              documentTitle={{ enabled: false }}
              independent={true}
              onStateChange={(state) => {
                const currentRouteName = state.routes[state.index].name;
                if (
                  currentRouteName === "New" ||
                  currentRouteName === "Focus" ||
                  currentRouteName === "Word of the day" ||
                  currentRouteName === "Stocks"
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
              <Stack.Navigator id={undefined} screenOptions={screenOptions}>
                <Stack.Screen
                  name="Focus"
                  options={{
                    cardStyle: {
                      paddingHorizontal: 2,
                      width: breakpoints.md
                        ? panelState === "COLLAPSED"
                          ? 85
                          : 340
                        : "100%",
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
                <Stack.Screen
                  name="Word of the day"
                  component={WordOfTheDayScreen}
                />
                <Stack.Screen name="Stocks" component={TopStocksScreen} />
                <Stack.Screen name="New" component={NewWidget} />
              </Stack.Navigator>
            </NavigationContainer>
          </NavigationIndependentTree>
        </ErrorBoundary>
      </Animated.View>
    </>
  );
}

function FocusPanelHome({
  navigation,
}: {
  navigation: StackNavigationProp<any>;
}) {
  const theme = useColorTheme();
  const { data } = useSWR(["user/focus-panel"], null);
  const { panelState, setPanelState } = useFocusPanelContext();

  const [shouldSuspendRendering, setShouldSuspendRendering] = useState(false);

  useEffect(() => {
    const appState = AppState.currentState;

    const t = (nextAppState) => {
      setShouldSuspendRendering(
        nextAppState === "background" || nextAppState === "inactive"
      );
      console.log(nextAppState === "background" || nextAppState === "inactive");
    };

    t(appState);

    const s = AppState.addEventListener("change", t);

    return () => {
      s.remove();
    };
  }, []);

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
          centerContent={data?.length === 0 || !data}
        >
          {!data ? (
            <View style={{ marginHorizontal: "auto" }}>
              <Spinner />
            </View>
          ) : data?.length === 0 ? (
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
              <Text
                style={{
                  textAlign: "center",
                  fontSize: panelState === "COLLAPSED" ? 13 : undefined,
                }}
                variant="eyebrow"
              >
                This is the focus panel
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  color: theme[11],
                  opacity: 0.45,
                  fontSize: panelState === "COLLAPSED" ? 12 : undefined,
                }}
              >
                Add widgets to {"\n"}customize your experience
              </Text>

              {panelState === "COLLAPSED" && (
                <IconButton
                  variant="filled"
                  onPress={() => {
                    navigation.push("New");
                    setPanelState("OPEN");
                  }}
                  icon="add"
                />
              )}
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
                <Freeze
                  freeze={shouldSuspendRendering || panelState === "CLOSED"}
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
                </Freeze>
              </ScrollView>
            )
          )}
        </ScrollView>
      </Suspense>
    </>
  );
}

const FocusPanel = memo(function FocusPanel() {
  const { panelState, setPanelState } = useFocusPanelContext();
  const marginRight = useSharedValue(panelState === "CLOSED" ? -350 : 0);
  const width = useSharedValue(panelState === "COLLAPSED" ? 100 : 350);

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

