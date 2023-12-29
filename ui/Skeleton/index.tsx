import { useEffect } from "react";
import { View, ViewProps } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useColorTheme } from "../color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { addHslAlpha } from "../color";

interface DSkeletonProps extends ViewProps {
  size?: number;
  width?: number;
  height?: number;
  rounded?: boolean;
  isLoading?: boolean;
}

export default function Skeleton(props: DSkeletonProps) {
  const theme = useColorTheme();
  // Create a bar which is 40px wide and 100% high. it should move from left to right, and then back to left. It should do this forever, and it should take 2 seconds to complete each cycle. Use react-native-reanimated to create this animation.
  const sv = useSharedValue((props.width || props.size) * -1.5);

  useEffect(() => {
    sv.value = withRepeat(
      withTiming((props.width || props.size) + 20, { duration: 1500 }),
      -1
    );
  }, [props.width, props.size, sv]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sv.value }],
  }));

  return (
    <View
      {...props}
      style={[
        {
          overflow: "hidden",
          backgroundColor: addHslAlpha(theme[7], 0.2),
          width: props.width || props.size,
          height: props.height || props.size,
          borderRadius: props.rounded ? 999 : 20,
        },
        props.style,
      ]}
    >
      {props.isLoading ? (
        <Animated.View
          style={[
            animatedStyle,
            {
              width: (props.width || props.size) / 1.5,
              height: "100%",
            },
          ]}
        >
          <LinearGradient
            colors={["transparent", theme[5], "transparent"]}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      ) : (
        props.children
      )}
    </View>
  );
}
