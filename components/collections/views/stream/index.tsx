import { useCollectionContext } from "@/components/collections/context";
import { Entity } from "@/components/collections/entity";
import { ColumnEmptyComponent } from "@/components/collections/views/planner/Column";
import CreateTask from "@/components/task/create";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Icon from "@/ui/Icon";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { styles } from "../../../../app/(app)/[tab]/collections/[id]/[type]";

export function Stream() {
  const [view, setView] = useState<"backlog" | "upcoming" | "completed">(
    "backlog"
  );

  const { data, mutate } = useCollectionContext();
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

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

  const filteredTasks = [
    ...data.entities,
    ...data.labels.reduce((acc, curr) => [...acc, ...curr.entities], []),
  ].filter((t) => {
    if (view === "backlog") return !t.completionInstances.length;
    if (view === "upcoming") return dayjs(t.due).isAfter(dayjs());
    if (view === "completed") return t.completionInstances.length;
  });

  return (
    <>
      <ButtonGroup
        options={[
          { label: "Backlog", value: "backlog" },
          { label: "Upcoming", value: "upcoming" },
          { label: "Completed", value: "completed" },
        ]}
        state={[
          view,
          (e: any) => {
            setView(e);
            router.setParams({ view: e });
          },
        ]}
        scrollContainerStyle={{ width: "100%" }}
        buttonStyle={[
          { paddingHorizontal: 0, borderBottomWidth: 0 },
          !breakpoints.md && {
            borderTopColor: theme[5],
            borderTopWidth: 1,
            paddingVertical: 10,
            backgroundColor: theme[3],
          },
        ]}
        containerStyle={{
          width: breakpoints.md ? 300 : "100%",
          marginHorizontal: "auto",
        }}
        buttonTextStyle={{ color: theme[10], fontFamily: "body_400" }}
        selectedButtonTextStyle={{ color: theme[11], fontFamily: "body_600" }}
        activeComponent={
          <View
            style={{
              height: 5,
              width: 12,
              borderRadius: 999,
              backgroundColor: theme[11],
              marginHorizontal: "auto",
            }}
          />
        }
      />
      <FlatList
        ListEmptyComponent={() => <ColumnEmptyComponent row />}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <CreateTask
                defaultValues={{
                  collectionId: data.id,
                }}
                mutate={(newTask) => {
                  if (!newTask) return;
                  mutate(
                    (oldData) => {
                      const labelIndex = oldData.labels.findIndex(
                        (l) => l.id === newTask.label.id
                      );
                      if (labelIndex === -1)
                        return {
                          ...oldData,
                          entities: [...oldData.entities, newTask],
                        };
                      return {
                        ...oldData,
                        labels: oldData.labels.map((l) =>
                          l.id === newTask.label.id
                            ? {
                                ...l,
                                entities: [...l.entities, newTask],
                              }
                            : l
                        ),
                      };
                    },
                    {
                      revalidate: false,
                    }
                  );
                }}
              >
                <Button
                  variant="filled"
                  style={{ flex: 1, minHeight: 50, paddingHorizontal: 20 }}
                >
                  <ButtonText>New</ButtonText>
                  <Icon>add</Icon>
                </Button>
              </CreateTask>
            </View>
          </>
        }
        data={filteredTasks}
        // estimatedItemSize={200}
        initialNumToRender={10}
        contentContainerStyle={{
          padding: 15,
          paddingTop: 40,
          gap: 5,
          minHeight: "100%",
          width: "100%",
          marginHorizontal: "auto",
          maxWidth: 500,
        }}
        renderItem={({ item }) => (
          <Entity
            showLabel
            item={item}
            onTaskUpdate={(newData) => onTaskUpdate(newData, item)}
            openColumnMenu={() => {}}
          />
        )}
        keyExtractor={(i: any, d) => `${i.id}-${d}`}
      />
    </>
  );
}
