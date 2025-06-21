import { mutations } from "@/app/(app)/[tab]/collections/mutations";
import { useLabelColors } from "@/components/labels/useLabelColors";
import Task from "@/components/task";
import CreateTask, { CreateTaskDrawerProps } from "@/components/task/create";
import { TaskDrawer, TaskDrawerProps } from "@/components/task/drawer";
import { getTaskCompletionStatus } from "@/helpers/getTaskCompletionStatus";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet from "@/ui/BottomSheet";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { BottomSheetFlashList, BottomSheetModal } from "@gorhom/bottom-sheet";
import dayjs, { ManipulateType, OpUnitType } from "dayjs";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React, { useImperativeHandle, useMemo, useRef, useState } from "react";
import { Platform, Pressable, useWindowDimensions, View } from "react-native";
import useSWR from "swr";
import { useCollectionContext } from "../../context";
import { AgendaButtons } from "../../navbar/AgendaButtons";
import { CalendarContext, useCalendarContext } from "./context";

export interface MyCustomEventType {
  color: string;
}

const CalendarTaskDrawer = (
  props: Omit<TaskDrawerProps, "children" | "id" | "dateRange"> & {
    tasks: any[];
    ref: any;
  }
) => {
  const drawerRef = useRef(null);
  const [taskId, setTaskId] = useState<string>("");

  useImperativeHandle(props.ref, () => ({
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
};

const CalendarCreateTaskDrawer = (props: CreateTaskDrawerProps) => {
  const drawerRef = useRef(null);
  const { id } = useLocalSearchParams();
  const [defaultValues, setDefaultValues] = useState({});
  const { mutate } = useCollectionContext();

  useImperativeHandle(props.ref, () => ({
    present: (defaultValues) => {
      setDefaultValues({
        collectionId: id === "all" ? undefined : id,
        dateOnly: true,
        ...defaultValues,
      });
      drawerRef.current?.present();
    },
  }));

  return (
    <CreateTask
      mutate={mutations.timeBased.add(mutate)}
      defaultValues={defaultValues}
      ref={drawerRef}
      {...props}
    />
  );
};

const Event = ({ event, day }) => {
  const theme = useColorTheme();
  const colors = useLabelColors();
  const breakpoints = useResponsiveBreakpoints();

  const colorTheme = event.label?.color ? colors[event.label.color] : theme;

  const hasCompleted = getTaskCompletionStatus(event, day);

  return (
    <View
      style={{
        width: "100%",
        borderRadius: 3,
        paddingHorizontal: 4,
        paddingVertical: 1,
        backgroundColor: colorTheme[event.pinned ? 7 : 4],
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
      }}
    >
      {hasCompleted && (
        <View
          style={{
            backgroundColor: colorTheme[10],
            borderRadius: 4,
            width: 12,
            height: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            size={10}
            bold
            style={{
              marginTop: -2,
              color: colorTheme[2],
            }}
          >
            check
          </Icon>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: breakpoints.md ? 13 : 10,
            textDecorationLine: hasCompleted ? "line-through" : "none",
            opacity: hasCompleted ? 0.6 : 1,
            color: colorTheme[event.pinned ? 12 : 11],
          }}
          weight={event.pinned ? 500 : 400}
          numberOfLines={1}
        >{`${event.name}`}</Text>
      </View>
    </View>
  );
};

function DateIndicator({ day }) {
  const theme = useColorTheme();
  return (
    <View
      style={{
        width: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: addHslAlpha(theme[9], day.isToday() ? 1 : 0),
        borderRadius: 5,
        marginBottom: 5,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontFamily: day.isToday() ? "serifText700" : "serifText800",
          color: theme[day.isToday() ? 1 : 11],
        }}
      >
        {day.date()}
      </Text>
    </View>
  );
}

function Date({ day, events, theme, dIdx, wIdx }) {
  const { mutate } = useCollectionContext();
  const drawerRef = useRef<BottomSheetModal>(null);
  const createTaskSheetRef = useRef(null);
  const { id } = useLocalSearchParams();
  const breakpoints = useResponsiveBreakpoints();

  const getEventsForDay = (day) => {
    if (!day || !events) return [];
    return events.filter(
      (event) =>
        dayjs(event.start).isSame(day, "day") ||
        (dayjs(event.start).isBefore(day, "day") &&
          dayjs(event.end).isAfter(day, "day"))
    );
  };

  if (!day) {
    return (
      <View
        style={{
          width: `${100 / 7}%`,
          borderRightWidth: dIdx < 6 ? 0.5 : 0,
          borderBottomWidth: wIdx < 5 ? 0.5 : 0,
          borderColor: theme[4],
        }}
      />
    );
  }

  const dayEvents = getEventsForDay(day);
  const maxToShow = 3;

  return (
    <>
      <Pressable
        style={({ hovered, pressed }) => ({
          width: `${100 / 7}%`,
          borderRightWidth: dIdx < 6 ? 0.5 : 0,
          borderBottomWidth: wIdx < 4 ? 0.5 : 0,
          borderColor: theme[4],
          paddingVertical: 10,
          paddingHorizontal: breakpoints.md ? 5 : 2,
          gap: 2,
          backgroundColor: addHslAlpha(
            theme[5],
            (day.isToday() ? 0.2 : 0) + (pressed ? 0.2 : hovered ? 0.1 : 0)
          ),
          paddingBottom: 5,
          alignItems: "center",
          ...(Platform.OS === "web" && {
            transition: "background-color 0.2s ease",
          }),
        })}
        onLongPress={() => impactAsync(ImpactFeedbackStyle.Medium)}
        onPress={() => {
          impactAsync(ImpactFeedbackStyle.Light);
          if (dayEvents.length) {
            drawerRef.current?.present();
          } else {
            createTaskSheetRef.current?.present();
            setTimeout(
              () => createTaskSheetRef.current?.setValue("date", dayjs(day)),
              100
            );
          }
        }}
      >
        <DateIndicator day={day} />
        {dayEvents.slice(0, maxToShow).map((event) => (
          <Event key={event.id} event={event} day={day} />
        ))}
        {dayEvents.length > maxToShow && (
          <Text
            style={{
              fontSize: 11,
              color: theme[8],
              marginTop: "auto",
            }}
            numberOfLines={1}
          >
            +{dayEvents.length - maxToShow} more
          </Text>
        )}
      </Pressable>
      <CreateTask
        defaultValues={{
          collectionId: id === "all" ? undefined : id,
          dateOnly: true,
        }}
        mutate={mutations.timeBased.add(mutate)}
        ref={createTaskSheetRef}
      />

      <BottomSheet
        sheetRef={drawerRef}
        snapPoints={dayEvents.length == 0 ? [300] : ["50%", "90%"]}
        maxBackdropOpacity={0.1}
        handleIndicatorStyle={{
          height: 10,
          marginTop: 3,
          backgroundColor: theme[4],
          borderRadius: 20,
          width: 40,
          marginBottom: -20,
        }}
        backgroundStyle={{
          overflow: "hidden",
          borderRadius: 50,
        }}
        containerStyle={{
          marginHorizontal: 10,
          borderRadius: 50,
        }}
        bottomInset={10}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}
        >
          <View>
            <Text
              style={{ fontSize: 16, color: theme[8], marginBottom: 2 }}
              weight={600}
            >
              {day.format("dddd")}
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontFamily: "serifText700",
                color: theme[11],
              }}
            >
              {day.format("MMMM D, YYYY")}
            </Text>
          </View>
          <View style={{ marginLeft: "auto" }}>
            <IconButton
              icon="stylus_note"
              size={50}
              variant="filled"
              iconProps={{ bold: true }}
              onPress={() => {
                impactAsync(ImpactFeedbackStyle.Light);
                createTaskSheetRef.current?.present();
                setTimeout(
                  () =>
                    createTaskSheetRef.current?.setValue("date", dayjs(day)),
                  100
                );
              }}
              style={{ borderRadius: 20 }}
            />
          </View>
        </View>
        <LinearGradient
          colors={[
            addHslAlpha(theme[1], 1),
            addHslAlpha(theme[1], 0.7),
            addHslAlpha(theme[1], 0),
          ]}
          style={{
            height: 40,
            marginBottom: -40,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        <View style={{ height: "100%" }}>
          {dayEvents.length == 0 ? (
            <View style={{ marginTop: 80, justifyContent: "center" }}>
              <Text style={{ color: theme[11], textAlign: "center" }}>
                No events for this day
              </Text>
            </View>
          ) : (
            <BottomSheetFlashList
              data={dayEvents}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingHorizontal: 15,
                paddingTop: 10,
                paddingBottom: 350,
              }}
              renderItem={({ item }) => (
                <Task
                  key={item.id}
                  task={item}
                  onTaskUpdate={mutations.timeBased.update(mutate)}
                />
              )}
            />
          )}
        </View>
      </BottomSheet>
    </>
  );
}

function CalendarContainer(props) {
  const theme = useColorTheme();

  const { start } = useCalendarContext();
  const { width } = useWindowDimensions();

  // Get first day of month and number of days
  const firstDay = useMemo(() => dayjs(start).startOf("month"), [start]);
  const daysInMonth = useMemo(() => firstDay.daysInMonth(), [firstDay]);
  const firstDayOfWeek = useMemo(() => firstDay.day(), [firstDay]); // 0 (Sunday) - 6 (Saturday)

  // Generate days array with blanks for alignment
  const days = useMemo(() => {
    const blanks = Array.from({ length: firstDayOfWeek }, () => null);
    const daysArr = Array.from({ length: daysInMonth }, (_, i) =>
      firstDay.add(i, "day")
    );
    return [...blanks, ...daysArr];
  }, [firstDay, daysInMonth, firstDayOfWeek]);

  // Weekday headers
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  // Split days into weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Ensure weeks have 7 days
  weeks.forEach((week) => {
    while (week.length < 7) {
      week.push(null); // Fill with nulls if week is incomplete
    }
  });

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <View
        style={{
          flex: 1,
          width: "100%",
          borderWidth: 1,
          borderRadius: 20,
          overflow: "hidden",
          borderColor: addHslAlpha(theme[5], 0.5),
          backgroundColor: theme[2],
        }}
      >
        {/* Weekday headers */}
        <View style={{ flexDirection: "row", width: "100%" }}>
          {weekDays.map((wd, i) => (
            <View
              key={wd + i}
              style={{
                width: `${100 / 7}%`,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 4,
                borderBottomWidth: 0.5,
                borderColor: theme[4],
              }}
            >
              <Text variant="eyebrow">{wd}</Text>
            </View>
          ))}
        </View>
        {/* Calendar days */}
        {weeks.map((week, wIdx) => (
          <View
            key={wIdx}
            style={{ flexDirection: "row", width: "100%", flex: 1 }}
          >
            {week.map((day, dIdx) => (
              <Date
                key={dIdx}
                day={day}
                events={props.events}
                theme={theme}
                wIdx={wIdx}
                dIdx={dIdx}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export function Content() {
  const params = useLocalSearchParams();
  const { type, start, end } = useCalendarContext();
  const { isPublic } = useCollectionContext();

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
        .map((task) => {
          const start = dayjs(
            task.recurrenceRule ? task.recurrenceDay : task.start
          ).toDate();

          return {
            ...task,
            title: task.name,
            start,
            end: task.dateOnly
              ? start
              : dayjs(
                  task.recurrenceRule
                    ? task.recurrenceDay
                    : task.end || task.start
                )
                  .add(task.end ? 0 : 1, "hour")
                  .toDate(),
          };
        }),
    [tasks]
  );

  const breakpoints = useResponsiveBreakpoints();

  return data ? (
    <>
      {!breakpoints.md && <AgendaButtons monthMode />}
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
      <CalendarContainer events={filteredEvents} />
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

