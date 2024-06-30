import React, { forwardRef, ReactNode } from "react";
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
import { SpringConfig } from "react-native-reanimated/lib/typescript/reanimated2/animation/springUtils";
import { addHslAlpha } from "../color";
import { useColorTheme } from "../color/theme-provider";
import Icon from "../Icon";

export interface IconButtonProps extends PressableProps {
  variant?: "filled" | "outlined" | "text";
  size?: number;
  style?: StyleProp<ViewStyle>;
  pressableStyle?:
    | StyleProp<ViewStyle>
    | (({ pressed, hovered }) => StyleProp<ViewStyle>);
  icon?: string | ReactNode;
  backgroundColors?: {
    default?: string;
    pressed?: string;
    hovered?: string;
  };
  borderColors?: {
    default?: string;
    pressed?: string;
    hovered?: string;
  };
  animationConfigs?: SpringConfig;
}

const styles = StyleSheet.create({
  base: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
  },
});

const IconButton = forwardRef<typeof Pressable, IconButtonProps>(
  (props, ref) => {
    const theme = useColorTheme();
    const state = useSharedValue(0);

    const animationConfig = props.animationConfigs || {
      damping: 10,
      stiffness: 400,
      overshootClamping: true,
    };

    const backgroundColors = [
      props.backgroundColors?.default ||
        (props.variant === "filled" ? theme[3] : addHslAlpha(theme[3], 0)),
      props.backgroundColors?.hovered || theme[4],
      props.backgroundColors?.pressed || theme[5],
    ];
    const transparent = addHslAlpha(theme[3], 0);
    const borderColors = [
      props.borderColors?.default ||
        (props.variant === "outlined" ? theme[5] : transparent),
      props.borderColors?.hovered ||
        (props.variant === "outlined" ? theme[6] : transparent),
      props.borderColors?.pressed ||
        (props.variant === "outlined" ? theme[7] : transparent),
    ];

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
          {
            opacity: props.disabled ? 0.5 : 1,
            borderWidth: 1,
            width: props.size ?? 35,
            height: props.size ?? 35,
          },
          props.style,
        ]}
      >
        <Pressable
          {...props}
          onHoverIn={() => (state.value = 1)}
          onHoverOut={() => (state.value = 0)}
          onPressIn={() => (state.value = 2)}
          onPressOut={() => (state.value = 0)}
          ref={ref as any}
          style={({ pressed, hovered }) => [
            styles.base,
            {
              height: props.size ?? 35,
              width: "100%",
              flex: 1,
            },
            typeof props.pressableStyle === "function"
              ? props.pressableStyle({ pressed, hovered })
              : props.pressableStyle,
          ]}
        >
          {props.children || <Icon>{props.icon}</Icon>}
        </Pressable>
      </Animated.View>
    );
  }
);

export default IconButton;
