import { useAgendaContext } from "@/components/collections/views/agenda-context";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

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
    borderWidth: 1,
    aspectRatio: "1 / 1",
    width: "100%",
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
  console.log(start);
  const isSelected = dayjs(itemStart).format("YYYY-MM-DD") === start;

  const handlePress = () => {
    if (isSelected) return;
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
            ...(isSelected && {
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
  const { type, start } = useAgendaContext();

  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 10,
        backgroundColor: theme[3],
        paddingBottom: 10,
      }}
    >
      {data.map((item, index) => (
        <SelectionButton
          start={start}
          key={index}
          itemStart={item?.start}
          itemEnd={item?.end}
          type={type}
        />
      ))}
    </View>
  );
}
