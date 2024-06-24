import { Column } from "@/components/collections/views/planner/Column";
import { AgendaSelector } from "@/components/collections/views/planner/Selector";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import dayjs, { ManipulateType, OpUnitType } from "dayjs";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Platform, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { AgendaContext, usePlannerContext } from "./context";

function Agenda() {
  const breakpoints = useResponsiveBreakpoints();
  const params = useLocalSearchParams();
  const { type, start, end } = usePlannerContext();

  const { data, mutate, error } = useSWR([
    "space/collections/collection/planner",
    {
      start: start.toISOString(),
      end: end.toISOString(),
      type,
      timezone: dayjs.tz.guess(),
      id: params.id,
      ...(params.id === "all" && { all: true }),
    },
  ]);

  const column =
    typeof data?.find === "function"
      ? data.find(
          (col) =>
            dayjs(params.start as any).toISOString() ===
            dayjs(col.start).toISOString()
        ) || data.find((col) => dayjs().isBetween(col.start, col.end))
      : null;

  const agendaFallback = (
    <View
      style={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
      }}
    >
      {error ? <ErrorAlert /> : <Spinner />}
    </View>
  );
  if (breakpoints.md) {
    return (
      <>
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
          {Array.isArray(data)
            ? data.map((col) => (
                <Column mutate={mutate} key={col.start} column={col} />
              ))
            : agendaFallback}
        </ScrollView>
      </>
    );
  }
  return (
    <>
      {data ? (
        <View
          style={{
            flex: 1,
            ...(Platform.OS === "web" &&
              ({ maxHeight: "calc(100dvh - 120px)" } as any)),
          }}
        >
          <AgendaSelector data={data} />
          {column && <Column mutate={mutate} column={column} />}
        </View>
      ) : (
        agendaFallback
      )}
    </>
  );
}

export default function Planner() {
  let { agendaView, start, id } = useLocalSearchParams();
  if (!agendaView) agendaView = "week";
  if (!start) start = dayjs().startOf("day").toISOString();

  const agendaContextValue = useMemo(() => {
    return {
      type: agendaView as any,
      start: dayjs(start as string).startOf(agendaView as OpUnitType),
      end: dayjs(start as string)
        .startOf(agendaView as OpUnitType)
        .add(1, agendaView as ManipulateType),
      id: id as any,
    };
  }, [agendaView, start, id]);

  return (
    <AgendaContext.Provider value={agendaContextValue}>
      <Agenda />
    </AgendaContext.Provider>
  );
}
