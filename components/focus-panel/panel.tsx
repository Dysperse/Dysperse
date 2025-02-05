import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuOption } from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import {
  NavigationContainer,
  NavigationContainerRef,
  NavigationIndependentTree,
  useNavigation,
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
import {
  AppState,
  Animated as NativeAnimated,
  Platform,
  useWindowDimensions,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { useFocusPanelContext } from "./context";
import ClockScreen from "./widgets/clock/screen";
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
          navigation={navigation}
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
  backgroundColor,
  foregroundColor,
  widgetId,
  options = [],
}: {
  title: string;
  backgroundColor?: string;
  foregroundColor?: string;
  widgetId?: string;
  options?: MenuOption[];
}) => {
  const navigation = useNavigation();
  const { setPanelState } = useFocusPanelContext();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const isDark = useDarkMode();

  const backgroundColors =
    title === "Focus"
      ? undefined
      : {
          default: "transparent",
          pressed: isDark ? "rgba(255,255,255,.1)" : "rgba(0, 0, 0, 0.1)",
          hovered: isDark ? "rgba(255,255,255,.2)" : "rgba(0, 0, 0, 0.2)",
        };

  return (
    <View
      style={{
        height: 70,
        flexDirection: title === "Focus" ? "row-reverse" : "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
        backgroundColor: backgroundColor || theme[2],
      }}
    >
      <IconButton
        onPress={() => {
          if (title !== "Focus") setPanelState("COLLAPSED");
          if (title === "Focus") {
            navigation.push("New");
          } else {
            navigation.goBack();
          }
        }}
        backgroundColors={backgroundColors}
        variant={
          title === "Focus" ? (breakpoints.md ? "filled" : "text") : "text"
        }
        iconProps={{ bold: true }}
        icon="west"
      />
      <Text
        style={{
          opacity: title === "Focus" ? 0 : 1,
          color: foregroundColor || theme[11],
          marginHorizontal: "auto",
          paddingRight: widgetId ? null : 30,
        }}
        weight={800}
      >
        {title}
      </Text>
      {widgetId && (
        <MenuPopover
          menuProps={{ rendererProps: { placement: "bottom" } }}
          containerStyle={{ marginLeft: -10 }}
          trigger={
            <IconButton
              backgroundColors={backgroundColors}
              icon="more_horiz"
              iconProps={{ bold: true }}
            />
          }
          options={[
            ...options,
            { text: "Remove widget", icon: "remove_circle" },
          ]}
        />
      )}
    </View>
  );
};

export const UpcomingSvg = () => {};

function PanelContent() {
  const theme = useColorTheme();
  const r = useRef<NavigationContainerRef<any>>(null);
  const { panelState } = useFocusPanelContext();
  const insets = useSafeAreaInsets();

  const screenOptions = useMemo<StackNavigationOptions>(
    () => ({
      ...TransitionPresets.ScaleFromCenterAndroid,
      detachPreviousScreen: false,
      headerShown: true,
      animation: "none",
      freezeOnBlur: true,
      gestureEnabled: false,
      headerMode: "screen",
      cardStyle: {
        height: "100%",
        width: panelState === "COLLAPSED" ? 85 : 290,
        marginVertical: 10,
        borderRadius: 25,
      },
      header: ({ navigation, route }) => null,
    }),
    [panelState]
  );

  const borderedCardStyle = {
    cardStyle: {
      ...(screenOptions.cardStyle as any),
      borderColor: theme[5],
      borderWidth: 2,
    },
  };

  const [panelKey, setPanelKey] = useState(0);

  return (
    <>
      <Animated.View
        key={panelKey}
        style={[
          {
            flex: 1,
            overflow: "hidden",
            backgroundColor: theme[2],
          },
        ]}
      >
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
              theme={{
                colors: {
                  background: "transparent",
                  card: theme[2],
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
                  options={{ cardStyle: { width: 86 } }}
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
                  options={borderedCardStyle}
                  component={WordOfTheDayScreen}
                />
                <Stack.Screen
                  name="Stocks"
                  options={borderedCardStyle}
                  component={TopStocksScreen}
                />
                <Stack.Screen
                  name="Clock"
                  options={borderedCardStyle}
                  component={ClockScreen}
                />
                <Stack.Screen
                  name="New"
                  options={borderedCardStyle}
                  component={NewWidget}
                />
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
  const { setPanelState, drawerRef } = useFocusPanelContext();
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();
  const { data } = useSWR(["user/focus-panel"], null);

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
              padding: 0,
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
                  fontSize: 13,
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
                  fontSize: 12,
                }}
              >
                Add widgets to {"\n"}customize your experience
              </Text>

              <IconButton
                variant="filled"
                onPress={() => {
                  navigation.push("New");
                  setPanelState("OPEN");
                }}
                icon="add"
              />
            </View>
          ) : (
            Array.isArray(data) && (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                  gap: 10,
                  paddingVertical: 8 + (breakpoints.md ? 0 : insets.bottom),
                  minHeight: "100%",
                }}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
                <Freeze freeze={shouldSuspendRendering}>
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
                  <IconButton
                    variant="filled"
                    onPress={() => {
                      navigation.push("New");
                      drawerRef.current.openDrawer();
                      setPanelState("OPEN");
                    }}
                    size="100%"
                    style={{ height: 40 }}
                    icon="add"
                  />
                  <IconButton
                    variant="filled"
                    onPress={() => {
                      drawerRef.current.closeDrawer();
                      setPanelState("CLOSED");
                    }}
                    size="100%"
                    style={{ height: 40 }}
                    icon="dock_to_left"
                  />
                </Freeze>
              </ScrollView>
            )
          )}
        </ScrollView>
      </Suspense>
    </>
  );
}

const FocusPanel = memo(function FocusPanel({
  progressValue,
}: {
  progressValue: any;
}) {
  const { panelState, setPanelState } = useFocusPanelContext();

  useHotkeys("\\", () =>
    setPanelState(panelState === "COLLAPSED" ? "CLOSED" : "COLLAPSED")
  );

  const pathname = usePathname();
  const breakpoints = useResponsiveBreakpoints();
  const { height, width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const transform = progressValue?.interpolate?.({
    inputRange: [0, 1],
    outputRange: breakpoints.md ? [0.9, 1] : [windowWidth / 10, 0],
  });

  return pathname.includes("settings") ? null : (
    <NativeAnimated.View
      style={[
        {
          flexDirection: "row",
          flex: 1,
          ...(Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any)),
        },
        {
          transform: [{ translateX: transform }],
        },
      ]}
    >
      <Animated.View
        style={[
          {
            paddingLeft: 0,
            width: "100%",
            height: "100%",
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
    </NativeAnimated.View>
  );
});

export default FocusPanel;
