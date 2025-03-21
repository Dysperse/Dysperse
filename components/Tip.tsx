import { Avatar } from "@/ui/Avatar";
import { useColorTheme } from "@/ui/color/theme-provider";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { View } from "react-native";

export default function Tip({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  const theme = useColorTheme();

  return (
    <View
      style={{
        borderRadius: 20,
        padding: 15,
        backgroundColor: theme[3],
        flexDirection: "row",
        gap: 15,
      }}
    >
      <Avatar icon={icon} style={{ marginTop: 5 }} />
      <View style={{ flex: 1 }}>
        <Text variant="eyebrow">{title}</Text>
        <Text style={{ color: theme[11] }} weight={600}>
          {description}
        </Text>
      </View>
      <IconButton icon="close" />
    </View>
  );
}
