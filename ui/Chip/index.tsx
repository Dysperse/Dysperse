import { Pressable, StyleProp, ViewStyle } from "react-native";
import Text from "../Text";
import { useColorTheme } from "../color/theme-provider";

interface ChipProps {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  onPress?: () => void;
  outlined?: boolean;
  style?: StyleProp<ViewStyle> | ((props: any) => StyleProp<ViewStyle>);
  iconPosition?: "before" | "after";
  dense?: boolean;
  color?: string;
}

export default function Chip({
  icon,
  label,
  onPress,
  outlined = false,
  style = {},
  iconPosition = "before",
  dense = false,
  color,
}: ChipProps) {
  const theme = useColorTheme();

  return (
    <Pressable
      style={({ hovered, pressed }: any) => [
        {
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 2,
          borderRadius: 999,
          paddingHorizontal: dense ? 5 : 10,
          ...(icon && {
            paddingRight: dense ? 7 : 12,
          }),
          height: dense ? 30 : 35,
          ...(outlined
            ? {
                backgroundColor: pressed
                  ? theme[5]
                  : hovered
                  ? theme[4]
                  : undefined,
                borderColor: theme[pressed ? 5 : hovered ? 4 : 3],
              }
            : {
                borderColor: "transparent",
                backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
              }),
          gap: dense ? 5 : 10,
        },
        typeof style === "function" ? style({ pressed, hovered }) : style,
      ]}
      {...(onPress && { onPress })}
    >
      {iconPosition === "before" && icon}
      {typeof label === "string" ? (
        <Text
          style={{ color: color || theme[11], ...(dense && { fontSize: 13 }) }}
          weight={400}
        >
          {label}
        </Text>
      ) : (
        label
      )}
      {iconPosition === "after" && icon}
    </Pressable>
  );
}
