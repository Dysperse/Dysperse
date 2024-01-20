import { columnStyles } from "@/components/collections/columnStyles";
import { useAgendaContext } from "@/components/collections/views/agenda-context";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
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
    <LinearGradient colors={[theme[3], theme[2]]} style={columnStyles.header}>
      <View
        style={{
          borderRadius: 15,
          minWidth: 45,
          height: 35,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 8,
          backgroundColor: theme[isToday ? 11 : 4],
        }}
      >
        <Text
          weight={700}
          style={{
            color: theme[isToday ? 2 : 11],
            fontSize: 20,
          }}
        >
          {dayjs(start).format(formats.heading)}
        </Text>
      </View>
      {formats.subheading !== "-" && (
        <Text style={{ fontSize: 20 }} weight={600}>
          {dayjs(start).format(formats.subheading)}
          {type === "month" && <> - {dayjs(end).format(formats.subheading)}</>}
        </Text>
      )}
    </LinearGradient>
  );
}
