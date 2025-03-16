import { useStorageContext } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { router } from "expo-router";
import { useCallback, useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { CreateCollectionModal } from "../collections/create";

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
        />
      )}
    </TouchableOpacity>
  );
}

export function Actions() {
  const theme = useColorTheme();
  const createRef = useRef(null);

  return (
    <View>
      <Text variant="eyebrow" style={actionStyles.title}>
        Start
      </Text>
      <CreateCollectionModal ref={createRef}>
        <TouchableOpacity style={actionStyles.item}>
          <Icon>note_stack_add</Icon>
          <Text style={{ color: theme[11] }} numberOfLines={1}>
            New collection
          </Text>
        </TouchableOpacity>
      </CreateCollectionModal>
      <PlanDayPrompt />
      <TouchableOpacity
        style={actionStyles.item}
        onPress={() => router.push("/insights")}
      >
        <Icon>emoji_objects</Icon>
        <Text style={{ color: theme[11] }} numberOfLines={1}>
          Insights
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={actionStyles.item}
        onPress={() => router.push("/friends")}
      >
        <Icon>group</Icon>
        <Text style={{ color: theme[11] }} numberOfLines={1}>
          Friends
        </Text>
      </TouchableOpacity>
    </View>
  );
}

