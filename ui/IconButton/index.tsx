import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import Icon from "../Icon";
import { useColorTheme } from "../color/theme-provider";

interface DIconButtonProps extends PressableProps {
  variant?: "filled" | "outlined" | "text";
  size?: number;
  style?:
    | StyleProp<ViewStyle>
    | (({ pressed, hovered }) => StyleProp<ViewStyle>);
  icon?: string;
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
  },
});
export default function IconButton(props: DIconButtonProps) {
  const theme = useColorTheme();

  return (
    <Pressable
      {...props}
      style={({ pressed, hovered }: any) => [
        styles.base,
        {
          borderColor: props.variant === "outlined" ? theme[5] : "transparent",
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
      // className={`${props.className}`}
    >
      {props.children || <Icon>{props.icon}</Icon>}
    </Pressable>
  );
}
