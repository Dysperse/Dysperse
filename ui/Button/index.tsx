import React, { forwardRef, LegacyRef } from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Icon from "../Icon";
import Spinner from "../Spinner";
import Text, { DTextProps } from "../Text";
import { useColorTheme } from "../color/theme-provider";

interface DButtonProps extends PressableProps {
  buttonClassName?: string;
  variant?: "filled" | "outlined" | "text";
  buttonStyle?: StyleProp<ViewStyle>;
  isLoading?: boolean;
  dense?: boolean;
  large?: boolean;
  text?: string;
  icon?: string;
  iconSize?: number;
  height?: number;
  iconPosition?: "start" | "end";
  containerStyle?: StyleProp<ViewStyle>;
  backgroundColors?: {
    default: string;
    pressed: string;
    hovered?: string;
  };
  borderColors?: {
    default: string;
    pressed: string;
    hovered?: string;
  };
  bold?: boolean;
}

export function ButtonText(props: DTextProps) {
  const theme = useColorTheme();
  return (
    <Text
      numberOfLines={1}
      weight={500}
      {...props}
      style={[
        { color: theme[11] },
        Array.isArray(props.style) ? [...props.style] : props.style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
  },
  outlined: {
    paddingHorizontal: 20,
  },
  loading: { opacity: 0.5, pointerEvents: "none" },
  disabled: { opacity: 0.5, pointerEvents: "none" },
});

export const Button = forwardRef<PressableProps, DButtonProps>((props, ref) => {
  const variant = props.variant || "text";
  const theme = useColorTheme();

  const state = useSharedValue(0);

  const borderColors = [
    props.borderColors?.default ||
      (variant === "filled"
        ? props.backgroundColors?.default || theme[3]
        : variant === "text"
        ? "transparent"
        : theme[4]),
    props.borderColors?.hovered ||
      (variant === "filled"
        ? props.backgroundColors?.hovered || theme[4]
        : variant === "text"
        ? "transparent"
        : theme[5]),
    props.borderColors?.pressed ||
      (variant === "filled"
        ? props.backgroundColors?.pressed || theme[5]
        : variant === "text"
        ? "transparent"
        : theme[6]),
  ];

  const backgroundColors = [
    props.backgroundColors?.default ||
      (variant === "filled"
        ? theme[3]
        : variant === "text"
        ? "transparent"
        : theme[2]),
    props.backgroundColors?.hovered ||
      (variant === "filled"
        ? theme[4]
        : variant === "text"
        ? "transparent"
        : theme[3]),
    props.backgroundColors?.pressed ||
      (variant === "filled"
        ? theme[5]
        : variant === "text"
        ? "transparent"
        : theme[4]),
  ];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(state.value === 2 ? 0.95 : 1, {
          damping: 10,
          stiffness: 400,
          overshootClamping: true,
        }),
      },
    ],
    borderColor: withSpring(
      interpolateColor(state.value, [0, 2], borderColors)
    ),
    backgroundColor: withSpring(
      interpolateColor(state.value, [0, 2], backgroundColors),
      {
        damping: 10,
        stiffness: 400,
        overshootClamping: true,
      }
    ),
  }));

  const height = props.height || (props.large ? 50 : props.dense ? 30 : 40);
  const minWidth = props.large ? 50 : props.dense ? 50 : 70;

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          height,
          maxHeight: height,
          minHeight: height,
          minWidth: minWidth,

          borderWidth: props.variant === "outlined" ? 1 : 0,
          borderRadius: 40,
          overflow: "hidden",
        },
        props.containerStyle,
      ]}
    >
      <Pressable
        android_ripple={{ color: theme[6] }}
        {...props}
        onHoverIn={() => (state.value = 1)}
        onHoverOut={() => (state.value = 0)}
        onPressIn={() => (state.value = 2)}
        onPressOut={() => (state.value = 0)}
        ref={ref as LegacyRef<View>}
        style={({ hovered, pressed }: any) => [
          styles.base,
          props.isLoading && styles.loading,
          props.variant === "outlined" && styles.outlined,
          typeof props.style === "function"
            ? props["style" as any]({ hovered, pressed })
            : props.style,
          {
            flex: 1,
            gap: props.dense ? 3 : 10,
          },
          props.large && { paddingHorizontal: 20 },
        ]}
      >
        {props.isLoading ? (
          <Spinner />
        ) : (
          props.children ?? (
            <>
              {(props.iconPosition === "start" || !props.iconPosition) && (
                <Icon size={props.iconSize} bold={props.bold}>
                  {props.icon}
                </Icon>
              )}
              <ButtonText
                style={props.large && { fontSize: 17 }}
                weight={props.bold ? 900 : undefined}
              >
                {props.text}
              </ButtonText>
              {props.iconPosition === "end" && (
                <Icon bold={props.bold}>{props.icon}</Icon>
              )}
            </>
          )
        )}
      </Pressable>
    </Animated.View>
  );
});
