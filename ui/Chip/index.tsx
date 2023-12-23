import { Pressable, StyleProp, ViewStyle } from "react-native";
import Text from "../Text";
import { useColorTheme } from "../color/theme-provider";

interface ChipProps {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  onPress?: () => void;
  outlined?: boolean;
  style?: StyleProp<ViewStyle>;
  iconPosition?: "before" | "after";
}

export default function Chip({
  icon,
  label,
  onPress,
  outlined = false,
  style = {},
  iconPosition = "before",
}: ChipProps) {
  const theme = useColorTheme();

  return (
    <Pressable
      style={({ hovered, pressed }: any) => ({
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 999,
        paddingHorizontal: 10,
        height: 35,
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
        gap: 10,
        ...(style as any),
      })}
      {...(onPress && { onPress })}
    >
      {iconPosition === "before" && icon}
      {typeof label === "string" ? (
        <Text style={{ color: theme[11] }} weight={400}>
          {label}
        </Text>
      ) : (
        label
      )}
      {iconPosition === "after" && icon}
    </Pressable>
  );
}
