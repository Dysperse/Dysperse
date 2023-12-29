import { ContentWrapper } from "@/components/layout/content";
import { Column } from "@/components/perspectives/agenda/Column";
import { PerspectivesNavbar } from "@/components/perspectives/agenda/Navbar";
import ErrorAlert from "@/ui/Error";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs, { ManipulateType, OpUnitType } from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { AgendaContext, useAgendaContext } from "../context";

function Agenda() {
  const theme = useColorTheme();
  const { type, start, end } = useAgendaContext();
  const { data, mutate, error } = useSWR([
    "space/perspectives/agenda",
    {
      start: start.toISOString(),
      end: end.toISOString(),
      type,
    },
  ]);

  const [currentColumn, setCurrentColumn] = useState(null);

  useEffect(() => {
    if (data?.length > 1)
      setCurrentColumn(
        data.find((i) =>
          dayjs().utc().isBetween(dayjs(i.start), dayjs(i.end))
        ) || data[0]
      );
  }, [data, setCurrentColumn]);

  const handleToday = useCallback(() => {
    if (data?.length > 1) {
      const c = data.find((i) =>
        dayjs().utc().isBetween(dayjs(i.start), dayjs(i.end))
      );
      if (c) setCurrentColumn(c);
      else
        router.setParams({
          start: dayjs().format("YYYY-MM-DD"),
        });
    }
  }, [data, setCurrentColumn]);

  const { width } = useWindowDimensions();

  const agendaFallback = (
    <View
      style={{
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      {error ? <ErrorAlert /> : <ActivityIndicator />}
    </View>
  );

  if (width > 600) {
    return (
      <ContentWrapper>
        <PerspectivesNavbar
          handleToday={handleToday}
          currentDateStart={currentColumn?.start}
          currentDateEnd={currentColumn?.end}
        />
        <ScrollView
          horizontal
          contentContainerStyle={{
            flexDirection: "row",
            padding: 15,
            gap: 15,
            flex: 1,
          }}
        >
          {data
            ? data.map((col) => (
                <Column mutate={mutate} key={col.start} column={col} />
              ))
            : agendaFallback}
        </ScrollView>
      </ContentWrapper>
    );
  }

  const buttonTextFormats = {
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
  };

  return (
    <View style={{ flex: 1 }}>
      <PerspectivesNavbar
        handleToday={handleToday}
        currentDateStart={currentColumn?.start}
        currentDateEnd={currentColumn?.end}
      />
      {data ? (
        <>
          <FlatList
            horizontal
            data={data}
            contentContainerStyle={{
              gap: 15,
              paddingBottom: 10,
              paddingHorizontal: 20,
            }}
            style={{
              backgroundColor: theme[3],
              flexGrow: 0,
              flexShrink: 0,
            }}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed, hovered }: any) => ({
                  height: 65,
                  width: 55,
                  borderRadius: 25,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme[pressed ? 5 : 4],
                  ...(item?.start === currentColumn?.start && {
                    backgroundColor: theme[pressed ? 11 : 10],
                  }),
                })}
                onPress={() => setCurrentColumn(item)}
              >
                {buttonTextFormats.small !== "-" && (
                  <Text
                    weight={400}
                    style={{
                      fontSize: 13,
                      opacity: 0.6,
                      textAlign: "center",
                      color:
                        theme[item?.start === currentColumn?.start ? 1 : 12],
                    }}
                  >
                    {dayjs(item.start).format(buttonTextFormats.small)}
                    {type === "month" &&
                      " - " + dayjs(item.end).format(buttonTextFormats.small)}
                  </Text>
                )}
                <Text
                  weight={500}
                  style={{
                    fontSize: 20,
                    color: theme[item?.start === currentColumn?.start ? 1 : 12],
                  }}
                >
                  {dayjs(item.start).format(buttonTextFormats.big)}
                </Text>
              </Pressable>
            )}
            keyExtractor={(i) => `${i.start}-${i.end}`}
          />
          {currentColumn && <Column mutate={mutate} column={currentColumn} />}
        </>
      ) : (
        agendaFallback
      )}
    </View>
  );
}

export default function Page() {
  const { type, start } = useLocalSearchParams();

  return (
    <AgendaContext.Provider
      value={{
        type: type as string,
        start: dayjs(start as string).startOf(type as OpUnitType),
        end: dayjs(start as string)
          .startOf(type as OpUnitType)
          .add(1, type as ManipulateType),
      }}
    >
      <Agenda />
    </AgendaContext.Provider>
  );
}
