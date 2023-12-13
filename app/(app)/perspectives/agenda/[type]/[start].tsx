import { Column } from "@/components/perspectives/agenda/Column";
import { PerspectivesNavbar } from "@/components/perspectives/agenda/Navbar";
import ErrorAlert from "@/ui/Error";
import Text from "@/ui/Text";
import { WINDOW_WIDTH } from "@gorhom/bottom-sheet";
import dayjs, { ManipulateType, OpUnitType } from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { AgendaContext, useAgendaContext } from "../context";

function Agenda() {
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
  }, [data, setCurrentColumn, router, type]);

  if (WINDOW_WIDTH > 600) {
    return true ? (
      <ErrorAlert />
    ) : (
      <>
        <PerspectivesNavbar
          handleToday={handleToday}
          currentDateStart={currentColumn?.start}
          currentDateEnd={currentColumn?.end}
        />
        <ScrollView
          horizontal
          contentContainerStyle={{ flexDirection: "row", width: "100%" }}
        >
          {data ? (
            data.map((col) => (
              <Column header={() => <></>} key={col.start} column={col} />
            ))
          ) : error ? (
            <ErrorAlert />
          ) : (
            <View className="items-center justify-center w-full">
              <ActivityIndicator />
            </View>
          )}
        </ScrollView>
      </>
    );
  }

  const buttonTextFormats = {
    small: {
      week: "ddd",
      month: "#W",
      year: "-",
    }[type],
    big: {
      week: "DD",
      month: "DD",
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
        <View>
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
                      className={`
              h-16 w-16 flex active:bg-gray-200 border-2 border-gray-100 active:border-gray-200 rounded-2xl items-center justify-center
              ${
                item?.start === currentColumn?.start
                  ? "bg-gray-200 border-gray-200 active:bg-gray-300 active:border-gray-300"
                  : ""
              }
              `}
                      onPress={() => setCurrentColumn(item)}
                    >
                      {buttonTextFormats.small !== "-" && (
                        <Text
                          textClassName="uppercase text-xs opacity-60"
                          style={{ fontFamily: "body_400" }}
                        >
                          {dayjs(item.start).format(buttonTextFormats.small)}
                          {type === "month" &&
                            " - " +
                              dayjs(item.end).format(buttonTextFormats.big)}
                        </Text>
                      )}
                      <Text
                        textClassName="text-xl"
                        style={{ fontFamily: "body_500" }}
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
        <ActivityIndicator />
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
      <StatusBar barStyle="dark-content" />
      <Agenda />
    </AgendaContext.Provider>
  );
}
