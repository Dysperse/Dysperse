import { useLabelColors } from "@/components/labels/useLabelColors";
import { normalizeRecurrenceRuleObject } from "@/components/task/drawer/details";
import Alert from "@/ui/Alert";
import Spinner from "@/ui/Spinner";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs, { ManipulateType, OpUnitType } from "dayjs";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, useWindowDimensions } from "react-native";
import {
  Calendar as BigCalendar,
  ICalendarEventBase,
} from "react-native-big-calendar";
import useSWR from "swr";
import { AgendaContext, usePlannerContext } from "../planner/context";

const events = [
  {
    title: "Meeting",
    start: new Date(2024, 6, 10, 10, 0),
    end: new Date(2024, 6, 10, 10, 30),
  },
  {
    title: "Coffee break",
    start: new Date(2024, 6, 10, 15, 45),
    end: new Date(2024, 6, 10, 16, 30),
  },
];

export function Content() {
  const theme = useColorTheme();
  const params = useLocalSearchParams();
  const colors = useLabelColors();
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

  const tasks = data?.reduce((acc, col) => {
    return acc.concat(
      col.tasks.map((task) => ({
        ...task,
        dateRange: [col.start, col.end],
      }))
    );
  }, []);

  const [show, setShow] = useState(true);
  const { height } = useWindowDimensions();

  return data ? (
    <>
      {show && (
        <Pressable onPress={() => setShow(false)} style={{ padding: 20 }}>
          <Alert
            title="Calendar view is experimental"
            subtitle="We're still working on this view, so you might encounter some bugs. Tap on this banner to dismiss."
            emoji="26A0"
          />
        </Pressable>
      )}
      <BigCalendar
        height={height - 20 - 65}
        showAdjacentMonths={false}
        mode="month"
        hourStyle={{ fontFamily: "body_700", color: theme[7] }}
        // onPressCell={(date) => {
        //   alert(date);
        // }}
        onPressEvent={(event: any) => {
          alert(event.id);
        }}
        eventCellStyle={(event) => ({
          backgroundColor: theme[11],
          paddingHorizontal: 15,
          borderRadius: 15,
          ...(event.label && {
            backgroundColor: colors[event.label.color][11],
          }),
        })}
        headerContainerStyle={{ paddingTop: 20 }}
        ampm
        enableEnrichedEvents
        calendarCellTextStyle={{
          color: theme[11],
        }}
        theme={{
          typography: {
            fontFamily: "body_700",
            sm: { fontFamily: "body_700" },
            xl: { fontFamily: "body_700" },
            xs: { fontFamily: "body_700" },
          },
          palette: {
            nowIndicator: theme[11],
            gray: {
              "100": theme[5],
              "200": theme[5],
              "300": theme[3],
              "500": theme[9],
              "800": theme[10],
            },
            primary: {
              main: theme[11],
              contrastText: theme[3],
            },
          },
        }}
        swipeEnabled={false}
        events={tasks
          .filter((e) => e.due || e.recurrenceRule)
          .map(
            (task) =>
              ({
                ...task,
                title: task.name,
                start: dayjs(
                  task.recurrenceRule
                    ? normalizeRecurrenceRuleObject(task.recurrenceRule)
                        .between(
                          new Date(task.dateRange[0]),
                          new Date(task.dateRange[1])
                        )[0]
                        .toISOString()
                    : task.due
                ).toDate(),
                end: dayjs(
                  task.recurrenceRule
                    ? normalizeRecurrenceRuleObject(task.recurrenceRule)
                        .between(
                          new Date(task.dateRange[0]),
                          new Date(task.dateRange[1])
                        )[0]
                        .toISOString()
                    : task.due
                )
                  .add(1, "hour")
                  .toDate(),
              } as ICalendarEventBase)
          )}
        date={start.toDate()}
      />
    </>
  ) : (
    <Spinner />
  );
}

export function Calendar() {
  let { agendaView, start, id } = useLocalSearchParams();
  if (!agendaView) agendaView = "week";
  if (!start) start = dayjs().startOf("day").toISOString();

  const agendaContextValue = useMemo(() => {
    return {
      type: agendaView as any,
      start: dayjs(start as string).startOf("month" as OpUnitType),
      end: dayjs(start as string)
        .startOf("month" as OpUnitType)
        .add(1, "month" as ManipulateType),
      id: id as any,
    };
  }, [agendaView, start, id]);

  return (
    <AgendaContext.Provider value={agendaContextValue}>
      <Content />
    </AgendaContext.Provider>
  );
}
