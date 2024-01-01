import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
import Text, { DTextProps } from "../Text";
import { useColorTheme } from "../color/theme-provider";

interface DButtonProps extends PressableProps {
  buttonClassName?: string;
  variant?: "filled" | "outlined" | "text";
  buttonStyle?: StyleProp<ViewStyle>;
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

export function Button(props: DButtonProps) {
  const variant = props.variant || "text";
  const theme = useColorTheme();

  return (
    <Pressable
      {...props}
      style={({ hovered, pressed }: any) => [
        {
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderRadius: 999,
          paddingHorizontal: 10,
          height: 40,
          minWidth: 70,
          justifyContent: "center",
          ...(variant === "outlined"
            ? {
                paddingHorizontal: 20,
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
          gap: 10,
        },
        typeof props.style === "function"
          ? props.style({ pressed, hovered })
          : props.style,
      ]}
    />
  );
}
