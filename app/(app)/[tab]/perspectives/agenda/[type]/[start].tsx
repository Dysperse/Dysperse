import { ContentWrapper } from "@/components/layout/content";
import { Column } from "@/components/perspectives/agenda/Column";
import { PerspectivesNavbar } from "@/components/perspectives/agenda/Navbar";
import ErrorAlert from "@/ui/Error";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs, { ManipulateType, OpUnitType } from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { AgendaContext, useAgendaContext } from "../context";
import Skeleton from "@/ui/Skeleton";

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

  const flatListRef = useRef(null);
  // scroll to active item in the flat list
  useEffect(() => {
    if (currentColumn && Platform.OS !== "web" && data) {
      const index = data.findIndex((i) => i.start === currentColumn.start);
      if (index !== -1) {
        setTimeout(() => {
          flatListRef.current.scrollToIndex({ index, viewPosition: 0.5 });
        }, 100);
      }
    }
  }, [currentColumn, data]);

  const agendaFallback = (
    <View
      style={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {error ? (
        <ErrorAlert />
      ) : (
        <>
          <View
            style={{
              backgroundColor: theme[3],
              flexDirection: "row",
              width: "100%",
              paddingBottom: 12,
              paddingHorizontal: 15,
              gap: 25,
              alignItems: "center",
            }}
          >
            {[...new Array(5)].map((_, i) => (
              <View key={i} style={{ alignItems: "center", gap: 3 }}>
                <Skeleton width={20} height={10} isLoading />
                <Skeleton size={50} rounded isLoading />
              </View>
            ))}
          </View>
          <View
            style={{
              paddingHorizontal: 10,
              flexDirection: "row",
              gap: 20,
              paddingVertical: 20,
            }}
          >
            <Skeleton width={width * 0.8 - 70} height={35} isLoading />
            <Skeleton width={width * 0.2} height={35} isLoading />
          </View>
          <View style={{ gap: 20 }}>
            {[...new Array(5)].map((_, i) => (
              <Skeleton width={width - 50} height={70} key={i} isLoading />
            ))}
          </View>
        </>
      )}
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
            ref={flatListRef}
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
              <TouchableOpacity
                style={{
                  height: 65,
                  width: 55,
                  borderRadius: 25,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                }}
                onPress={() => setCurrentColumn(item)}
              >
                {buttonTextFormats.small !== "-" && (
                  <Text
                    weight={400}
                    style={{
                      fontSize: 13,
                      opacity: 0.6,
                      textAlign: "center",
                      color: theme[12],
                    }}
                  >
                    {dayjs(item.start)
                      .format(buttonTextFormats.small)
                      .substring(0, type === "week" ? 1 : 999)}
                    {type === "month" &&
                      " - " + dayjs(item.end).format(buttonTextFormats.small)}
                  </Text>
                )}
                <View
                  style={{
                    width: 50,
                    height: 50,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 99,
                    borderWidth: 1,
                    borderColor: theme[6],
                    ...(item?.start === currentColumn?.start && {
                      backgroundColor: theme[10],
                      borderColor: theme[10],
                    }),
                  }}
                >
                  <Text
                    weight={500}
                    style={{
                      fontSize: 18,
                      color:
                        theme[item?.start === currentColumn?.start ? 1 : 12],
                    }}
                  >
                    {dayjs(item.start).format(buttonTextFormats.big)}
                  </Text>
                </View>
              </TouchableOpacity>
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
