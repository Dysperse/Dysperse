import { useCollectionContext } from "@/components/collections/context";
import CreateTask from "@/components/task/create";
import { omit } from "@/helpers/omit";
import { Button } from "@/ui/Button";
import { addHslAlpha, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import RefreshControl from "@/ui/RefreshControl";
import { FlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import { Platform, Pressable, View, useWindowDimensions } from "react-native";
import { ColumnEmptyComponent } from "../../emptyComponent";
import { Entity } from "../../entity";
import { CollectionEmpty } from "../CollectionEmpty";
import { KanbanHeader } from "../kanban/Header";

function ListItem({ d, data, item, listRef, mutate, onTaskUpdate }) {
  const theme = useColorTheme();
  const isDark = useDarkMode();
  const { width } = useWindowDimensions();

  if (item.empty) {
    return (
      <View>
        <ColumnEmptyComponent list />
      </View>
    );
  } else if (item.create) {
    return (
      <CreateTask
        defaultValues={{ collectionId: data.id }}
        mutate={(newTask) => {
          // if the new task's labelId is not null, then add it to the label if it exists in the data.
          // if the label does not exist, then add it to the entities array

          if (newTask.labelId) {
            mutate(
              (oldData) => {
                const newLabels = oldData.labels.map((label: any) => {
                  if (label.id === newTask.labelId) {
                    return {
                      ...label,
                      entities: [newTask, ...label.entities],
                    };
                  }
                  return label;
                });
                return {
                  ...oldData,
                  labels: newLabels,
                };
              },
              {
                revalidate: false,
              }
            );
          } else {
            mutate(
              (oldData) => {
                return {
                  ...oldData,
                  entities: [newTask, ...oldData.entities],
                };
              },
              {
                revalidate: false,
              }
            );
          }
        }}
      >
        <Button
          icon="stylus_note"
          text="Create"
          bold
          large
          variant="filled"
          height={70}
        />
      </CreateTask>
    );
  } else if (item.header) {
    // Rendering header
    return (
      <>
        <View style={{ paddingTop: 20, backgroundColor: theme[1] }} />
        <LinearGradient colors={[theme[1], "transparent"]}>
          <Pressable
            onPress={() => {
              listRef.current?.scrollToIndex({
                index: d.indexOf(item),
                animated: true,
              });
            }}
            style={{
              width: "100%",
              overflow: "hidden",
              backgroundColor: addHslAlpha(
                theme[3],
                Platform.OS === "android" ? 1 : 0.5
              ),
              borderRadius: 99,
              borderColor: addHslAlpha(theme[7], 0.3),
            }}
          >
            <BlurView
              intensity={Platform.OS === "android" ? 0 : 20}
              tint={!isDark ? "prominent" : "systemMaterialDark"}
              style={{
                borderRadius: 99,
                height: 80,
                width: "100%",
                overflow: "hidden",
              }}
            >
              <KanbanHeader
                hideNavigation
                label={{
                  ...item,
                  entitiesLength:
                    item.entitiesLength ||
                    data.labels
                      .find((l) => l.id === item.id)
                      ?.entities?.filter(
                        (e) => e.completionInstances.length === 0
                      )?.length,
                }}
                grid
                list
              />
            </BlurView>
          </Pressable>
        </LinearGradient>
      </>
    );
  } else {
    // Render item
    return (
      <Entity
        onTaskUpdate={onTaskUpdate}
        item={item}
        isReadOnly={false}
        showRelativeTime
      />
    );
  }
}

const incompleteEntitiesFilter = (e) =>
  e.recurrenceRule || e.completionInstances.length === 0;

export default function List() {
  const { data, mutate } = useCollectionContext();
  const [showCompleted, setShowCompleted] = useState(data.showCompleted);

  const d = [
    { create: true },
    ...(data.entities?.length > 0 && data.labels.length > 0
      ? [
          {
            header: true,
            entitiesLength: data.entities.filter(
              (e) => incompleteEntitiesFilter(e) || showCompleted
            ).length,
          },
        ]
      : []),
    ...(data.entities.filter(
      (e) => incompleteEntitiesFilter(e) || showCompleted
    ) || []),
    ...data.labels.reduce((acc, curr) => {
      acc.push({ header: true, ...omit(["entities"], curr) });
      const t = curr.entities
        .sort(
          (a, b) =>
            a.completionInstances?.length - b.completionInstances?.length
        )
        .filter((e) => incompleteEntitiesFilter(e) || showCompleted);
      acc.push(...t);
      if (t.length === 0) {
        acc.push({ empty: true });
      }
      return acc;
    }, []),
  ];
  const onTaskUpdate = (newTask: any) => {
    mutate(
      (oldData) => {
        if (newTask?.labelId) {
          const newLabels = oldData.labels.map((label: any) => {
            if (label.id === newTask?.labelId) {
              return {
                ...label,
                entities: label.entities
                  .map((task: any) => {
                    if (task.id === newTask.id) return newTask;
                    return task;
                  })
                  .filter((t) => !t.trash),
              };
            }
            return label;
          });

          return {
            ...oldData,
            labels: newLabels,
          };
        } else {
          return {
            ...oldData,
            entities: oldData.entities
              .map((task: any) => {
                if (task.id === newTask.id) {
                  return newTask;
                }
                return task;
              })
              .filter((t) => !t.trash),
          };
        }
      },
      { revalidate: false }
    );
  };

  const ref = useRef(null);
  const { width } = useWindowDimensions();

  return (
    <View style={{ flex: 1 }}>
      {d.length === 0 ? (
        <CollectionEmpty />
      ) : (
        <FlashList
          data={d}
          ref={ref}
          stickyHeaderIndices={d.reduce(
            (acc, e, i) => (e.header ? [...acc, i] : acc),
            []
          )}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={() => mutate()} />
          }
          contentContainerStyle={{ paddingVertical: 30 }}
          renderItem={({ item }) => (
            <View
              style={{
                width: 600,
                marginHorizontal: "auto",
                maxWidth: width - 40,
                marginBottom: 10,
              }}
            >
              <ListItem
                d={d}
                data={data}
                onTaskUpdate={onTaskUpdate}
                item={item}
                listRef={ref}
                mutate={mutate}
              />
            </View>
          )}
          getItemType={(item) => {
            // To achieve better performance, specify the type based on the item
            return typeof item === "string" ? "sectionHeader" : "row";
          }}
          estimatedItemSize={100}
        />
      )}
    </View>
  );
}

