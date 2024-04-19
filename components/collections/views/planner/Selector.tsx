import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
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
    width: "100%",
    borderWidth: 1,
    borderColor: "transparent",
  },
  innerText: {
    fontSize: 18,
  },
});

const SelectionButton = memo(function SelectionButton({
  itemStart,
  itemEnd,
  type,
}: {
  itemStart: string;
  itemEnd: string;
  type: string;
}) {
  const { start } = useLocalSearchParams();
  const theme = useColorTheme();
  const isSelected =
    dayjs(itemStart).toISOString() === start ||
    (!start && dayjs().isBetween(itemStart, itemEnd));

  const handlePress = () => {
    if (isSelected) return;
    router.setParams({
      start: dayjs(itemStart).toISOString(),
    });
  };

  const isToday = dayjs(itemStart).isSame(dayjs(), "day");

  return (
    <TouchableOpacity style={styles.item} onPress={handlePress}>
      {buttonTextFormats(type).small !== "-" && (
        <Text weight={400} style={[styles.label, { color: theme[12] }]}>
          {dayjs(itemStart)
            .format(buttonTextFormats(type).small)
            .substring(0, type === "week" ? 1 : 999)}
          {type === "month" &&
            " - " + dayjs(itemEnd).format(buttonTextFormats(type).small)}
        </Text>
      )}
      <View
        style={[
          styles.inner,
          isSelected && {
            backgroundColor: theme[10],
          },
          isToday && {
            borderColor: theme[isSelected ? 10 : 6],
          },
        ]}
      >
        <Text
          weight={500}
          style={[
            styles.innerText,
            {
              color: theme[isSelected ? 1 : 12],
            },
          ]}
        >
          {dayjs(itemStart).format(buttonTextFormats(type).big)}
        </Text>
      </View>
    </TouchableOpacity>
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
            itemEnd={item?.end}
            type={type}
          />
        ))}
    </View>
  );
}
