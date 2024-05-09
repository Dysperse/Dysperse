import React, { forwardRef, ReactNode } from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useColorTheme } from "../color/theme-provider";
import Icon from "../Icon";

export interface IconButtonProps extends PressableProps {
  variant?: "filled" | "outlined" | "text";
  size?: number;
  style?:
    | StyleProp<ViewStyle>
    | (({ pressed, hovered }) => StyleProp<ViewStyle>);
  icon?: string | ReactNode;
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
  },
});

const IconButton = forwardRef<typeof Pressable, IconButtonProps>(
  (props, ref) => {
    const theme = useColorTheme();

    return (
      <Pressable
        {...props}
        ref={ref as any}
        style={({ pressed, hovered }) => [
          styles.base,
          { opacity: props.disabled ? 0.5 : 1 },
          {
            borderColor:
              props.variant === "outlined" ? theme[5] : "transparent",
            width: props.size ?? 35,
            height: props.size ?? 35,
            backgroundColor: pressed
              ? theme[5]
              : hovered
              ? theme[4]
              : props.variant === "filled"
              ? theme[3]
              : undefined,
          },
          typeof props.style === "function"
            ? props.style({ pressed, hovered })
            : props.style,
        ]}
      >
        {props.children || <Icon>{props.icon}</Icon>}
      </Pressable>
    );
  }
);

export default IconButton;
