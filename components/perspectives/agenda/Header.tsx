import Text from "@/ui/Text";
import dayjs from "dayjs";
import React from "react";
import { View } from "react-native";
import { useAgendaContext } from "@/app/(app)/[tab]/perspectives/agenda/context";
import { useColorTheme } from "@/ui/color/theme-provider";

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
    <View
      className="flex-row items-center justify-center p-5"
      style={{
        gap: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme[5],
      }}
    >
      <View
        className={`min-w-9 px-2 h-8 rounded-xl items-center justify-center`}
        style={{
          backgroundColor: theme[isToday ? 11 : 3],
        }}
      >
        <Text
          textClassName={`text-xl`}
          textStyle={{ fontFamily: "body_700", color: theme[isToday ? 2 : 11] }}
        >
          {dayjs(start).format(formats.heading)}
        </Text>
      </View>
      <Text textClassName="text-xl" textStyle={{ fontFamily: "body_600" }}>
        {dayjs(start).format(formats.subheading)}
        {type === "month" && <> - {dayjs(end).format(formats.subheading)}</>}
      </Text>
    </View>
  );
}
