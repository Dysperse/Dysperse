import React, { forwardRef } from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
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
  iconPosition?: "start" | "end";
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
    borderWidth: 1,
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

  return (
    <Pressable
      {...props}
      ref={ref as any}
      style={({ hovered, pressed }: any) => [
        styles.base,
        props.isLoading && styles.loading,
        props.variant === "outlined" && styles.outlined,
        {
          height: props.large ? 50 : props.dense ? 30 : 40,
          minWidth: props.large ? 50 : props.dense ? 50 : 70,
          ...(variant === "outlined"
            ? {
                backgroundColor: pressed
                  ? theme[5]
                  : hovered
                  ? theme[4]
                  : undefined,
                borderColor: theme[pressed ? 7 : hovered ? 6 : 5],
              }
            : variant === "filled"
            ? {
                borderColor: "transparent",
                backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
              }
            : {
                backgroundColor: pressed
                  ? theme[4]
                  : hovered
                  ? theme[3]
                  : undefined,
                borderColor: "transparent",
              }),
          gap: props.dense ? 3 : 10,
        },
        props.large && { paddingHorizontal: 20 },
        typeof props.style === "function"
          ? props["style" as any]({ pressed, hovered })
          : props.style,
      ]}
    >
      {props.isLoading ? (
        <Spinner />
      ) : (
        props.children ?? (
          <>
            {(props.iconPosition === "start" || !props.iconPosition) && (
              <Icon size={props.iconSize}>{props.icon}</Icon>
            )}
            <ButtonText style={props.large && { fontSize: 17 }}>
              {props.text}
            </ButtonText>
            {props.iconPosition === "end" && <Icon>{props.icon}</Icon>}
          </>
        )
      )}
    </Pressable>
  );
});
