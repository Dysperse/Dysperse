import { styles } from "@/app/(app)/[tab]/collections/[id]/[type]";
import { useCollectionContext } from "@/components/collections/context";
import { Entity } from "@/components/collections/entity";
import CreateTask from "@/components/task/create";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import Text, { getFontName } from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useTransition } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ColumnEmptyComponent } from "../../emptyComponent";

type streamType = "backlog" | "upcoming" | "completed" | "unscheduled";

export default function Stream() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<streamType>(
    (params?.view as streamType) || "backlog"
  );

  function selectTab(nextTab) {
    startTransition(() => {
      setView(nextTab);
    });
  }

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
        return (
          !t.completionInstances.length &&
          dayjs(t.start).isBefore(dayjs()) &&
          (!t.dateOnly || !dayjs(t.start).isToday())
        );
      else if (view === "upcoming")
        return (
          dayjs(t.start).isAfter(dayjs().startOf("day")) &&
          !t.completionInstances.length
        );
      else if (view === "completed") return t.completionInstances.length;
      else if (view === "unscheduled")
        return (
          !t.start && !t.recurrenceRule && t.completionInstances.length === 0
        );
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
            selectTab(e);
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
          marginTop: breakpoints.md ? 20 : 0,
          marginHorizontal: "auto",
        }}
        buttonTextStyle={{
          color: theme[10],
          fontFamily: getFontName("jost", 400),
        }}
        selectedButtonTextStyle={{
          color: theme[11],
          fontFamily: getFontName("jost", 600),
        }}
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
      <FlashList
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
                style={{
                  height: 50,
                  fontSize: 18,
                  width: "100%",
                  maxWidth: 400,
                  marginHorizontal: "auto",
                }}
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
                    style={{
                      flex: 1,
                      minHeight: 50,
                      paddingHorizontal: 20,
                      width: "100%",
                      maxWidth: 400,
                      marginHorizontal: "auto",
                    }}
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
        estimatedItemSize={113}
        contentContainerStyle={{
          padding: 15,
          paddingTop: 40,
          paddingBottom: insets.bottom + 15,
        }}
        renderItem={({ item }) => (
          <View
            style={{ maxWidth: 400, width: "100%", marginHorizontal: "auto" }}
          >
            <Entity
              isReadOnly={isReadOnly}
              showRelativeTime={view !== "unscheduled"}
              showLabel
              item={item}
              onTaskUpdate={(newData) => onTaskUpdate(newData, item)}
            />
          </View>
        )}
        keyExtractor={(i, d) => `${i.id}-${d}`}
      />
    </>
  );
}
