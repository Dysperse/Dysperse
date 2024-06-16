import { useLabelColors } from "@/components/labels/useLabelColors";
import CreateTask from "@/components/task/create";
import { TaskDrawer, TaskDrawerProps } from "@/components/task/drawer";
import { normalizeRecurrenceRuleObject } from "@/components/task/drawer/details";
import Alert from "@/ui/Alert";
import Spinner from "@/ui/Spinner";
import { getFontName } from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs, { ManipulateType, OpUnitType } from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import {
  Calendar as BigCalendar,
  ICalendarEventBase,
} from "react-native-big-calendar";
import useSWR from "swr";
import { onTaskUpdate } from "../planner/Column";
import { CalendarContext, useCalendarContext } from "./context";

export interface MyCustomEventType {
  color: string;
}

const CalendarTaskDrawer = forwardRef(
  (
    props: Omit<TaskDrawerProps, "children" | "id" | "dateRange"> & {
      tasks: any[];
    },
    ref
  ) => {
    const drawerRef = useRef(null);
    const [taskId, setTaskId] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      setId: (id: string) => {
        setTaskId(id);
        drawerRef.current?.show();
      },
    }));

    return (
      props.tasks.find((e) => e.id === taskId) && (
        <TaskDrawer
          {...props}
          ref={drawerRef}
          id={taskId}
          dateRange={props.tasks.find((e) => e.id === taskId)?.dateRange}
        />
      )
    );
  }
);
export function Content() {
  const theme = useColorTheme();
  const params = useLocalSearchParams();
  const colors = useLabelColors();
  const { type, start, end } = useCalendarContext();
  const { mode: originalMode, start: originalStart } = useLocalSearchParams();

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

  const taskDrawerRef = useRef(null);
  const createTaskSheetRef = useRef(null);

  const tasks = data?.reduce((acc, col) => {
    return acc.concat(
      col.tasks.map((task) => ({
        ...task,
        dateRange: [col.start, col.end],
      }))
    );
  }, []);

  const [show, setShow] = useState(true);
  const [createDate, setCreateDate] = useState(new Date());
  const { height } = useWindowDimensions();

  useEffect(() => {
    AsyncStorage.getItem("calendarAlertHidden").then((value) => {
      if (value === "true") setShow(false);
    });
  }, []);

  return data ? (
    <>
      {show && (
        <Pressable
          onPress={() => {
            setShow(false);
            AsyncStorage.setItem("calendarAlertHidden", "true");
          }}
          style={{ padding: 20 }}
        >
          <Alert
            title="Calendar view is experimental"
            subtitle="We're still working on this view, so you might encounter some bugs. Tap on this banner to dismiss."
            emoji="26A0"
          />
        </Pressable>
      )}
      {/* {taskId && tasks.find((e) => e.id === taskId) && (
        <TaskDrawer
          dateRange={tasks.find((e) => e.id === taskId)?.dateRange}
          mutateList={(newItem) =>
            onTaskUpdate(
              newItem,
              mutate,
              data.find((d) => d.tasks.find((t) => t.id === newItem.id))
            )
          }
          ref={taskDrawerRef}
          id={taskId}
        />
      )} */}
      <CalendarTaskDrawer
        mutateList={(newItem) =>
          onTaskUpdate(
            newItem,
            mutate,
            data.find((d) => d.tasks.find((t) => t.id === newItem.id))
          )
        }
        tasks={tasks}
        ref={taskDrawerRef}
      />
      <CreateTask
        defaultValues={{
          dateOnly: false,
          date: dayjs(createDate),
        }}
        ref={createTaskSheetRef}
        mutate={(newItem) => {
          if (newItem)
            mutate(
              (oldData) =>
                oldData.map((d) => {
                  if (
                    dayjs(newItem.date).isBetween(
                      dayjs(d.start),
                      dayjs(d.end),
                      "day",
                      "[]"
                    )
                  ) {
                    return {
                      ...d,
                      tasks: [...d.tasks, newItem],
                    };
                  }
                  return d;
                }),
              {
                revalidate: false,
              }
            );
        }}
      />
      <BigCalendar
        onPressMoreLabel={(event) => {
          router.setParams({
            mode: "week",
            start: event[0].start || event[0].dateRange[0],
          });
        }}
        onPressCell={(date) => {
          setCreateDate(date);
          setTimeout(() => {
            createTaskSheetRef.current?.present();
          }, 0);
        }}
        key={`${start.toISOString()}-${end.toISOString()}`}
        height={height - 20 - 65}
        showAdjacentMonths={false}
        mode={originalMode as any}
        hourStyle={{ fontFamily: getFontName("jost", 700), color: theme[7] }}
        // onPressCell={(date) => {
        //   alert(date);
        // }}
        onPressEvent={(event: any) => {
          taskDrawerRef.current?.setId(event.id);
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
        calendarCellTextStyle={{
          color: theme[11],
        }}
        theme={{
          typography: {
            fontFamily: getFontName("jost", 700),
            sm: { fontFamily: getFontName("jost", 700) },
            xl: { fontFamily: getFontName("jost", 700) },
            xs: { fontFamily: getFontName("jost", 700) },
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
          .filter((e) => e.start || e.recurrenceRule)
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
                    : task.start
                ).toDate(),
                end: dayjs(
                  task.recurrenceRule
                    ? normalizeRecurrenceRuleObject(task.recurrenceRule)
                        .between(
                          new Date(task.dateRange[0]),
                          new Date(task.dateRange[1])
                        )[0]
                        .toISOString()
                    : task.end || task.start
                )
                  .add(task.end ? 0 : 1, "hour")
                  .toDate(),
              } as ICalendarEventBase)
          )}
        date={dayjs(originalStart).toDate()}
      />
    </>
  ) : (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Spinner />
    </View>
  );
}

export function Calendar() {
  let { start, id, mode } = useLocalSearchParams();
  const { mode: originalMode } = useLocalSearchParams();
  if (!mode || mode === "3days") mode = "week";
  if (mode === "schedule") mode = "month";
  if (!start) start = dayjs().startOf(mode).toISOString();
  // mode = week | month

  const agendaContextValue = useMemo(() => {
    return {
      mode,
      type: "week",
      start: dayjs(start as string).startOf(mode as OpUnitType),
      end: dayjs(start as string)
        .startOf(mode as OpUnitType)
        .add(originalMode === "3days" ? 2 : 1, mode as ManipulateType),
      id,
    };
  }, [start, id, mode, originalMode]);

  return (
    <CalendarContext.Provider value={agendaContextValue}>
      <Content />
    </CalendarContext.Provider>
  );
}
