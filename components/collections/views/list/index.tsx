import { mutations } from "@/app/(app)/[tab]/collections/mutations";
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
import { useRef } from "react";
import { Platform, Pressable, View } from "react-native";
import { ColumnEmptyComponent } from "../../emptyComponent";
import { Entity } from "../../entity";
import { CollectionEmpty } from "../CollectionEmpty";
import { KanbanHeader } from "../kanban/Header";
import { taskSortAlgorithm } from "../skyline";

function ListItem({ d, data, item, listRef, mutate, onTaskUpdate, index }) {
  const theme = useColorTheme();
  const isDark = useDarkMode();

  if (item.empty) {
    return (
      <View>
        <ColumnEmptyComponent list labelId={item.id} offset={index} />
      </View>
    );
  } else if (item.create) {
    return (
      <CreateTask
        defaultValues={{ collectionId: data.id }}
        mutate={mutations.categoryBased.update(mutate)}
      >
        <Button
          icon="stylus_note"
          text="Create"
          bold
          large
          variant="filled"
          height={70}
          containerStyle={{ borderRadius: 30 }}
        />
      </CreateTask>
    );
  } else if (item.header) {
    return (
      <>
        <View style={{ paddingTop: 20, backgroundColor: theme[1] }} />
        <LinearGradient colors={[theme[1], addHslAlpha(theme[1], 0)]}>
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
              borderRadius: 30,
              borderWidth: 0,
            }}
          >
            <BlurView
              intensity={Platform.OS === "android" ? 0 : 20}
              tint={
                Platform.OS === "ios"
                  ? isDark
                    ? "dark"
                    : "light"
                  : !isDark
                  ? "prominent"
                  : "systemMaterialDark"
              }
              style={{
                borderRadius: 30,
                height: 80,
                width: "100%",
                overflow: "hidden",
              }}
            >
              <KanbanHeader
                style={{
                  borderTopWidth: 0,
                  height: "100%",
                  paddingBottom: 20,
                  backgroundColor: addHslAlpha(
                    theme[3],
                    Platform.OS === "android" ? 1 : 0.5
                  ),
                }}
                hideNavigation
                label={{
                  ...item,
                  entitiesLength:
                    item.entitiesLength ||
                    Object.values(
                      data.labels.find((l) => l.id === item.id)?.entities
                    )?.filter((e) => e.completionInstances.length === 0)
                      ?.length,
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

  const shownEntities = taskSortAlgorithm(
    Object.values(data.entities).filter(
      (e) => !e.trash && (incompleteEntitiesFilter(e) || data.showCompleted)
    )
  ).filter((t) => !t.parentTaskId);

  const labels = data.labels.sort(
    (a, b) => data.listOrder.indexOf(a.id) - data.listOrder.indexOf(b.id)
  );

  const d = [
    { create: true },
    ...(shownEntities.length > 0 && labels.length > 0
      ? [
          {
            header: true,
            entitiesLength: shownEntities.length,
          },
        ]
      : []),
    ...(shownEntities || []),
    ...labels.reduce((acc, curr) => {
      acc.push({ header: true, ...omit(["entities"], curr) });
      const t = taskSortAlgorithm(
        Object.values(curr.entities).filter(
          (e) => !e.trash && (incompleteEntitiesFilter(e) || data.showCompleted)
        )
      );

      acc.push(...t);
      if (t.length === 0) acc.push({ empty: true });
      return acc;
    }, []),
  ];

  if (d.length === 1) {
    d.push({ empty: true });
  }

  const ref = useRef(null);

  return (
    <View style={{ flex: 1, marginTop: -15 }}>
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
          renderItem={({ item, index }) => (
            <View
              style={{
                width: 600,
                maxWidth: "100%",
                paddingHorizontal: item.create || item.header ? 20 : 10,
                marginHorizontal: "auto",
                marginBottom: item.create || item.header ? 10 : 0,
              }}
            >
              <ListItem
                d={d}
                index={index}
                data={data}
                onTaskUpdate={mutations.categoryBased.update(mutate)}
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

