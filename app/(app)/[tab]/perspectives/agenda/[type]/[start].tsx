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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSWR from "swr";
import { AgendaContext, useAgendaContext } from "../context";

function Agenda() {
  const theme = useColorTheme();
  const { type, start, end } = useAgendaContext();
  const { data, error } = useSWR([
    "space/tasks/perspectives",
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
        router.push(
          `/perspectives/agenda/${type}/${dayjs().format("YYYY-MM-DD")}`
        );
    }
  }, [data, setCurrentColumn, type]);

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  if (width > 600) {
    return (
      <View
        style={{
          marginTop: insets.top + 64,
          backgroundColor: theme[1],
          borderTopLeftRadius: 20,
          flex: 1,
        }}
      >
        <PerspectivesNavbar
          handleToday={handleToday}
          currentDateStart={currentColumn?.start}
          currentDateEnd={currentColumn?.end}
        />
        <ScrollView
          horizontal
          contentContainerStyle={{
            flexDirection: "row",
            width: "100%",
            paddingTop: 70,
          }}
        >
          {data ? (
            data.map((col) => (
              <Column header={() => <></>} key={col.start} column={col} />
            ))
          ) : error ? (
            <View
              style={{
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ErrorAlert />
            </View>
          ) : (
            <View className="items-center justify-center w-full">
              <ActivityIndicator />
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  const buttonTextFormats = {
    small: {
      week: "ddd",
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
    <>
      <PerspectivesNavbar
        handleToday={handleToday}
        currentDateStart={currentColumn?.start}
        currentDateEnd={currentColumn?.end}
      />
      {data ? (
        <View style={{ overflow: "hidden", flex: 1 }}>
          {currentColumn && (
            <Column
              column={currentColumn}
              header={() => (
                <FlatList
                  horizontal
                  data={data}
                  contentContainerStyle={{
                    gap: 15,
                    paddingVertical: 20,
                    paddingHorizontal: 20,
                  }}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <Pressable
                      style={({ pressed, hovered }: any) => ({
                        height: 65,
                        width: 65,
                        borderWidth: 2,
                        borderRadius: 25,
                        alignItems: "center",
                        justifyContent: "center",
                        borderColor: theme[pressed ? 7 : hovered ? 6 : 5],
                        backgroundColor: theme[pressed ? 3 : 1],
                        ...(item?.start === currentColumn?.start && {
                          backgroundColor: theme[pressed ? 10 : 9],
                          borderColor: theme[pressed ? 10 : 9],
                        }),
                      })}
                      onPress={() => setCurrentColumn(item)}
                    >
                      {buttonTextFormats.small !== "-" && (
                        <Text
                          textClassName="uppercase text-xs opacity-60"
                          style={{
                            fontFamily: "body_400",
                            textAlign: "center",
                            color:
                              theme[
                                item?.start === currentColumn?.start ? 1 : 12
                              ],
                          }}
                        >
                          {dayjs(item.start).format(buttonTextFormats.small)}
                          {type === "month" &&
                            " - " +
                              dayjs(item.end).format(buttonTextFormats.small)}
                        </Text>
                      )}
                      <Text
                        textClassName="text-xl"
                        style={{
                          fontFamily: "body_500",
                          color:
                            theme[
                              item?.start === currentColumn?.start ? 1 : 12
                            ],
                        }}
                      >
                        {dayjs(item.start).format(buttonTextFormats.big)}
                      </Text>
                    </Pressable>
                  )}
                  keyExtractor={(i) => `${i.start}-${i.end}`}
                />
              )}
            />
          )}
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      )}
    </>
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
