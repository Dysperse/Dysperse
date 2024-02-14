import { useCollectionContext } from "@/components/collections/context";
import { Entity } from "@/components/collections/entity";
import { ColumnEmptyComponent } from "@/components/collections/views/planner/Column";
import CreateTask from "@/components/task/create";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Icon from "@/ui/Icon";
import { useColorTheme } from "@/ui/color/theme-provider";
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

  return (
    <>
      <ButtonGroup
        options={[
          { label: "Backlog", value: "backlog" },
          { label: "Upcoming", value: "upcoming" },
          { label: "Completed", value: "completed" },
        ]}
        state={[view, setView]}
        scrollContainerStyle={{ width: "100%" }}
        buttonStyle={{ paddingHorizontal: 0, borderBottomWidth: 0 }}
        containerStyle={{ width: 300, marginHorizontal: "auto" }}
        buttonTextStyle={{ color: theme[10] }}
        selectedButtonTextStyle={{ color: theme[11] }}
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
            <View
              style={[
                styles.header,
                {
                  paddingHorizontal: breakpoints.md ? 0 : 15,
                  paddingTop: breakpoints.md ? 0 : 20,
                },
              ]}
            >
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
        data={[
          ...data.entities,
          ...data.labels.reduce((acc, curr) => [...acc, ...curr.entities], []),
        ]
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
          padding: breakpoints.md ? 15 : 0,
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
