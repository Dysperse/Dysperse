import { mutations } from "@/app/(app)/[tab]/collections/mutations";
import { Entity } from "@/components/collections/entity";
import { Header } from "@/components/collections/views/planner/Header";
import CreateTask from "@/components/task/create";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import RefreshControl from "@/ui/RefreshControl";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { TEMPORARY_CONTENT_INSET_FIX } from "@/utils/temporary-scrolling-bug-fix";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { LexoRank } from "lexorank";
import React, { useRef } from "react";
import { Platform, Pressable, View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { KeyedMutator } from "swr";
import { useCollectionContext } from "../../context";
import { ColumnEmptyComponent } from "../../emptyComponent";
import { taskSortAlgorithm } from "../skyline";
import { usePlannerContext } from "./context";

function Schedule({ tasks }) {
  const theme = useColorTheme();

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Helper to get start/end in minutes since midnight
  function getTaskRange(task) {
    const start = dayjs(task.startTime || task.date || task.start);
    const end = task.endTime
      ? dayjs(task.endTime, "HH:mm")
      : start.add(1, "hour");
    const startMinutes =
      (task.startTime ? dayjs(task.startTime, "HH:mm") : start).hour() * 60 +
      (task.startTime
        ? dayjs(task.startTime, "HH:mm").minute()
        : start.minute());
    const endMinutes =
      (task.endTime ? dayjs(task.endTime, "HH:mm") : end).hour() * 60 +
      (task.endTime ? dayjs(task.endTime, "HH:mm").minute() : end.minute());
    return { startMinutes, endMinutes };
  }

  // Sort and group overlapping tasks per hour
  function getOverlappingGroups(hourTasks) {
    // Sort by start time
    const sorted = [...hourTasks].sort(
      (a, b) => getTaskRange(a).startMinutes - getTaskRange(b).startMinutes,
    );
    const groups = [];
    let group = [];
    let lastEnd = null;
    for (const task of sorted) {
      const { startMinutes, endMinutes } = getTaskRange(task);
      if (
        group.length === 0 ||
        startMinutes < lastEnd // overlap
      ) {
        group.push(task);
        lastEnd = Math.max(lastEnd ?? 0, endMinutes);
      } else {
        groups.push(group);
        group = [task];
        lastEnd = endMinutes;
      }
    }
    if (group.length) groups.push(group);
    return groups;
  }

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      {hours.map((hour) => {
        // Tasks that overlap with this hour
        const hourStart = hour * 60;
        const hourEnd = (hour + 1) * 60;
        const hourTasks = tasks.filter((task) => {
          const { startMinutes, endMinutes } = getTaskRange(task);
          return (
            startMinutes < hourEnd && endMinutes > hourStart // overlaps this hour
          );
        });

        // Group overlapping tasks
        const groups = getOverlappingGroups(hourTasks);

        return (
          <View
            key={hour}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              borderBottomWidth: hour < 23 ? 1 : 0,
              borderColor: theme[4],
              height: 48,
              position: "relative",
            }}
          >
            <View
              style={{ width: 50, alignItems: "flex-end", paddingRight: 13 }}
            >
              <Text variant="eyebrow" style={{ fontSize: 12 }}>
                {hour === 0
                  ? "12AM"
                  : hour < 12
                    ? `${hour}AM`
                    : hour === 12
                      ? "12PM"
                      : `${hour - 12}PM`}
              </Text>
            </View>
            <View style={{ flex: 1, minHeight: 40, position: "relative" }}>
              {/* Render overlapping groups */}
              {groups.map((group, groupIdx) =>
                group.map((task, idx) => {
                  const { startMinutes, endMinutes } = getTaskRange(task);
                  // Calculate top and height relative to this hour
                  const top = Math.max(startMinutes - hour * 60, 0) * (48 / 60);
                  const bottom =
                    Math.min(endMinutes, hourEnd) -
                    Math.max(startMinutes, hourStart);
                  const height = Math.max((bottom * 48) / 60, 16);

                  // For overlapping, split width
                  const width = `${100 / group.length}%`;
                  const left = `${(idx * 100) / group.length}%`;

                  return (
                    <View
                      key={task.id}
                      style={{
                        backgroundColor: theme[4],
                        borderRadius: 6,
                        padding: 6,
                        position: "absolute",
                        height,
                        top,
                        left,
                        width,
                        zIndex: 2,
                        marginRight: 2,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: theme[5],
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "500",
                          color: theme[11],
                        }}
                        numberOfLines={1}
                      >
                        {task.name}
                      </Text>
                    </View>
                  );
                }),
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

export function Column({
  mutate,
  column,
  cellIndex,
}: {
  mutate: KeyedMutator<any>;
  column: any;
  cellIndex;
}) {
  const { showAs } = useLocalSearchParams();
  const columnRef = useRef(null);
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  const { id: collectionId } = usePlannerContext();
  const { access } = useCollectionContext();
  const isReadOnly = access?.access === "READ_ONLY";

  const [refreshing] = React.useState(false);
  const breakpoints = useResponsiveBreakpoints();

  const data = taskSortAlgorithm(Object.values(column.entities));

  return (
    <View
      style={[
        {
          ...(breakpoints.md && {
            backgroundColor: theme[2],
            borderWidth: 1,
            borderColor: addHslAlpha(theme[5], 0.5),
            borderRadius: 20,
          }),
          width: breakpoints.md ? 320 : width,
          flex: 1,
          minWidth: 5,
          minHeight: 5,
          maxHeight:
            Platform.OS === "web" && !breakpoints.md
              ? ("calc(100vh - 60px)" as any)
              : undefined,
        },
      ]}
    >
      <Pressable
        style={({ hovered, pressed }) => ({
          opacity: pressed ? 0.6 : hovered ? 0.9 : 1,
        })}
        onPress={() =>
          columnRef.current.scrollToOffset({ offset: 0, animated: true })
        }
      >
        {breakpoints.md && <Header start={column.start} end={column.end} />}
      </Pressable>

      {isReadOnly ? null : (
        <>
          <View
            style={{
              marginTop: breakpoints.md ? 0 : -20,
              padding: 15,
              paddingBottom: 0,
            }}
          >
            <CreateTask
              defaultValues={{
                dateOnly: true,
                collectionId: collectionId === "all" ? undefined : collectionId,
                date: dayjs(column.start),
                agendaOrder: LexoRank.parse(
                  column.entities[column.entities.length - 1]?.agendaOrder ||
                    LexoRank.max().toString(),
                )
                  .genNext()
                  .toString(),
              }}
              mutate={mutations.timeBased.add(mutate)}
            >
              <Button
                variant="filled"
                containerStyle={{ flex: 1 }}
                large={!breakpoints.md}
                bold={!breakpoints.md}
                textStyle={breakpoints.md && { fontFamily: "body_400" }}
                iconPosition="end"
                text="Create"
                icon="stylus_note"
                height={breakpoints.md ? 50 : 55}
              />
            </CreateTask>
          </View>
        </>
      )}
      <LinearGradient
        style={{
          width: "100%",
          height: 20,
          zIndex: 1,
          marginBottom: -20,
          marginTop: Platform.OS !== "web" ? 55 : undefined,
          pointerEvents: "none",
        }}
        colors={[
          theme[breakpoints.md ? 2 : 1],
          addHslAlpha(theme[breakpoints.md ? 2 : 1], 0),
        ]}
      />
      {showAs === "schedule" ? (
        <Schedule tasks={data} />
      ) : data.length == 0 ? (
        <View style={{ marginVertical: "auto" }}>
          <ColumnEmptyComponent offset={cellIndex} />
        </View>
      ) : (
        <FlashList
          contentInset={TEMPORARY_CONTENT_INSET_FIX()}
          ref={columnRef}
          refreshControl={
            data.length > 0 && (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => mutate()}
              />
            )
          }
          data={data}
          estimatedItemSize={100}
          contentContainerStyle={{
            padding: 10,
            paddingBottom: breakpoints.md ? 20 : 50,
            paddingHorizontal: 15,
          }}
          centerContent={Object.keys(column.entities).length === 0}
          ListHeaderComponent={() => (
            <View>
              {Object.keys(column.entities).length > 0 &&
                !Object.values(column.entities).find((task) =>
                  task.recurrenceRule
                    ? !task.completionInstances.find((instance) =>
                        dayjs(instance.iteration).isBetween(
                          dayjs(column.start),
                          dayjs(column.end),
                          "day",
                          "[]",
                        ),
                      )
                    : task.completionInstances.length === 0,
                ) && (
                  <ColumnEmptyComponent
                    plannerFinished
                    offset={cellIndex}
                    row
                    finished
                  />
                )}
            </View>
          )}
          renderItem={({ item }: any) => (
            <Entity
              showLabel
              dateRange={item.recurrenceDay}
              isReadOnly={isReadOnly}
              item={item}
              onTaskUpdate={mutations.timeBased.update(mutate)}
            />
          )}
          keyExtractor={(i: any, d) => `${i.id}-${d}`}
        />
      )}
    </View>
  );
}
