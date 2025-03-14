import { mutations } from "@/app/(app)/[tab]/collections/mutations";
import { Entity } from "@/components/collections/entity";
import { Header } from "@/components/collections/views/planner/Header";
import CreateTask from "@/components/task/create";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import RefreshControl from "@/ui/RefreshControl";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { LexoRank } from "lexorank";
import React, { useRef } from "react";
import { Platform, Pressable, View, useWindowDimensions } from "react-native";
import { KeyedMutator } from "swr";
import { useCollectionContext } from "../../context";
import { ColumnEmptyComponent } from "../../emptyComponent";
import { taskSortAlgorithm } from "../skyline";
import { usePlannerContext } from "./context";

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
  const isReadOnly = access?.access === "READ_ONLY";

  const [refreshing] = React.useState(false);
  const breakpoints = useResponsiveBreakpoints();

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
                    LexoRank.max().toString()
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
      <FlashList
        ref={columnRef}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => mutate()} />
        }
        data={taskSortAlgorithm(Object.values(column.entities))}
        estimatedItemSize={100}
        contentContainerStyle={{
          padding: breakpoints.md ? 5 : 10,
          paddingBottom: 50,
          paddingHorizontal: 15,
        }}
        centerContent={Object.keys(column.entities).length === 0}
        ListEmptyComponent={() => (
          <View style={{ marginVertical: "auto" }}>
            <ColumnEmptyComponent />
          </View>
        )}
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
                        "[]"
                      )
                    )
                  : task.completionInstances.length === 0
              ) && <ColumnEmptyComponent row finished />}
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
    </View>
  );
}

