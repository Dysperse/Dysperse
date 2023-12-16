import { Pressable, StyleProp, ViewStyle } from "react-native";
import { PressableProps } from "react-native";
import { useColorTheme } from "../color/theme-provider";

interface DButtonProps extends PressableProps {
  buttonClassName?: string;
  variant?: "filled" | "outlined" | "text";
  buttonStyle?: StyleProp<ViewStyle>;
}
export function Button(props: DButtonProps) {
  const variant = props.variant || "text";
  const theme = useColorTheme();

  return (
    <Pressable
      {...props}
      style={({ hovered, pressed }: any) => ({
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 999,
        paddingHorizontal: 10,
        height: 35,
        ...(variant === "outlined"
          ? {
              backgroundColor: pressed
                ? theme[5]
                : hovered
                ? theme[4]
                : undefined,
              borderColor: theme[pressed ? 5 : hovered ? 4 : 3],
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
            }),
        gap: 10,
        ...(props.buttonStyle || ({} as any)),
      })}
    />
  );
}
