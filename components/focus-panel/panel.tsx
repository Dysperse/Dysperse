import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import IconButton from "@/ui/IconButton";
import { useColorTheme } from "@/ui/color/theme-provider";
import { memo, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
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
import { Path, Svg } from "react-native-svg";
import { Clock } from "../home/clock";
import { WeatherWidget } from "../home/weather/widget";
import { ContentWrapper } from "../layout/content";
import { useFocusPanelContext } from "./context";

type Widget = "upcoming" | "weather" | "clock" | "assistant" | "music";

function WidgetBar({ widgets, setWidgets }) {
  const theme = useColorTheme();

  const handleWidgetToggle = (widget: Widget) => {
    setWidgets((widgets) => {
      if (widgets.includes(widget)) {
        return widgets.filter((w) => w !== widget);
      } else {
        return [...widgets, widget];
      }
    });
  };

  return (
    <View
      style={{
        backgroundColor: theme[3],
        height: 50,
        width: "100%",
        borderRadius: 20,
        marginBottom: 25,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <IconButton
        onPress={() => handleWidgetToggle("upcoming")}
        style={widgets.includes("upcoming") && { backgroundColor: theme[6] }}
      >
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
      </IconButton>
      {[
        { icon: "wb_sunny", widget: "weather" },
        { icon: "timer", widget: "clock" },
        { icon: "auto_awesome", widget: "assistant" },
        { icon: "music_note", widget: "music" },
      ].map(({ icon, widget }) => (
        <IconButton
          key={widget}
          onPress={() => handleWidgetToggle(widget as any)}
          style={widgets.includes(widget) && { backgroundColor: theme[6] }}
          icon={icon}
        />
      ))}
    </View>
  );
}

function PanelContent() {
  const { isFocused } = useFocusPanelContext();
  const [widgets, setWidgets] = useState<Widget[]>(
    Platform.OS === "web"
      ? Array.from(JSON.parse(localStorage.getItem("widgets") || "[]"))
      : []
  );

  useEffect(() => {
    if (Platform.OS === "web") {
      localStorage.setItem("widgets", JSON.stringify(widgets));
    }
  }, [widgets]);

  return (
    <ContentWrapper
      style={{
        padding: 20,
      }}
    >
      {isFocused && (
        <>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 20 }}>
            {widgets.includes("clock") && <Clock />}
            {widgets.includes("weather") && <WeatherWidget />}
          </ScrollView>
          <WidgetBar widgets={widgets} setWidgets={setWidgets} />
        </>
      )}
    </ContentWrapper>
  );
}
function PanelSwipeTrigger() {
  const theme = useColorTheme();
  const width = useSharedValue(15);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(width.value, { damping: 30, stiffness: 400 }),
    };
  });

  const dotStyle = useAnimatedStyle(() => ({
    height: withSpring(width.value === 15 ? 20 : 40, {
      damping: 30,
      stiffness: 400,
    }),
  }));

  const isPullerActive = useSharedValue(0);
  const isPullerHovered = useSharedValue(0);

  const pullerStyles = useAnimatedStyle(() => ({
    width: withSpring(!isPullerActive.value ? 5 : 9, {
      damping: 30,
      stiffness: 400,
    }),
    backgroundColor: withSpring(
      theme[
        !isPullerActive.value
          ? isPullerHovered.value
            ? 5
            : 4
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

  const onPressIn = () => {
    width.value = 25;
    isPullerActive.value = 1;
  };

  const onPressOut = () => {
    width.value = 15;
    isPullerActive.value = 0;
  };

  const onHoverIn = () => {
    isPullerHovered.value = 1;
    width.value = 25;
  };

  const onHoverOut = () => {
    isPullerHovered.value = 0;
    width.value = 15;
  };

  return (
    <Pressable
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={{
        height: "100%",
        paddingHorizontal: 15,
        justifyContent: "center",
        marginHorizontal: -15,
        marginLeft: -25,
      }}
    >
      <Animated.View
        style={[animatedStyle, { alignItems: "center", paddingVertical: 20 }]}
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

  return !breakpoints.md ? null : (
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
        <PanelContent />
      </Animated.View>
    </>
  );
});

export default FocusPanel;
