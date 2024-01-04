import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { useColorTheme } from "../color/theme-provider";

export interface DListitemButtonProps extends PressableProps {
  style?: StyleProp<ViewStyle> | ((props: any) => StyleProp<ViewStyle>);
  buttonClassName?: string;
  variant?: "default" | "filled";
}

const styles = StyleSheet.create({
  base: {
    gap: 15,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});

export function ListItemButton(props: DListitemButtonProps) {
  const theme = useColorTheme();
  const { width } = useWindowDimensions();

  return (
    <Pressable
      {...props}
      style={({ pressed, hovered }: any) => [
        styles.base,
        {
          backgroundColor: pressed
            ? theme[5]
            : hovered
            ? theme[4]
            : props.variant === "filled"
            ? theme[pressed ? 5 : hovered ? 4 : 3]
            : "transparent",
        },
        typeof props.style === "function"
          ? props.style({ pressed, hovered })
          : props.style,
      ]}
    />
  );
}
