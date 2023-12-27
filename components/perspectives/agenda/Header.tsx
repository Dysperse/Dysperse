import Text from "@/ui/Text";
import dayjs from "dayjs";
import React from "react";
import { View } from "react-native";
import { useAgendaContext } from "@/app/(app)/[tab]/perspectives/agenda/context";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";

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
    <LinearGradient
      colors={[theme[3], theme[2]]}
      style={{
        gap: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
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
          textStyle={{
            fontFamily: "body_700",
            color: theme[isToday ? 2 : 11],
            fontSize: 20,
          }}
        >
          {dayjs(start).format(formats.heading)}
        </Text>
      </View>
      <Text textStyle={{ fontFamily: "body_600", fontSize: 20 }}>
        {dayjs(start).format(formats.subheading)}
        {type === "month" && <> - {dayjs(end).format(formats.subheading)}</>}
      </Text>
    </LinearGradient>
  );
}
