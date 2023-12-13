import Text from "@/ui/Text";
import dayjs from "dayjs";
import React from "react";
import { View } from "react-native";
import { useAgendaContext } from "@/app/(app)/perspectives/agenda/context";

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

  return (
    <View
      className="flex-row items-center justify-center border-b border-gray-200 p-5"
      style={{ gap: 20 }}
    >
      <View
        className={`min-w-9 px-3 h-9 ${
          isToday ? "bg-gray-700" : "bg-gray-200"
        } rounded-lg items-center justify-center`}
      >
        <Text
          textClassName={`text-xl ${isToday ? "text-white" : "text-black"}`}
          textStyle={{ fontFamily: "body_700" }}
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
