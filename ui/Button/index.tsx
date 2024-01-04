import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import Spinner from "../Spinner";
import Text, { DTextProps } from "../Text";
import { useColorTheme } from "../color/theme-provider";

interface DButtonProps extends PressableProps {
  buttonClassName?: string;
  variant?: "filled" | "outlined" | "text";
  buttonStyle?: StyleProp<ViewStyle>;
  isLoading?: boolean;
  dense?: boolean;
}

export function ButtonText(props: DTextProps) {
  const theme = useColorTheme();
  return (
    <Text
      weight={500}
      {...props}
      style={[
        {
          color: theme[11],
        },
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
});

export function Button(props: DButtonProps) {
  const variant = props.variant || "text";
  const theme = useColorTheme();

  return (
    <Pressable
      {...props}
      style={({ hovered, pressed }: any) => [
        styles.base,
        props.isLoading && styles.loading,
        props.variant === "outlined" && styles.outlined,
        {
          height: props.dense ? 30 : 40,
          minWidth: props.dense ? 50 : 70,
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
        typeof props.style === "function"
          ? props["style" as any]({ pressed, hovered })
          : props.style,
      ]}
    >
      {props.isLoading ? <Spinner /> : props.children}
    </Pressable>
  );
}
