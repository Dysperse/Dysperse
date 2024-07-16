import { styles as homeStyles } from "@/components/home/styles";
import { useUser } from "@/context/useUser";
import { Avatar } from "@/ui/Avatar";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { router } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  subtitle: { fontSize: 14, opacity: 0.7, marginTop: 1.5 },
  base: { minHeight: 90, borderWidth: 2 },
});

export function PlanDayPrompt() {
  const { session } = useUser();
  const theme = useColorTheme();
  const handlePress = useCallback(() => {
    router.push("/plan");
  }, []);

  const hasCompleted = dayjs(session?.user?.profile?.lastPlanned).isToday();

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed, hovered }) => [
        homeStyles.card,
        styles.base,
        hasCompleted && { borderWidth: 1 },
        {
          borderColor: hasCompleted ? theme[5] : theme[8],
          backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
        },
      ]}
    >
      <Icon size={35}>stylus_note</Icon>
      <View style={{ flex: 1 }}>
        <Text
          weight={900}
          style={{ fontSize: 18, color: theme[11] }}
          numberOfLines={1}
        >
          Plan your day
        </Text>
        <Text style={[styles.subtitle, { color: theme[11] }]} numberOfLines={1}>
          {hasCompleted ? "Complete!" : "Tap to begin"}
        </Text>
      </View>
      <Avatar
        disabled
        icon={hasCompleted ? "check" : "arrow_forward_ios"}
        style={{
          backgroundColor: hasCompleted ? theme[9] : "transparent",
        }}
        iconProps={{
          bold: true,
          style: {
            color: hasCompleted ? theme[1] : theme[11],
          },
        }}
      />
    </Pressable>
  );
}
