import { StyleProp, View, ViewStyle } from "react-native";
import Emoji from "../Emoji";
import Text from "../Text";
import { useColorTheme } from "../color/theme-provider";

interface AlertProps {
  emoji: string;
  title: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
}

export default function Alert({ emoji, title, subtitle, style }: AlertProps) {
  const theme = useColorTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme[3],
          padding: 20,
          paddingHorizontal: 30,
          borderRadius: 25,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          marginBottom: 20,
          gap: 25,
        },
        style,
      ]}
    >
      <Emoji emoji={emoji} size={30} />
      <View>
        <Text style={{ fontSize: 20 }} weight={800}>
          {title}
        </Text>
        {subtitle && <Text style={{ opacity: 0.7 }}>{subtitle}</Text>}
      </View>
    </View>
  );
}
