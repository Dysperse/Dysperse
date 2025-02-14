import { useCommandPaletteContext } from "@/components/command-palette/context";
import { useStorageContext } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { router } from "expo-router";
import { useCallback } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import useSWR from "swr";

const actionStyles = StyleSheet.create({
  title: {
    marginBottom: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 20,
    paddingVertical: 5,
  },
});

const styles = StyleSheet.create({
  badge: {
    width: 20,
    height: 20,
    borderRadius: 99,
    marginLeft: -10,
    alignItems: "center",
    justifyContent: "center",
  },
  sharedText: {
    fontSize: 12,
    paddingTop: 1,
  },
});

export function PlanDayPrompt() {
  const { session } = useUser();
  const theme = useColorTheme();
  const handlePress = useCallback(() => {
    router.push("/plan");
  }, []);

  const hasCompleted = dayjs(session?.user?.profile?.lastPlanned).isToday();
  const { isReached } = useStorageContext();

  return (
    <TouchableOpacity
      style={[actionStyles.item, isReached && { opacity: 0.5 }]}
      onPress={handlePress}
      disabled={isReached}
    >
      <Icon>psychiatry</Icon>
      <Text style={{ color: theme[11] }} numberOfLines={1}>
        Plan my day
      </Text>
      {!hasCompleted && (
        <View
          style={[
            styles.badge,
            { backgroundColor: theme[9], width: 10, height: 10 },
          ]}
        ></View>
      )}
    </TouchableOpacity>
  );
}

export function Actions() {
  const theme = useColorTheme();
  const { handleOpen } = useCommandPaletteContext();

  const { data: sharedWithMe } = useSWR(["user/collectionAccess"]);
  const hasUnread =
    Array.isArray(sharedWithMe) && sharedWithMe?.filter((c) => !c.hasSeen);

  return (
    <View style={{ marginBottom: Platform.OS === "web" ? 0 : -20 }}>
      <Text variant="eyebrow" style={actionStyles.title}>
        Start
      </Text>
      <PlanDayPrompt />
      <TouchableOpacity
        style={actionStyles.item}
        onPress={() => router.push("/insights")}
      >
        <Icon>emoji_objects</Icon>
        <Text style={{ color: theme[11] }} numberOfLines={1}>
          My insights
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={actionStyles.item}
        onPress={() => handleOpen("Shared with me")}
      >
        <Icon>group</Icon>
        <Text style={{ color: theme[11] }} numberOfLines={1}>
          Shared with me
        </Text>
        {Array.isArray(hasUnread) && hasUnread?.length > 0 && (
          <View style={[styles.badge, { backgroundColor: theme[9] }]}>
            <Text style={styles.sharedText} weight={900}>
              {sharedWithMe.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

