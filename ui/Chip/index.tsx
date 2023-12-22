import { Pressable, StyleProp, ViewStyle } from "react-native";
import Text from "../Text";
import { useColorTheme } from "../color/theme-provider";

interface ChipProps {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  onPress?: () => void;
  outlined?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function Chip({
  icon,
  label,
  onPress,
  outlined = false,
  style = {},
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
      {icon}
      {typeof label === "string" ? <Text>{label}</Text> : label}
    </Pressable>
  );
}
