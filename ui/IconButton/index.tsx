import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
import { useColorTheme } from "../color/theme-provider";

interface DIconButtonProps extends PressableProps {
  variant?: "filled" | "text";
  size?: number;
  style?:
    | StyleProp<ViewStyle>
    | (({ pressed, hovered }) => StyleProp<ViewStyle>);
}

export default function IconButton(props: DIconButtonProps) {
  const theme = useColorTheme();

  return (
    <Pressable
      {...props}
      style={({ pressed, hovered }: any) => [
        {
          width: props.size ?? 35,
          height: props.size ?? 35,
          backgroundColor: pressed
            ? theme[5]
            : hovered
            ? theme[4]
            : props.variant === "filled"
            ? theme[3]
            : undefined,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 999,
        },
        typeof props.style === "function"
          ? props.style({ pressed, hovered })
          : props.style,
      ]}
      // className={`${props.className}`}
    />
  );
}
