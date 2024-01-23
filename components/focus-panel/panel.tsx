import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import IconButton from "@/ui/IconButton";
import { useColorTheme } from "@/ui/color/theme-provider";
import { memo, useEffect } from "react";
import { Platform, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Path, Svg } from "react-native-svg";
import { TodaysDate } from "../home/TodaysDate";
import { WeatherWidget } from "../home/weather/widget";
import { ContentWrapper } from "../layout/content";
import { useFocusPanelContext } from "./context";

function Tools() {
  const theme = useColorTheme();
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
      <IconButton>
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
      <IconButton icon="music_note" />
      <IconButton icon="timer" />
      <IconButton icon="wb_sunny" />
    </View>
  );
}

const FocusPanel = memo(function FocusPanel() {
  const { isFocused } = useFocusPanelContext();
  const marginRight = useSharedValue(-350);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      marginRight: withSpring(marginRight.value, {
        damping: 30,
        stiffness: 400,
      }),
    };
  });

  useEffect(() => {
    if (isFocused) {
      marginRight.value = 0;
    } else {
      marginRight.value = -350;
    }
  }, [isFocused, marginRight]);

  const breakpoints = useResponsiveBreakpoints();

  return !breakpoints.md ? null : (
    <Animated.View
      style={[
        animatedStyle,
        {
          padding: 10,
          width: 350,
          paddingLeft: 0,
          ...(Platform.OS === "web" &&
            ({
              marginTop: "env(titlebar-area-height,0)",
            } as any)),
        },
      ]}
    >
      <ContentWrapper
        style={{
          padding: 20,
        }}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 20 }}>
          {isFocused && (
            <>
              <TodaysDate />
              <WeatherWidget />
            </>
          )}
        </ScrollView>
        <Tools />
      </ContentWrapper>
    </Animated.View>
  );
});

export default FocusPanel;
