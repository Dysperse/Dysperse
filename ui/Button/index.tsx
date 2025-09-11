import React, { forwardRef, LegacyRef } from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
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
import Icon from "../Icon";
import IconButton, { IconButtonProps } from "../IconButton";
import Spinner from "../Spinner";
import Text, { DTextProps } from "../Text";

export interface DButtonProps extends PressableProps {
  buttonClassName?: string;
  variant?: "filled" | "outlined" | "text";
  isLoading?: boolean;
  dense?: boolean;
  large?: boolean;
  textStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<TextStyle>;
  textProps?: DTextProps;
  text?: string;
  icon?: string | JSX.Element;
  iconSize?: number;
  height?: number;
  iconPosition?: "start" | "end";
  containerStyle?: StyleProp<ViewStyle>;
  spinnerColor?: string;
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
  chip?: boolean;
  onDismiss?: any;
  dismissButtonProps?: IconButtonProps;
  selected?: boolean;
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
  const variant =
    typeof props.variant === "undefined"
      ? props.chip
        ? "filled"
        : "text"
      : props.variant;

  const theme = useColorTheme();
  const state = useSharedValue(0);

  const borderColors = [
    props.borderColors?.default ||
      (variant === "filled"
        ? props.backgroundColors?.default || theme[3]
        : variant === "text"
        ? addHslAlpha(theme[11], 0)
        : addHslAlpha(theme[11], 0.1)),
    props.borderColors?.hovered ||
      (variant === "filled"
        ? props.backgroundColors?.hovered || theme[4]
        : variant === "text"
        ? addHslAlpha(theme[11], 0)
        : addHslAlpha(theme[11], 0.2)),
    props.borderColors?.pressed ||
      (variant === "filled"
        ? props.backgroundColors?.pressed || theme[5]
        : variant === "text"
        ? addHslAlpha(theme[11], 0)
        : addHslAlpha(theme[11], 0.3)),
  ];

  const backgroundColors = [
    props.backgroundColors?.default ||
      (variant === "filled"
        ? theme[3]
        : variant === "text"
        ? addHslAlpha(theme[11], 0)
        : addHslAlpha(theme[11], 0)),
    props.backgroundColors?.hovered ||
      (variant === "filled"
        ? theme[4]
        : variant === "text"
        ? addHslAlpha(theme[11], 0)
        : addHslAlpha(theme[11], 0.1)),
    props.backgroundColors?.pressed ||
      (variant === "filled"
        ? theme[5]
        : variant === "text"
        ? addHslAlpha(theme[11], 0)
        : addHslAlpha(theme[11], 0.2)),
  ];

  const animationConfigs = {
    damping: 125,
    stiffness: 1500,
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(state.value === 2 ? 0.95 : 1, animationConfigs),
      },
    ],
    borderColor: withSpring(
      interpolateColor(state.value, [0, 2], borderColors)
    ),
    backgroundColor: withSpring(
      interpolateColor(state.value, [0, 2], backgroundColors),
      animationConfigs
    ),
  }));

  const height =
    props.height ||
    (props.chip
      ? props.large
        ? 35
        : 30
      : props.large
      ? 50
      : props.dense
      ? 30
      : 40);
  const minWidth = props.large ? 50 : props.chip ? 30 : props.dense ? 50 : 70;

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          height,
          maxHeight: height,
          minHeight: height,
          minWidth: minWidth,
          borderWidth: variant === "outlined" ? 1 : 0,
          borderRadius: props.chip ? 12 : 40,
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
          {
            flex: 1,
            gap: props.dense
              ? 3
              : props.chip
              ? props.large
                ? 10
                : typeof props.icon !== "string"
                ? 10
                : 6
              : 10,
          },
          styles.base,
          props.isLoading && styles.loading,
          variant === "outlined" && styles.outlined,
          typeof props.style === "function"
            ? props["style" as any]({ hovered, pressed })
            : props.style,
          props.large && { paddingHorizontal: 20 },
          props.chip && { paddingHorizontal: 10 },
          props.chip && props.variant === "outlined" && { gap: 10 },
        ]}
      >
        {props.isLoading ? (
          <Spinner
            size={props.dense ? 16 : undefined}
            color={props.spinnerColor}
          />
        ) : (
          props.children ?? (
            <>
              {(props.iconPosition === "start" || !props.iconPosition) &&
                props.icon &&
                (typeof props.icon !== "string" ? (
                  props.icon
                ) : (
                  <Icon
                    size={props.iconSize}
                    bold={props.bold}
                    style={props.iconStyle}
                  >
                    {props.icon}
                  </Icon>
                ))}
              {typeof props.text === "string" ? (
                <ButtonText
                  style={[
                    props.large && { fontSize: 17 },
                    props.chip && { fontSize: props.large ? 15 : 13 },
                    props.textStyle,
                  ]}
                  weight={props.bold ? 900 : undefined}
                  {...props.textProps}
                >
                  {props.text}
                </ButtonText>
              ) : (
                props.text
              )}
              {props.iconPosition === "end" &&
                props.icon &&
                (typeof props.icon !== "string" ? (
                  props.icon
                ) : (
                  <Icon
                    size={props.iconSize}
                    bold={props.bold}
                    style={props.iconStyle}
                  >
                    {props.icon}
                  </Icon>
                ))}
              {props.selected && (
                <Icon style={{ marginLeft: "auto" }}>check</Icon>
              )}

              {props.onDismiss && (
                <IconButton
                  onPress={props.onDismiss}
                  icon="close"
                  style={{ marginHorizontal: -5 }}
                  {...props.dismissButtonProps}
                />
              )}
            </>
          )
        )}
      </Pressable>
    </Animated.View>
  );
});

