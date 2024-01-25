import { columnStyles } from "@/components/collections/columnStyles";
import { useAgendaContext } from "@/components/collections/views/agenda-context";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import React from "react";
import { View } from "react-native";

export function Header({ start, end }) {
  const { type } = useAgendaContext();
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
    <View style={columnStyles.header}>
      <View
        style={{
          backgroundColor: theme[isToday ? 3 : 2],
          borderWidth: 1,
          borderColor: theme[isToday ? 4 : 2],
          borderRadius: 20,
          paddingVertical: 10,
          paddingHorizontal: 15,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <View
          style={{
            minWidth: 40,
            height: 20,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 10,
            borderColor: theme[6],
            borderRightWidth: 2,
          }}
        >
          <Text
            weight={600}
            style={{
              color: theme[11],
              fontSize: 25,
            }}
          >
            {dayjs(start).format(formats.heading)}
          </Text>
        </View>
        {formats.subheading !== "-" && (
          <Text
            style={{ fontSize: 20, color: theme[11], opacity: 0.7 }}
            weight={300}
          >
            {dayjs(start).format(formats.subheading)}
            {type === "month" && (
              <> - {dayjs(end).format(formats.subheading)}</>
            )}
          </Text>
        )}
      </View>
    </View>
  );
}
