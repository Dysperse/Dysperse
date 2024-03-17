import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { usePathname } from "expo-router";
import { Fragment, memo, useEffect } from "react";
import { Platform, Pressable, View } from "react-native";
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
import { Path, Svg } from "react-native-svg";
import { Clock } from "../home/clock";
import { WeatherWidget } from "../home/weather/widget";
import { ContentWrapper } from "../layout/content";
import {
  FocusPanelWidgetProvider,
  useFocusPanelContext,
  useFocusPanelWidgetContext,
} from "./context";

type Widget = "upcoming" | "weather" | "clock" | "assistant" | "music";

function WidgetBar({ widgets, setWidgets }) {
  const theme = useColorTheme();
  const { setFocus } = useFocusPanelContext();

  const handleWidgetToggle = (widget: Widget) => {
    setWidgets((widgets) => {
      if (widgets.includes(widget)) {
        return widgets.filter((w) => w !== widget);
      } else {
        return [...widgets, widget];
      }
    });
  };

  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        padding: 10,
        paddingTop: 10 + insets.top,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: theme[3],
      }}
    >
      {!breakpoints.md && (
        <>
          <IconButton
            onPress={() => setFocus(false)}
            variant={breakpoints.md ? "filled" : "text"}
            style={{
              width: 60,
              opacity: 0.6,
            }}
          >
            <Icon>west</Icon>
          </IconButton>
          <Text
            style={{
              color: theme[11],
              marginLeft: "auto",
              marginRight: "auto",
              opacity: 0.7,
              fontSize: 20,
            }}
            weight={200}
          >
            Focus
          </Text>
        </>
      )}
      <MenuPopover
        containerStyle={{
          marginLeft: -15,
        }}
        trigger={
          <IconButton
            variant="filled"
            style={{
              width: 60,
            }}
          >
            <Icon>add</Icon>
          </IconButton>
        }
        options={[
          {
            text: "Upcoming",
            renderer: () => (
              <MenuItem>
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
                <Text variant="menuItem">Up next</Text>
              </MenuItem>
            ),
          },
          { text: "Weather", icon: "wb_sunny" },
          { text: "Clock", icon: "timer" },
          { text: "Assistant", icon: "auto_awesome" },
          { text: "Music", icon: "music_note" },
        ].map((i) => ({
          ...i,
          selected: widgets.includes(i.text.toLowerCase()),
          callback: () => handleWidgetToggle((i.text as any).toLowerCase()),
        }))}
      />
    </View>
  );
}

function PanelContent() {
  const theme = useColorTheme();
  const { isFocused } = useFocusPanelContext();
  const { widgets, setWidgets } = useFocusPanelWidgetContext();

  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();

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
            width: "100%",
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
          padding: 20,
          paddingTop: insets.top + 20,
          position: "relative",
        }}
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
                  gap: 20,
                  paddingTop: 80,
                  minHeight: "100%",
                }}
              >
                {widgets.includes("clock") && <Clock />}
                {widgets.includes("weather") && <WeatherWidget />}
              </ScrollView>
            )}
            <WidgetBar widgets={widgets} setWidgets={setWidgets} />
          </>
        )}
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

  const breakpoints = useResponsiveBreakpoints();
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
  return pathname.includes("settings") ? null : (
    <>
      <GestureDetector gesture={pan}>
        <GestureDetector gesture={tap}>
          <PanelSwipeTrigger />
        </GestureDetector>
      </GestureDetector>

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
