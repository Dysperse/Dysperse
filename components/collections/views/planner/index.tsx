import { Column } from "@/components/collections/views/planner/Column";
import { AgendaSelector } from "@/components/collections/views/planner/Selector";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import dayjs, { ManipulateType, OpUnitType } from "dayjs";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import { InteractionManager, View } from "react-native";
import Collapsible from "react-native-collapsible";
import { FlatList } from "react-native-gesture-handler";
import useSWR from "swr";
import { AgendaButtons } from "../../navbar/AgendaButtons";
import { AgendaCalendarMenu } from "../../navbar/AgendaCalendarMenu";
import { AgendaContext, usePlannerContext } from "./context";

function Agenda() {
  const breakpoints = useResponsiveBreakpoints();
  const params = useLocalSearchParams();
  const { type, start, end } = usePlannerContext();
  const [state, setState] = React.useState([1]);

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

  const listRef = useRef<FlatList>(null);
  const theme = useColorTheme();
  const alreadyScrolled = useRef(null);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (
        listRef.current &&
        Array.isArray(data) &&
        alreadyScrolled.current !== start.toISOString()
      ) {
        alreadyScrolled.current = start.toISOString();
        const t = data.findIndex((l) => dayjs().isBetween(l.start, l.end));
        listRef.current.scrollToIndex({
          index: t === -1 ? 0 : t || 0,
          animated: false,
          viewPosition: 0.5,
        });
      }
    });
  }, [data, start]);

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
    return !Array.isArray(data) ? (
      agendaFallback
    ) : (
      <FlatList
        onScrollToIndexFailed={() => {}}
        data={data}
        contentContainerStyle={{
          flexDirection: "row",
          gap: 15,
          padding: 15,
          height: "100%",
          width: Array.isArray(data) ? undefined : "100%",
        }}
        ref={listRef}
        horizontal
        keyExtractor={(item) => item.start}
        renderItem={({ item }) => <Column mutate={mutate} column={item} />}
      />
    );
  }

  return (
    <>
      {data ? (
        <View
          style={{
            flex: 1,
          }}
        >
          <View
            style={{
              backgroundColor: theme[3],
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              minHeight: 125,
              borderTopColor: theme[5],
              borderTopWidth: 1,
            }}
          >
            <Collapsible
              collapsed={state[0] === 1}
              align="bottom"
              renderChildrenCollapsed={false}
              duration={500}
              easing="easeInOut"
            >
              <AgendaCalendarMenu handleMenuClose={() => setState([1])} />
            </Collapsible>
            <Collapsible
              collapsed={state[0] === 0}
              align="top"
              renderChildrenCollapsed={true}
              duration={500}
              easing="easeInOut"
            >
              <AgendaButtons handleMenuOpen={() => setState([0])} />
              <AgendaSelector data={data} />
            </Collapsible>
          </View>

          {column && <Column mutate={mutate} column={column} />}
        </View>
      ) : (
        agendaFallback
      )}
    </>
  );
}

export default function Planner() {
  // eslint-disable-next-line prefer-const
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
