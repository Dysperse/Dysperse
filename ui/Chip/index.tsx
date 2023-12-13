import { Pressable } from "react-native";
import Text from "../Text";

interface ChipProps {
  icon?: React.ReactNode;
  label?: String | React.ReactNode;
}

export default function Chip({ icon, label }: ChipProps) {
  return (
    <Pressable className="flex-row items-center bg-gray-200 active:bg-gray-300 py-1 px-3 rounded-full">
      {icon}
      {typeof label === "string" ? <Text>{label}</Text> : label}
    </Pressable>
  );
}
