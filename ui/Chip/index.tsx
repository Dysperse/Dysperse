import { Platform, Pressable, StyleProp } from "react-native";
import Text from "../Text";

interface ChipProps {
  icon?: React.ReactNode;
  label?: String | React.ReactNode;
  onPress?: () => void;
  outlined?: boolean;
  style?: StyleProp<any>;
}

export default function Chip({
  icon,
  label,
  onPress,
  outlined = false,
  style = {},
}: ChipProps) {
  return (
    <Pressable
      className={`flex-row items-center border border-transparent py-1 px-3 rounded-full ${
        Platform.OS === "web" ? "" : "pb-2"
      } ${
        outlined
          ? "border-gray-200 active:bg-gray-100"
          : "bg-gray-200 active:bg-gray-300"
      }`}
      style={{ gap: 10, ...style }}
      {...(onPress && { onPress })}
    >
      {icon}
      {typeof label === "string" ? <Text>{label}</Text> : label}
    </Pressable>
  );
}
