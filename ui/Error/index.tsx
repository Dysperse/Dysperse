import { StyleProp, View, ViewStyle } from "react-native";
import Icon from "../Icon";
import Text from "../Text";
import { useColor } from "../color";

export default function ErrorAlert({
  message = "Something went wrong. Please try again later.",
  icon = "error",
  style,
}: {
  message?: string;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const red = useColor("red");
  return (
    <View
      style={[
        {
          gap: 15,
          backgroundColor: red[3],
          borderColor: red[5],
          flexDirection: "row",
          borderRadius: 20,
          alignItems: "center",
          borderWidth: 2,
          paddingHorizontal: 20,
          paddingVertical: 15,
        },
        style,
      ]}
    >
      <Icon style={{ color: red[11] }}>{icon}</Icon>
      <Text style={{ color: red[11], lineHeight: 23, flex: 1 }}>{message}</Text>
    </View>
  );
}

