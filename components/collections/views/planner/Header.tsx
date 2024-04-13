import { columnStyles } from "@/components/collections/columnStyles";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import React from "react";
import { View } from "react-native";
import { usePlannerContext } from "./context";

export function Header({ start, end }) {
  const { type } = usePlannerContext();
  const isToday = dayjs().isBetween(start, end);

  const formats = {
    heading: {
      week: "DD",
      month: "[#]W",
      year: "MMMM",
    }[type],
    subheading: {
      week: "dddd",
      month: "Do",
      year: "-",
    }[type],
  };
  const theme = useColorTheme();

  return (
    <View style={[columnStyles.header, { flexDirection: "column", gap: 0 }]}>
      <View
        style={{
          borderRadius: 20,
          paddingVertical: 5,
          paddingHorizontal: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <Text
          weight={900}
          style={{
            color: theme[11],
            opacity: isToday ? 1 : 0.7,
            fontSize: 22,
          }}
        >
          {dayjs(start).format(formats.heading)}
        </Text>
        {formats.subheading !== "-" && (
          <Text
            style={{
              fontSize: 17,
              color: theme[11],
              opacity: isToday ? 1 : 0.7,
            }}
            weight={700}
          >
            {dayjs(start).format(formats.subheading)}
            {type === "month" && (
              <> - {dayjs(end).format(formats.subheading)}</>
            )}
          </Text>
        )}
      </View>
      <View
        style={{
          backgroundColor: theme[isToday ? 11 : 5],
          width: 25,
          height: 5,
          borderRadius: 99,
        }}
      />
    </View>
  );
}
