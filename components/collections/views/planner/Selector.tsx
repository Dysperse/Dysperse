import { getTaskCompletionStatus } from "@/helpers/getTaskCompletionStatus";
import { Button } from "@/ui/Button";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { memo } from "react";
import { Platform, StyleSheet, View } from "react-native";
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
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    marginTop: 3,
    padding: 3,
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    aspectRatio: "1 / 1",
    maxWidth: 40,
    maxHeight: 40,
    width: "100%",
    borderWidth: 2,
    borderColor: "transparent",
  },
  innerText: {
    // fontFamily: "serifText800",
    fontSize: 19,
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
    impactAsync(ImpactFeedbackStyle.Light);
    if (isSelected) return;
    router.setParams({
      start: dayjs(itemStart).toISOString(),
    });
  };

  const isToday =
    dayjs(itemStart).isSame(dayjs(), "day") || !dayjs(start as any).isValid();

  return (
    <View style={[styles.item]}>
      <Button height={80} style={styles.item} onPress={handlePress}>
        {buttonTextFormats(type).small !== "-" && (
          <Text weight={400} style={[styles.label, { color: theme[11] }]}>
            {dayjs(itemStart)
              .format(buttonTextFormats(type).small)
              .substring(0, type === "week" ? 1 : 999)}
          </Text>
        )}
        <View
          style={[
            styles.inner,
            Platform.OS === "web" && { minWidth: 35 },
            isSelected && { backgroundColor: theme[5] },
            isToday && { borderColor: theme[isSelected ? 5 : 4] },
          ]}
        >
          <Text style={[styles.innerText, { color: theme[11] }]} weight={700}>
            {dayjs(itemStart).format(buttonTextFormats(type).big)}
          </Text>
        </View>
        <View
          style={{
            height: 4,
            flexDirection: "row",
            gap: 3,
            marginBottom: 10,
          }}
        >
          {[...new Array(Math.min(3, items?.length))].map((_, index) => (
            <View
              key={index}
              style={{
                width: 2.5,
                height: 2.5,
                backgroundColor: theme[7],
                borderRadius: 99,
              }}
            />
          ))}
        </View>
      </Button>
    </View>
  );
});

export function AgendaSelector({ data }) {
  const { type } = usePlannerContext();

  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 10,
        paddingBottom: 10,
      }}
    >
      {Array.isArray(data) &&
        data.map((item, index) => (
          <SelectionButton
            key={index}
            itemStart={item?.start}
            items={
              item?.entities &&
              Object.values(item.entities).filter(
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

