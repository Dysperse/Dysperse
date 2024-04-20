import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Alert from "@/ui/Alert";
import Chip from "@/ui/Chip";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { CrimsonPro_800ExtraBold } from "@expo-google-fonts/crimson-pro";
import { useFonts } from "expo-font";
import { useKeepAwake } from "expo-keep-awake";
import { usePathname } from "expo-router";
import { Fragment, memo, useEffect, useState } from "react";
import { Platform, Pressable, View, useWindowDimensions } from "react-native";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import ContentWrapper from "../layout/content";
import {
  FocusPanelWidgetProvider,
  useFocusPanelContext,
  useFocusPanelWidgetContext,
} from "./context";
import { WidgetMenu } from "./menu";
import { Assistant } from "./widgets/Assistant";
import { Clock } from "./widgets/clock";
import { UpNext } from "./widgets/UpNext";
import { WeatherWidget } from "./widgets/weather/widget";
import { widgetStyles } from "./widgetStyles";

export type Widget = "upcoming" | "weather" | "clock" | "assistant" | "music";

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

const Music = () => {
  return (
    <View>
      <Text variant="eyebrow">Music</Text>
      <Alert
        style={{ marginTop: 10 }}
        title="Coming soon"
        emoji="1f6a7"
        subtitle="We're working on this widget - stay tuned!"
      />
    </View>
  );
};

function Quotes() {
  const { data, mutate, error } = useSWR(
    [``, {}, "https://api.quotable.io/random"],
    null,
    {
      refreshInterval: 1000 * 60 * 60,
    }
  );

  const [refreshed, setRefreshed] = useState(false);

  const [_, fontsError] = useFonts({
    serifText: CrimsonPro_800ExtraBold,
  });

  const handleRefresh = () => {
    if (!refreshed) {
      setRefreshed(true);
      Toast.show({ type: "info", text1: "Quotes refresh every hour" });
    }
    mutate();
  };
  const theme = useColorTheme();

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingRight: 10,
          marginBottom: 10,
        }}
      >
        <Text variant="eyebrow">Quotes</Text>
        <IconButton
          size={30}
          style={{ marginTop: -4 }}
          icon="refresh"
          onPress={handleRefresh}
        />
      </View>
      {(error || fontsError) && <ErrorAlert />}
      <View
        style={[
          widgetStyles.card,
          {
            backgroundColor: theme[3],
            borderWidth: 1,
            borderColor: theme[6],
          },
        ]}
      >
        <Text
          style={{
            fontSize: data.container > 100 ? 25 : 35,
            fontFamily: "serifText",
          }}
        >
          &ldquo;{data?.content}&rdquo;
        </Text>
        <Text style={{ marginTop: 10, opacity: 0.6 }} weight={600}>
          &mdash; {data?.author}
        </Text>
      </View>
    </View>
  );
}

function PanelContent() {
  const theme = useColorTheme();
  const { isFocused } = useFocusPanelContext();
  const { widgets, setWidgets } = useFocusPanelWidgetContext();

  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const Wrapper = breakpoints.md
    ? Fragment
    : ({ children }) => (
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: theme[1],
            zIndex: 9999,
            width: width,
            height: "100%",
          }}
        >
          {children}
        </View>
      );

  return (
    <Wrapper>
      <ContentWrapper
        noPaddingTop={!breakpoints.md}
        style={{
          position: "relative",
          maxHeight: height - 20,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingTop: insets.top + 20,
          }}
          centerContent
        >
          {isFocused && (
            <>
              {widgets.length === 0 ? (
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
                      opacity: 0.6,
                    }}
                  >
                    Here, you can add widgets to enhance & supercharge your
                    productivity
                  </Text>
                </View>
              ) : (
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{
                    gap: 5,
                    paddingTop: 80,
                    minHeight: "100%",
                  }}
                >
                  {widgets.includes("upcoming") && <UpNext />}
                  {widgets.includes("quotes") && <Quotes />}
                  {widgets.includes("clock") && <Clock />}
                  {widgets.includes("weather") && <WeatherWidget />}
                  {widgets.includes("assistant") && <Assistant />}
                  {widgets.includes("music") && <Music />}
                </ScrollView>
              )}
              <WidgetMenu widgets={widgets} setWidgets={setWidgets} />
            </>
          )}
        </ScrollView>
      </ContentWrapper>
    </Wrapper>
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
  const { isFocused, setFocus } = useFocusPanelContext();
  const marginRight = useSharedValue(-350);

  useHotkeys("\\", () => setFocus(!isFocused), {}, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      marginRight: withSpring(marginRight.value, {
        damping: 30,
        stiffness: 400,
      }),
    };
  });

  useEffect(() => {
    marginRight.value = isFocused ? 0 : -350;
  }, [isFocused, marginRight]);

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
      setFocus(velocityX <= 0);
    });

  const tap = Gesture.Tap().onEnd(() => setFocus(!isFocused));
  const pathname = usePathname();
  const breakpoints = useResponsiveBreakpoints();

  return pathname.includes("settings") ? null : (
    <>
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
            padding: 10,
            paddingLeft: 0,
            width: 350,
            ...(Platform.OS === "web" &&
              ({
                marginTop: "env(titlebar-area-height,0)",
              } as any)),
          },
        ]}
      >
        <FocusPanelWidgetProvider>
          <PanelContent />
        </FocusPanelWidgetProvider>
      </Animated.View>
    </>
  );
});

export default FocusPanel;
