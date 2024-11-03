import { getTaskCompletionStatus } from "@/helpers/getTaskCompletionStatus";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { memo } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { usePlannerContext } from "./context";

const buttonTextFormats = (type: string) => ({
  small: {
    week: "dd",
    month: "Do",
    year: "-",
  }[type],
  big: {
    week: "DD",
    month: "[W]W",
    year: "MMM",
  }[type],
});

const styles = StyleSheet.create({
  contentContainer: {
    gap: 15,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  list: {
    flexGrow: 0,
    flexShrink: 0,
  },
  label: {
    fontSize: 11,
    marginBottom: 1,
    marginTop: 2,
    opacity: 0.6,
    maxHeight: 13,
    textAlign: "center",
  },
  item: {
    height: 65,
    flex: 1,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    padding: 3,
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 99,
    aspectRatio: "1 / 1",
    maxWidth: 45,
    maxHeight: 45,
    width: "100%",
    borderWidth: 1,
    borderColor: "transparent",
  },
  innerText: {
    fontSize: 17,
  },
});

const SelectionButton = memo(function SelectionButton({
  itemStart,
  itemEnd,
  type,
  items,
}: {
  itemStart: string;
  itemEnd: string;
  type: string;
  items: any;
}) {
  const { start } = useLocalSearchParams();
  const theme = useColorTheme();
  const isSelected =
    dayjs(itemStart).toISOString() === start ||
    (!start && dayjs().startOf("day").isBetween(itemStart, itemEnd));

  const handlePress = () => {
    if (isSelected) return;
    router.setParams({
      start: dayjs(itemStart).toISOString(),
    });
  };

  const isToday =
    dayjs(itemStart).isSame(dayjs(), "day") || !dayjs(start as any).isValid();

  return (
    <View style={[styles.item]}>
      <Pressable
        android_ripple={{ color: theme[6] }}
        style={styles.item}
        onPress={handlePress}
      >
        {buttonTextFormats(type).small !== "-" && (
          <Text weight={400} style={[styles.label, { color: theme[12] }]}>
            {dayjs(itemStart)
              .format(buttonTextFormats(type).small)
              .substring(0, type === "week" ? 1 : 999)}
          </Text>
        )}
        <View
          style={[
            styles.inner,
            Platform.OS === "web" && { minWidth: 35 },
            isSelected && { backgroundColor: theme[10] },
            isToday && { borderColor: theme[isSelected ? 10 : 6] },
          ]}
        >
          <Text
            weight={500}
            style={[styles.innerText, { color: theme[isSelected ? 1 : 12] }]}
          >
            {dayjs(itemStart).format(buttonTextFormats(type).big)}
          </Text>
        </View>
        <View
          style={{
            height: 4,
            flexDirection: "row",
            gap: 3,
            marginBottom: -6,
            marginTop: 1,
          }}
        >
          {[...new Array(Math.min(3, items?.length))].map((_, index) => (
            <View
              key={index}
              style={{
                width: 4,
                height: 4,
                backgroundColor: theme[11],
                borderRadius: 99,
              }}
            />
          ))}
        </View>
      </Pressable>
    </View>
  );
});

export function AgendaSelector({ data }) {
  const theme = useColorTheme();
  const { type } = usePlannerContext();

  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 10,
        backgroundColor: theme[3],
        paddingBottom: 10,
      }}
    >
      {Array.isArray(data) &&
        data.map((item, index) => (
          <SelectionButton
            key={index}
            itemStart={item?.start}
            items={
              item?.tasks &&
              Object.values(item.tasks).filter(
                (task) => !getTaskCompletionStatus(task, task?.recurrenceDay)
              )
            }
            itemEnd={item?.end}
            type={type}
          />
        ))}
    </View>
  );
}

