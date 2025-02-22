import { mutations } from "@/app/(app)/[tab]/collections/mutations";
import { useLabelColors } from "@/components/labels/useLabelColors";
import CreateTask, { CreateTaskDrawerProps } from "@/components/task/create";
import { TaskDrawer, TaskDrawerProps } from "@/components/task/drawer";
import { getTaskCompletionStatus } from "@/helpers/getTaskCompletionStatus";
import Spinner from "@/ui/Spinner";
import { getFontName } from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs, { ManipulateType, OpUnitType } from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, useWindowDimensions } from "react-native";
import {
  Calendar as BigCalendar,
  ICalendarEventBase,
} from "react-native-big-calendar";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { useCollectionContext } from "../../context";
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
    const [taskId, setTaskId] = useState<string>("");

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
          dateRange={props.tasks.find((e) => e.id === taskId)?.recurrenceDay}
        />
      )
    );
  }
);

const CalendarCreateTaskDrawer = forwardRef(
  (props: CreateTaskDrawerProps, ref) => {
    const drawerRef = useRef(null);
    const { id } = useLocalSearchParams();
    const [defaultValues, setDefaultValues] = useState({});

    useImperativeHandle(ref, () => ({
      present: (defaultValues) => {
        setDefaultValues({
          collectionId: id,
          ...defaultValues,
        });
        drawerRef.current?.present();
      },
    }));

    return (
      <CreateTask defaultValues={defaultValues} ref={drawerRef} {...props} />
    );
  }
);

export function Content() {
  const theme = useColorTheme();
  const params = useLocalSearchParams();
  const colors = useLabelColors();
  const { type, start, end } = useCalendarContext();
  const { isPublic } = useCollectionContext();
  const { mode: originalMode, start: originalStart } = useLocalSearchParams();

  const { data, mutate } = useSWR([
    "space/collections/collection/planner",
    {
      start: start.toISOString(),
      end: end.toISOString(),
      type,
      timezone: dayjs.tz.guess(),
      id: params.id,
      isPublic: isPublic ? "true" : "false",
      ...(params.id === "all" && { all: true }),
    },
  ]);

  const taskDrawerRef = useRef(null);
  const createTaskSheetRef = useRef(null);

  const tasks = data?.reduce((acc, col) => {
    return acc.concat(
      Object.values(col?.entities || {}).map((task) => ({
        ...task,
        dateRange: [dayjs(col.start).toDate(), dayjs(col.end).toDate()],
      }))
    );
  }, []);

  const filteredEvents = useMemo(
    () =>
      Object.values(tasks || {})
        .filter((e) => e.start || e.recurrenceRule)
        .map(
          (task) =>
            ({
              ...task,
              title: task.name,
              start: dayjs(
                task.recurrenceRule ? task.recurrenceDay : task.start
              ).toDate(),
              end: dayjs(
                task.recurrenceRule
                  ? task.recurrenceDay
                  : task.end || task.start
              )
                .add(task.end ? 0 : 1, "hour")
                .toDate(),
            } as ICalendarEventBase)
        ),
    [tasks]
  );

  const { height } = useWindowDimensions();

  return data ? (
    <ScrollView
      style={{
        height: "100%",
      }}
      scrollEnabled={false}
    >
      <CalendarTaskDrawer
        mutateList={mutations.timeBased.update(mutate)}
        tasks={tasks}
        ref={taskDrawerRef}
      />
      <CalendarCreateTaskDrawer
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
          createTaskSheetRef.current?.present({
            dateOnly: originalMode === "month",
            date:
              originalMode === "month"
                ? dayjs(date).startOf("day")
                : dayjs(date),
          });
        }}
        onPressDateHeader={(date) => {
          createTaskSheetRef.current?.present({
            dateOnly: true,
            date: dayjs(date).startOf("day"),
          });
        }}
        key={`${start.toISOString()}-${end.toISOString()}`}
        height={height - 20 - 65}
        showAdjacentMonths={false}
        mode={originalMode as any}
        hourStyle={{ fontFamily: getFontName("jost", 700), color: theme[7] }}
        onPressEvent={(event: any) => taskDrawerRef.current?.setId(event.id)}
        eventCellStyle={(event) => ({
          backgroundColor:
            theme[getTaskCompletionStatus(event, event.recurrenceDay) ? 7 : 11],
          paddingHorizontal: 15,
          borderRadius: 15,
          ...(event.label && {
            backgroundColor: getTaskCompletionStatus(event, event.recurrenceDay)
              ? theme[7]
              : colors[event.label.color][11],
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
        events={filteredEvents}
        date={dayjs(originalStart as any).toDate()}
      />
    </ScrollView>
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

export default function Calendar() {
  // eslint-disable-next-line prefer-const
  let { start, id, mode } = useLocalSearchParams();
  const { mode: originalMode } = useLocalSearchParams();
  if (!mode || mode === "3days") mode = "week";
  if (mode === "schedule") mode = "month";
  if (!start)
    start = dayjs()
      .startOf(mode as any)
      .toISOString();

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
    <CalendarContext.Provider value={agendaContextValue as any}>
      <Content />
    </CalendarContext.Provider>
  );
}

