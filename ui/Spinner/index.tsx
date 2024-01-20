import * as React from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  interpolate,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { useColorTheme } from "../color/theme-provider";

interface SpinnerProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const duration = 1700;

const Spinner = (props: SpinnerProps) => {
  const theme = useColorTheme();

  const sv = useSharedValue(0);

  const animateSpinner = (sv: Animated.SharedValue<number>) => {
    "worklet"; // This annotation is important for the worklet to run on the UI thread

    sv.value = withRepeat(
      withTiming(1, {
        duration,
        easing: (t: number) => t,
      }),
      -1
    );
  };

  React.useEffect(() => {
    // Run the animation on the UI thread using runOnUI
    runOnUI(animateSpinner)(sv);
  }, [sv]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(sv.value, [0, 1], [0, 360])}deg` }],
    width: props.size || 20,
    height: props.size || 20,
  }));

  return (
    <Animated.View style={[animatedStyle, props.style]}>
      <Svg
        viewBox="0 0 100 100"
        {...props}
        fill={props.color || theme[9]}
        width={props.size || 20}
        height={props.size || 20}
      >
        <Path d="M50 29.41c-1.76 0-2.94-1.18-2.94-2.94V2.94C47.06 1.18 48.24 0 50 0s2.94 1.18 2.94 2.94v23.53c0 1.76-1.18 2.94-2.94 2.94M50 100c-1.76 0-2.94-1.18-2.94-2.94V73.53c0-1.76 1.18-2.94 2.94-2.94s2.94 1.18 2.94 2.94v23.53c0 1.76-1.18 2.94-2.94 2.94m11.76-67.65c-.59 0-.88 0-1.47-.29-1.18-.88-1.76-2.35-.88-3.82L71.17 7.95c.88-1.18 2.35-1.76 3.82-.88 1.18.88 1.76 2.35.88 3.82L64.11 31.18c-.59.59-1.47 1.18-2.35 1.18M26.47 93.53c-.59 0-.88 0-1.47-.29-1.18-.88-1.76-2.35-.88-3.82l11.76-20.29c.88-1.18 2.35-1.76 3.82-.88 1.18.88 1.76 2.35.88 3.82L28.82 92.36c-.59.59-1.47 1.18-2.35 1.18M38.24 32.35c-.88 0-1.76-.59-2.35-1.47L24.13 10.59c-.88-1.18-.29-2.94.88-3.82s2.94-.29 3.82.88l11.76 20.29c.88 1.18.29 2.94-.88 3.82-.59.59-.88.59-1.47.59M73.53 93.53c-.88 0-1.76-.59-2.35-1.47L59.42 71.77c-.88-1.18-.29-2.94.88-3.82s2.94-.29 3.82.88l11.76 20.29c.88 1.18.29 2.94-.88 3.82-.59.29-.88.59-1.47.59M26.47 52.94H2.94C1.18 52.94 0 51.76 0 50s1.18-2.94 2.94-2.94h23.53c1.76 0 2.94 1.18 2.94 2.94s-1.18 2.94-2.94 2.94M97.06 52.94H73.53c-1.76 0-2.94-1.18-2.94-2.94s1.18-2.94 2.94-2.94h23.53c1.76 0 2.94 1.18 2.94 2.94s-1.18 2.94-2.94 2.94M29.71 40.88c-.59 0-.88 0-1.47-.29L7.94 28.82c-1.18-.88-1.76-2.35-.88-3.82.88-1.18 2.35-1.76 3.82-.88l20.29 11.76c1.18.88 1.76 2.35.88 3.82-.59.88-1.47 1.18-2.35 1.18M90.88 76.18c-.59 0-.88 0-1.47-.29L69.12 64.13c-1.18-.88-1.76-2.35-.88-3.82.88-1.18 2.35-1.76 3.82-.88l20.29 11.76c1.18.88 1.76 2.35.88 3.82-.59.88-1.47 1.18-2.35 1.18M9.12 76.18c-.88 0-1.76-.59-2.35-1.47-.88-1.18-.29-2.94.88-3.82l20.29-11.76c1.18-.88 2.94-.29 3.82.88s.29 2.94-.88 3.82L10.59 75.59c-.29.59-.88.59-1.47.59M70.29 40.88c-.88 0-1.76-.59-2.35-1.47-.88-1.18-.29-2.94.88-3.82l20.29-11.76c1.18-.88 2.94-.29 3.82.88s.29 2.94-.88 3.82L71.76 40.29c-.59.59-.88.59-1.47.59" />
      </Svg>
    </Animated.View>
  );
};

export default Spinner;
