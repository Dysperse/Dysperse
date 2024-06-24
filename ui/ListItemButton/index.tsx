import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useColorTheme } from "../color/theme-provider";

export interface DListitemButtonProps extends PressableProps {
  style?: StyleProp<ViewStyle> | ((props) => StyleProp<ViewStyle>);
  buttonClassName?: string;
  variant?: "default" | "filled" | "outlined";
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

  return (
    <Pressable
      {...props}
      style={({ pressed, hovered }) => [
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
        props.variant === "outlined" && {
          borderWidth: 1,
          borderColor: theme[5],
        },
        typeof props.style === "function"
          ? props.style({ pressed, hovered })
          : props.style,
      ]}
    />
  );
}
