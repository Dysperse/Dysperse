import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuOption } from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ErrorBoundary } from "@sentry/react-native";
import { usePathname } from "expo-router";
import { memo, useEffect, useImperativeHandle, useState } from "react";
import { Freeze } from "react-freeze";
import {
  AppState,
  Animated as NativeAnimated,
  Platform,
  useWindowDimensions,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { useFocusPanelContext } from "./context";

export type Widget =
  | "upcoming"
  | "weather"
  | "clock"
  | "music"
  | "quotes"
  | "word of the day";

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

const Stack = createStackNavigator();

export const Navbar = ({
  title,
  backgroundColor,
  foregroundColor,
  widgetId,
  options = [],
  bgcolors,
}: {
  title: string;
  backgroundColor?: string;
  foregroundColor?: string;
  widgetId?: string;
  options?: MenuOption[];
  bgcolors?: any;
}) => {
  const navigation = useNavigation();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const isDark = useDarkMode();

  const { mutate } = useSWR(["user/focus-panel"], null);
  const { sessionToken } = useUser();

  const handleDelete = async () => {
    try {
      mutate((oldData) => oldData.filter((w) => w.id !== widgetId));
      sendApiRequest(sessionToken, "DELETE", "user/focus-panel", {
        id: widgetId,
      });
    } catch (e) {
      Toast.show({ type: "error" });
    }
  };

  const backgroundColors =
    typeof bgcolors === "undefined"
      ? bgcolors
      : title === "Focus"
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
            {
              icon: "remove_circle",
              text: "Remove widget",
              callback: handleDelete,
            },
          ]}
        />
      )}
    </View>
  );
};

export const UpcomingSvg = () => {};

function PanelContent({ focusPanelFreezerRef }) {
  const theme = useColorTheme();
  const { activeWidget } = useFocusPanelContext();
  const [panelKey, setPanelKey] = useState(0);
  const [shouldSuspendRendering, setShouldSuspendRendering] = useState(false);

  const { data, mutate } = useSWR(["user/focus-panel"], null);
  const widget = data?.find((w) => w.id === activeWidget);

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

  useImperativeHandle(focusPanelFreezerRef, () => ({
    setFreeze: (t) => setShouldSuspendRendering(t),
  }));

  const content = (
    <View
      style={{ marginTop: 16, flex: 1, paddingRight: 15, paddingLeft: 5 }}
    ></View>
  );

  /**
   *       <Stack.Screen
                  name="Focus"
                  options={{ cardStyle: { width: 86 } }}
                  component={() => <></>}
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
   */

  return (
    <Freeze
      freeze={shouldSuspendRendering}
      placeholder={
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme[2],
            borderRadius: 30,
            marginRight: 10,
            // borderWidth: 2,
            // borderColor: theme[5],
          }}
        >
          <Spinner />
        </View>
      }
    >
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
          {content}
        </ErrorBoundary>
      </Animated.View>
    </Freeze>
  );
}

const FocusPanel = memo(function FocusPanel({
  progressValue,
  focusPanelFreezerRef,
}: {
  progressValue: any;
  focusPanelFreezerRef: any;
}) {
  const pathname = usePathname();
  const breakpoints = useResponsiveBreakpoints();
  const { width: windowWidth } = useWindowDimensions();
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
        !breakpoints.md && {
          marginTop: insets.top,
          marginBottom: insets.bottom,
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
        <PanelContent focusPanelFreezerRef={focusPanelFreezerRef} />
      </Animated.View>
    </NativeAnimated.View>
  );
});

export default FocusPanel;

