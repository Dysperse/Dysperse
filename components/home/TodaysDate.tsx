import { styles } from "@/components/home/styles";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { router } from "expo-router";
import { Pressable } from "react-native";

export function TodaysDate() {
  const theme = useColorTheme();
  const handlePress = () => router.push("/clock");

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed, hovered }: any) => [
        styles.card,
        {
          backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
        },
      ]}
    >
      <Icon size={40} style={{ marginLeft: -4 }}>
        calendar_today
      </Icon>
      <Text
        style={{ fontSize: 20, marginTop: 5 }}
        weight={700}
        numberOfLines={1}
      >
        {dayjs().format("MMM Do")}
      </Text>
      <Text numberOfLines={1}>{dayjs().format("YYYY")}</Text>
    </Pressable>
  );
}
