import { Entity } from "@/components/collections/entity";
import { Header } from "@/components/collections/views/planner/Header";
import CreateTask from "@/components/task/create";
import { getTaskCompletionStatus } from "@/helpers/getTaskCompletionStatus";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import RefreshControl from "@/ui/RefreshControl";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { LexoRank } from "lexorank";
import React, { useEffect, useMemo, useRef } from "react";
import {
  InteractionManager,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { KeyedMutator } from "swr";
import { useCollectionContext } from "../../context";
import { ColumnEmptyComponent } from "../../emptyComponent";
import { ColumnFinishedComponent } from "../kanban/Column";
import { usePlannerContext } from "./context";

export const onTaskUpdate = (newTask, mutate, column) => {
  mutate(
    (oldData) => {
      const oldTask = oldData
        ?.find((oldColumn) => oldColumn.start === column.start)
        ?.tasks.find((oldTask) => oldTask?.id === newTask?.id);

      if (
        Boolean(oldTask?.recurrenceRule) !== Boolean(newTask?.recurrenceRule)
      ) {
        return true;
      }

      if (!oldTask) {
        return oldData;
      }
      return oldData.map(
        newTask.recurrenceRule
          ? (oldColumn) => {
              return {
                ...oldColumn,
                tasks: oldColumn.tasks
                  .map((task) =>
                    task.id === newTask.id ? { ...task, ...newTask } : task
                  )
                  .filter((t) => !t.trash),
              };
            }
          : (oldColumn) => {
              const isTargetColumn = dayjs(newTask.start).isBetween(
                oldColumn.start,
                oldColumn.end,
                null,
                "[]"
              );

              if (!isTargetColumn) {
                return {
                  ...oldColumn,
                  tasks: oldColumn.tasks
                    .filter((task) => task.id !== newTask.id)
                    .filter((t) => !t.trash),
                };
              }

              return {
                ...oldColumn,
                tasks: (oldColumn.tasks.find((task) => task?.id === newTask?.id)
                  ? oldColumn.tasks
                  : [newTask, ...oldColumn.tasks]
                )
                  .map((oldTask) =>
                    oldTask?.id === newTask?.id
                      ? newTask.trash === true
                        ? undefined
                        : newTask
                      : oldTask
                  )
                  .filter((e) => e),
              };
            }
      );
    },
    {
      revalidate: false,
    }
  );
};

export function Column({
  mutate,
  column,
}: {
  mutate: KeyedMutator<any>;
  column: any;
}) {
  const columnRef = useRef(null);
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  const { id: collectionId } = usePlannerContext();
  const { access } = useCollectionContext();

  const opacity = useSharedValue(0);
  const opacityStyle = useAnimatedStyle(() => ({
    opacity: withSpring(opacity.value, { damping: 20, stiffness: 90 }),
  }));

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => (opacity.value = 1));
  }, []);

  const isReadOnly = access?.access === "READ_ONLY";

  const [refreshing] = React.useState(false);

  const sortedTasks = useMemo(
    () =>
      column.tasks
        .slice()
        .sort((a, b) => a.agendaOrder?.toString()?.localeCompare(b.agendaOrder))
        .sort((x, y) => {
          // Get task completion status for both x and y
          const xCompleted = getTaskCompletionStatus(x, x.recurrenceDay);
          const yCompleted = getTaskCompletionStatus(y, y.recurrenceDay);

          // If completion status is the same, sort by pinned status
          if (xCompleted === yCompleted) {
            // If both are pinned or both are not pinned, return 0
            if (x.pinned === y.pinned) {
              return 0;
            } else {
              // If x is pinned and y is not pinned, x should come before y
              // If x is not pinned and y is pinned, y should come before x
              return x.pinned ? -1 : 1;
            }
          } else {
            // Sort by completion status
            // If x is completed and y is not completed, x should come after y
            // If y is completed and x is not completed, y should come after x
            return xCompleted ? 1 : -1;
          }
        }),
    [column]
  );

  const breakpoints = useResponsiveBreakpoints();

  return (
    <Animated.View
      style={[
        opacityStyle,
        {
          ...(breakpoints.md && {
            backgroundColor: theme[2],
            borderWidth: 1,
            borderColor: addHslAlpha(theme[5], 0.7),
            borderRadius: 20,
          }),
          width: breakpoints.md ? 320 : width,
          flex: 1,
          minWidth: 5,
          minHeight: 5,
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
              padding: 15,
              paddingBottom: 0,
              height: 65,
            }}
          >
            <CreateTask
              defaultValues={{
                dateOnly: true,
                collectionId: collectionId === "all" ? undefined : collectionId,
                date: dayjs(column.start),
                agendaOrder: LexoRank.parse(
                  column.tasks[column.tasks.length - 1]?.agendaOrder ||
                    LexoRank.max().toString()
                )
                  .genNext()
                  .toString(),
              }}
              mutate={(newTask) => {
                console.log(newTask);
                if (!newTask) return;
                if (
                  !dayjs(newTask.start)
                    .utc()
                    .isBetween(
                      dayjs(column.start),
                      dayjs(column.end),
                      null,
                      "[]"
                    ) ||
                  !newTask.start
                )
                  return;

                mutate(
                  (oldData) =>
                    oldData.map((oldColumn) =>
                      oldColumn.start === column.start &&
                      oldColumn.end === column.end
                        ? {
                            ...oldColumn,
                            tasks: [...oldColumn.tasks, newTask],
                          }
                        : oldColumn
                    ),
                  {
                    revalidate: false,
                  }
                );
              }}
            >
              <Button variant="filled" containerStyle={{ flex: 1 }} height={50}>
                <ButtonText>New</ButtonText>
                <Icon>add</Icon>
              </Button>
            </CreateTask>
          </View>
        </>
      )}
      <LinearGradient
        style={{
          width: "100%",
          height: 30,
          zIndex: 1,
          marginBottom: -30,
          pointerEvents: "none",
        }}
        colors={[theme[breakpoints.md ? 2 : 1], "transparent"]}
      />
      <FlashList
        ref={columnRef}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => mutate()} />
        }
        data={sortedTasks}
        estimatedItemSize={100}
        contentContainerStyle={{
          padding: width > 600 ? 15 : 0,
          paddingBottom: 50,
          paddingTop: 15,
          paddingHorizontal: 15,
        }}
        centerContent={column.tasks.length === 0}
        ListEmptyComponent={() => (
          <View style={{ marginVertical: "auto" }}>
            <ColumnEmptyComponent />
          </View>
        )}
        ListHeaderComponent={() => (
          <View>
            {column.tasks.length > 0 &&
              !column.tasks.find((task) =>
                task.recurrenceRule
                  ? !task.completionInstances.find((instance) =>
                      dayjs(instance.iteration).isBetween(
                        dayjs(column.start),
                        dayjs(column.end),
                        "day",
                        "[]"
                      )
                    )
                  : task.completionInstances.length === 0
              ) && <ColumnFinishedComponent />}
          </View>
        )}
        renderItem={({ item }: any) => (
          <Entity
            showLabel
            dateRange={item.recurrenceDay}
            isReadOnly={isReadOnly}
            item={item}
            onTaskUpdate={(newItem) => onTaskUpdate(newItem, mutate, column)}
          />
        )}
        keyExtractor={(i: any, d) => `${i.id}-${d}`}
      />
    </Animated.View>
  );
}
