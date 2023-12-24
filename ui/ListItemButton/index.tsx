import { Pressable, ViewStyle, useWindowDimensions } from "react-native";
import { PressableProps } from "react-native";
import { StyleProp } from "react-native";
import { useColorTheme } from "../color/theme-provider";

export interface DListitemButtonProps extends PressableProps {
  style?: StyleProp<ViewStyle> | ((props: any) => StyleProp<ViewStyle>);
  buttonClassName?: string;
  variant?: "default" | "filled";
}

export function ListItemButton(props: DListitemButtonProps) {
  const theme = useColorTheme();
  const { width } = useWindowDimensions();

  return (
    <Pressable
      {...props}
      style={({ pressed, hovered }: any) => [
        {
          gap: 15,
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 20,
          backgroundColor: pressed
            ? theme[width > 600 ? 5 : 3]
            : hovered
            ? theme[4]
            : props.variant === "filled"
            ? theme[3]
            : "transparent",
          paddingHorizontal: 15,
          paddingVertical: 10,
        },
        typeof props.style === "function"
          ? props.style({ pressed, hovered })
          : props.style,
      ]}
    />
  );
}
