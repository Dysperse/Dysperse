import CreateTask from "@/components/task/create";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import * as shapes from "@/ui/shapes";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import React, { useRef } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { useCollectionContext } from "../../context";
import { Entity } from "../../entity";
import { ColumnFinishedComponent } from "../kanban/Column";
import { ColumnEmptyComponent } from "../planner/Column";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingBottom: 10,
    gap: 10,
    marginTop: -15,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    width: "100%",
  },
  emptyIcon: { transform: [{ rotate: "-45deg" }] },
  emptyIconContainer: {
    borderRadius: 30,
    marginBottom: 20,
    transform: [{ rotate: "45deg" }],
  },
});

const StoryPointHeader = ({ scale, index, columnRef }) => {
  const theme = useColorTheme();
  const Shape = shapes[`shape${index + 1}`] || React.Fragment;

  const measurements = [
    "Minimum effort",
    "Little effort",
    "Moderate effort",
    "Significant effort",
    "Maximum effort",
  ];

  return (
    <Pressable
      onPress={() =>
        columnRef.current.scrollToOffset({ index: 0, animated: true })
      }
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        gap: 10,
      }}
    >
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          width: 60,
          height: 60,
          justifyContent: "center",
          marginHorizontal: "auto",
          position: "relative",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <Shape size={60} color={theme[4]} />
        </View>
        <Text style={{ color: theme[11], fontSize: 20, fontFamily: "mono" }}>
          {scale}
        </Text>
      </View>
      <Text variant="eyebrow">{measurements[index]}</Text>
    </Pressable>
  );
};

const StoryPoint = ({ scale, index }) => {
  const breakpoints = useResponsiveBreakpoints();
  const { data, access, mutate } = useCollectionContext();
  const isReadOnly = access?.access === "READ_ONLY";
  const theme = useColorTheme();
  const columnRef = useRef(null);
  const { width } = useWindowDimensions();

  const filteredTasks = [
    ...data.entities,
    ...data.labels.reduce((acc, curr) => [...acc, ...curr.entities], []),
  ].filter((t) => t.storyPoints === scale);

  const onTaskUpdate = (updatedTask, oldTask) => {
    mutate(
      (oldData) => {
        const labelIndex = oldData.labels.findIndex(
          (l) => l.id === updatedTask.label?.id
        );
        if (labelIndex === -1) {
          return {
            ...oldData,
            entities: oldData.entities.map((t) =>
              t.id === updatedTask.id ? updatedTask : t
            ),
          };
        }

        const taskIndex = oldData.labels[labelIndex].entities.findIndex(
          (t) => t.id === updatedTask.id
        );

        if (taskIndex === -1)
          return {
            ...oldData,
            labels: oldData.labels.map((l) =>
              l.id === updatedTask.label?.id
                ? {
                    ...l,
                    entities: [...l.entities, updatedTask],
                  }
                : l.id === oldTask.label?.id
                ? {
                    ...l,
                    entities: l.entities.filter((t) => t.id !== oldTask.id),
                  }
                : l
            ),
          };

        return {
          ...oldData,
          labels: [
            ...oldData.labels.slice(0, labelIndex),
            {
              ...oldData.labels[labelIndex],
              entities: oldData.labels[labelIndex].entities
                .map((t, i) => (i === taskIndex ? updatedTask : t))
                .filter((t) => !t.trash),
            },
            ...oldData.labels.slice(labelIndex + 1),
          ],
        };
      },
      {
        revalidate: false,
      }
    );
  };

  return (
    <View
      style={{
        marginBottom: 10,
        backgroundColor: theme[2],
        width: 320,
        borderRadius: 20,
      }}
    >
      <StoryPointHeader columnRef={columnRef} scale={scale} index={index} />
      <FlatList
        ref={columnRef}
        ListHeaderComponent={
          isReadOnly ? null : (
            <>
              <View
                style={[
                  styles.header,
                  {
                    paddingHorizontal: breakpoints.md ? 0 : 5,
                  },
                ]}
              >
                <CreateTask
                  defaultValues={{
                    collectionId: data?.id === "all" ? undefined : data?.id,
                    date: dayjs(),
                    storyPoints: scale,
                  }}
                  mutate={(newTask) => {}}
                >
                  <Button variant="filled" style={{ flex: 1, minHeight: 50 }}>
                    <ButtonText>New</ButtonText>
                    <Icon>add</Icon>
                  </Button>
                </CreateTask>
                {/* <ColumnMenu
                  column={column}
                  onTaskUpdate={onTaskUpdate}
                  columnMenuRef={columnMenuRef}
                >
                  <Button variant="outlined" style={{ height: 50 }}>
                    <Icon>more_horiz</Icon>
                  </Button>
                </ColumnMenu> */}
              </View>

              {filteredTasks.length > 0 &&
                !filteredTasks.find(
                  (task) =>
                    task.recurrenceRule ||
                    (!task.recurrenceRule &&
                      task.completionInstances.length === 0)
                ) && <ColumnFinishedComponent />}
            </>
          )
        }
        data={filteredTasks
          .sort((a, b) =>
            a.agendaOrder?.toString()?.localeCompare(b.agendaOrder)
          )
          .sort((x, y) => (x.pinned === y.pinned ? 0 : x.pinned ? -1 : 1))
          .sort((x, y) =>
            x.completionInstances.length === y.completionInstances.length
              ? 0
              : x.completionInstances.length === 0
              ? -1
              : 0
          )}
        // estimatedItemSize={200}
        initialNumToRender={10}
        contentContainerStyle={{
          padding: width > 600 ? 15 : 0,
          paddingBottom: 50,
          paddingTop: 15,
          paddingHorizontal: 15,
          gap: 0,
        }}
        style={{
          flex: 1,
          maxHeight: "100%",
        }}
        centerContent={filteredTasks.length === 0}
        ListEmptyComponent={() => <ColumnEmptyComponent />}
        renderItem={({ item }) => (
          <Entity
            showLabel
            isReadOnly={isReadOnly}
            item={item}
            onTaskUpdate={onTaskUpdate}
          />
        )}
        keyExtractor={(i: any, d) => `${i.id}-${d}`}
      />
    </View>
  );
};

export function Workload() {
  const { data } = useCollectionContext();
  const scale = [2, 4, 8, 16, 32];

  return (
    <ScrollView horizontal contentContainerStyle={{ padding: 15, gap: 15 }}>
      {scale.map((s, i) => (
        <StoryPoint key={s} scale={s} index={i} />
      ))}
    </ScrollView>
  );
}
