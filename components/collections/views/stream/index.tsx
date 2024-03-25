import { useCollectionContext } from "@/components/collections/context";
import { Entity } from "@/components/collections/entity";
import { ColumnEmptyComponent } from "@/components/collections/views/planner/Column";
import CreateTask from "@/components/task/create";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { styles } from "../../../../app/(app)/[tab]/collections/[id]/[type]";

export function Stream() {
  const params = useLocalSearchParams();
  const [view, setView] = useState<
    "backlog" | "upcoming" | "completed" | "unscheduled"
  >((params?.view as any) || "backlog");

  const { data, mutate, access } = useCollectionContext();
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  const isReadOnly = access?.access === "READ_ONLY";

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

  const [query, setQuery] = useState("");

  const filteredTasks = [
    ...data.entities,
    ...data.labels.reduce((acc, curr) => [...acc, ...curr.entities], []),
  ]
    .filter((t) => {
      if (t.trash) return false;
      if (view === "backlog")
        return !t.completionInstances.length && dayjs(t.due).isBefore(dayjs());
      else if (view === "upcoming")
        return (
          dayjs(t.due).isAfter(dayjs().startOf("day")) &&
          !t.completionInstances.length
        );
      else if (view === "completed") return t.completionInstances.length;
      else if (view === "unscheduled") return !t.due && !t.recurrenceRule;
    })
    .filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <ButtonGroup
        options={[
          { label: "Backlog", value: "backlog" },
          { label: "Upcoming", value: "upcoming" },
          { label: "Completed", value: "completed" },
          { label: "Unscheduled", value: "unscheduled" },
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
          width: breakpoints.md ? 450 : "100%",
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
        ListEmptyComponent={() =>
          query === "" ? (
            <ColumnEmptyComponent />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                padding: 20,
              }}
            >
              <Emoji emoji="1f62d" size={40} />
              <Text style={{ fontSize: 20 }} weight={200}>
                We couldn't find anything called{" "}
                <Text weight={700}>"{query}"</Text>
              </Text>
            </View>
          )
        }
        ListHeaderComponent={
          <>
            <View style={[styles.header, { flexDirection: "column" }]}>
              <TextField
                variant="filled+outlined"
                placeholder="Search items..."
                onChangeText={setQuery}
                style={{ height: 50, fontSize: 18 }}
              />
              {!isReadOnly && (
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
              )}
            </View>
          </>
        }
        data={filteredTasks}
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
            isReadOnly={isReadOnly}
            showRelativeTime={view !== "unscheduled"}
            showLabel
            item={item}
            onTaskUpdate={(newData) => onTaskUpdate(newData, item)}
          />
        )}
        keyExtractor={(i: any, d) => `${i.id}-${d}`}
      />
    </>
  );
}
