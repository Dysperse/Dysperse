import { ContentWrapper } from "@/components/layout/content";
import { Column } from "@/components/perspectives/agenda/Column";
import PerspectivesNavbar from "@/components/perspectives/agenda/Navbar";
import { AgendaSelector } from "@/components/perspectives/agenda/Selector";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import ErrorAlert from "@/ui/Error";
import Skeleton from "@/ui/Skeleton";
import Spinner from "@/ui/Spinner";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs, { ManipulateType, OpUnitType } from "dayjs";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Platform, View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { AgendaContext, useAgendaContext } from "../context";

function Agenda() {
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  const breakpoints = useResponsiveBreakpoints();
  const params = useLocalSearchParams();
  const { type, start, end } = useAgendaContext();
  const { data, mutate, error } = useSWR([
    "space/perspectives/agenda",
    {
      start: start.toISOString(),
      end: end.toISOString(),
      type,
    },
  ]);

  const column =
    typeof data?.find === "function"
      ? data.find((col) =>
          dayjs(params.start as any).isBetween(col.start, col.end, null, "[]")
        )
      : null;
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
  if (breakpoints.md) {
    return (
      <ContentWrapper>
        <PerspectivesNavbar
          error={Boolean(error)}
          currentDateStart={column?.start}
          currentDateEnd={column?.end}
        />
        <ScrollView
          horizontal
          contentContainerStyle={{
            flexDirection: "row",
            gap: 15,
            padding: 15,
            height: "100%",
            width: Array.isArray(data) ? undefined : "100%",
          }}
        >
          {Array.isArray(data) ? (
            data.map((col) => (
              <Column mutate={mutate} key={col.start} column={col} />
            ))
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Spinner />
            </View>
          )}
        </ScrollView>
      </ContentWrapper>
    );
  }
  return (
    <ContentWrapper noPaddingTop>
      <PerspectivesNavbar
        error={Boolean(error)}
        currentDateStart={column?.start}
        currentDateEnd={column?.end}
      />
      {data ? (
        <View
          style={{
            flex: 1,
            ...(Platform.OS === "web" &&
              ({ maxHeight: "calc(100dvh - 120px)" } as any)),
          }}
        >
          <AgendaSelector type={type} data={data} start={column?.start} />
          <Column mutate={mutate} column={column} />
        </View>
      ) : (
        agendaFallback
      )}
    </ContentWrapper>
  );
}

export default function Page() {
  const { type, start } = useLocalSearchParams();

  const agendaContextValue = useMemo(() => {
    return {
      type: type as string,
      start: dayjs(start as string).startOf(type as OpUnitType),
      end: dayjs(start as string)
        .startOf(type as OpUnitType)
        .add(1, type as ManipulateType),
    };
  }, [type, start]);

  return (
    <AgendaContext.Provider value={agendaContextValue}>
      <Agenda />
    </AgendaContext.Provider>
  );
}
