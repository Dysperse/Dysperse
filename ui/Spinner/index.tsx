import * as React from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { G, Path, Svg } from "react-native-svg";
import { useColorTheme } from "../color/theme-provider";

interface SpinnerProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const easing = () => {
  "worklet"; // This annotation is important for the worklet to run on the UI thread
  return 0;
};
const duration = 83.333;

const Spinner = (props: SpinnerProps) => {
  const theme = useColorTheme();

  const sv = useSharedValue(0);

  const animateSpinner = (sv: Animated.SharedValue<number>) => {
    "worklet"; // This annotation is important for the worklet to run on the UI thread

    sv.value = withRepeat(
      // Discrete animation with 12 frames of 0.08333s each. 360/12 = 30 degrees per frame
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(30, { duration, easing }),
        withTiming(60, { duration, easing }),
        withTiming(90, { duration, easing }),
        withTiming(120, { duration, easing }),
        withTiming(150, { duration, easing }),
        withTiming(180, { duration, easing }),
        withTiming(210, { duration, easing }),
        withTiming(240, { duration, easing }),
        withTiming(270, { duration, easing }),
        withTiming(300, { duration, easing }),
        withTiming(330, { duration, easing })
      ),
      -1
    );
  };

  React.useEffect(() => {
    // Run the animation on the UI thread using runOnUI
    runOnUI(animateSpinner)(sv);
  }, [sv]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sv.value}deg` }],
    width: props.size || 24,
    height: props.size || 24,
  }));

  return (
    <Animated.View style={[animatedStyle, props.style]}>
      {props.children || (
        <Svg viewBox="0 0 2400 2400" width={props.size} height={props.size}>
          <G
            strokeWidth="200"
            strokeLinecap="round"
            stroke={props.color || theme[11]}
            fill="none"
          >
            <Path d="M1200 600V100" />
            <Path opacity=".5" d="M1200 2300v-500" />
            <Path opacity=".917" d="M900 680.4l-250-433" />
            <Path opacity=".417" d="M1750 2152.6l-250-433" />
            <Path opacity=".833" d="M680.4 900l-433-250" />
            <Path opacity=".333" d="M2152.6 1750l-433-250" />
            <Path opacity=".75" d="M600 1200H100" />
            <Path opacity=".25" d="M2300 1200h-500" />
            <Path opacity=".667" d="M680.4 1500l-433 250" />
            <Path opacity=".167" d="M2152.6 650l-433 250" />
            <Path opacity=".583" d="M900 1719.6l-250 433" />
            <Path opacity=".083" d="M1750 247.4l-250 433" />
            {/* <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              keyTimes="0;0.08333;0.16667;0.25;0.33333;0.41667;0.5;0.58333;0.66667;0.75;0.83333;0.91667"
              values="0 1199 1199;30 1199 1199;60 1199 1199;90 1199 1199;120 1199 1199;150 1199 1199;180 1199 1199;210 1199 1199;240 1199 1199;270 1199 1199;300 1199 1199;330 1199 1199"
              dur="0.83333s"
              begin="0s"
              repeatCount="indefinite"
              calcMode="discrete"
            /> */}
          </G>
        </Svg>
      )}
    </Animated.View>
  );
};

export default Spinner;

