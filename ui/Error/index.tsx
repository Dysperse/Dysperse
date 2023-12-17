import { View, useColorScheme } from "react-native";
import Icon from "../Icon";
import Text from "../Text";
import { useColor } from "../color";

export default function ErrorAlert({
  message = "Something went wrong. Please try again later.",
  icon = "error",
}) {
  const red = useColor("red", useColorScheme() === "dark");
  return (
    <View
      className="border-2 flex-row items-center rounded-2xl px-5 py-4"
      style={{ gap: 15, backgroundColor: red[3], borderColor: red[5] }}
    >
      <Icon style={{ color: red[11] }}>{icon}</Icon>
      <Text style={{ color: red[11] }}>{message}</Text>
    </View>
  );
}
