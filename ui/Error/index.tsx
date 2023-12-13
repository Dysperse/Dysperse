import { View } from "react-native";
import Text from "../Text";
import Icon from "../Icon";

export default function ErrorAlert({
  message = "Something went wrong. Please try again later.",
  icon = "error",
}) {
  return (
    <View
      className="bg-red-100 border-2 border-red-200 flex-row items-center rounded-2xl px-5 py-4"
      style={{ gap: 15 }}
    >
      <Icon textClassName="text-red-800">{icon}</Icon>
      <Text textClassName="text-red-900">{message}</Text>
    </View>
  );
}
