import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { addHslAlpha } from "../color";
import { useColorTheme } from "../color/theme-provider";

export interface DListitemButtonProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  buttonClassName?: string;
  variant?: "default" | "filled" | "outlined";
  pressableStyle?: StyleProp<ViewStyle>;
  backgroundColors?: {
    default: string;
    hover: string;
    active: string;
  };
}

const styles = StyleSheet.create({
  base: {
    gap: 15,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});

const animationConfig = {
  damping: 10,
  stiffness: 400,
  overshootClamping: true,
};

export function ListItemButton(props: DListitemButtonProps) {
  const theme = useColorTheme();
  const state = useSharedValue(0);

  const backgroundColors = [
    props.backgroundColors?.default ||
      (props.variant === "filled" ? theme[3] : addHslAlpha(theme[3], 0)),
    props.backgroundColors?.hover || theme[props.variant === "filled" ? 4 : 3],
    props.backgroundColors?.active || theme[props.variant === "filled" ? 5 : 4],
  ];
  const borderColors = [theme[5], theme[6], theme[7]];

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withSpring(
      interpolateColor(state.value, [0, 2], backgroundColors),
      animationConfig
    ),
    borderColor: withSpring(
      interpolateColor(state.value, [0, 2], borderColors),
      animationConfig
    ),
    transform: [
      { scale: withSpring(state.value === 2 ? 0.95 : 1, animationConfig) },
    ],
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        styles.base,
        props.style,
        {
          paddingHorizontal: 0,
          paddingVertical: 0,
          overflow: "hidden",
        },
        props.variant === "outlined" && {
          borderWidth: 1,
        },
      ]}
    >
      <Pressable
        {...props}
        onHoverIn={() => (state.value = 1)}
        onHoverOut={() => (state.value = 0)}
        onPressIn={() => (state.value = 2)}
        onPressOut={() => (state.value = 0)}
        android_ripple={{ color: theme[5] }}
        style={[styles.base, props.pressableStyle, { flex: 1 }]}
      />
    </Animated.View>
  );
}
