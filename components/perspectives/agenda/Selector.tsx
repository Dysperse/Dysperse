import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { router } from "expo-router";
import React, { memo, useRef } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

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
    fontSize: 13,
    opacity: 0.6,
    textAlign: "center",
  },
  item: {
    height: 65,
    width: 55,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  inner: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 99,
    borderWidth: 1,
  },
  innerText: {
    fontSize: 18,
  },
});

const SelectionButton = memo(function SelectionButton({
  start,
  itemStart,
  itemEnd,
  type,
}: {
  start: string;
  itemStart: string;
  itemEnd: string;
  type: string;
}) {
  const theme = useColorTheme();
  const handlePress = () => {
    if (itemStart === start) return;
    router.setParams({
      start: dayjs(itemStart).format("YYYY-MM-DD"),
    });
  };

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
          {
            borderColor: theme[6],
            ...(itemStart === start && {
              backgroundColor: theme[10],
              borderColor: theme[10],
            }),
          },
        ]}
      >
        <Text
          weight={500}
          style={[
            styles.innerText,
            { color: theme[itemStart === start ? 1 : 12] },
          ]}
        >
          {dayjs(itemStart).format(buttonTextFormats(type).big)}
        </Text>
      </View>
    </TouchableOpacity>
  );
});
export function AgendaSelector({ type, data, start }) {
  const theme = useColorTheme();
  const flatListRef = useRef(null);

  return (
    <FlatList
      ref={flatListRef}
      horizontal
      data={data}
      contentContainerStyle={styles.contentContainer}
      style={[styles.list, { backgroundColor: theme[3] }]}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <SelectionButton
          start={start}
          itemStart={item?.start}
          itemEnd={item?.end}
          type={type}
        />
      )}
      keyExtractor={(i) => `${i.start}-${i.end}`}
    />
  );
}
