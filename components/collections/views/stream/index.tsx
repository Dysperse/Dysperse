import { useCollectionContext } from "@/components/collections/context";
import { Entity } from "@/components/collections/entity";
import { FadeOnRender } from "@/components/layout/FadeOnRender";
import CreateTask from "@/components/task/create";
import { omit } from "@/helpers/omit";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import RefreshControl from "@/ui/RefreshControl";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { useState, useTransition } from "react";
import { useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ColumnEmptyComponent } from "../../emptyComponent";

type streamType = "backlog" | "upcoming" | "completed" | "unscheduled";
const streamViews = [
  { label: "Backlog", value: "backlog", icon: "west" },
  { label: "Upcoming", value: "upcoming", icon: "east" },
  { label: "Done", value: "completed", icon: "check_circle" },
  { label: "Unscheduled", value: "unscheduled", icon: "sunny" },
  { label: "Repeating", value: "repeating", icon: "loop" },
];

export default function Stream() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { data, mutate, access } = useCollectionContext();

  const [, startTransition] = useTransition();
  const [view, setView] = useState<streamType>(
    (params?.view as streamType) || "backlog"
  );

  function selectTab(nextTab) {
    impactAsync(ImpactFeedbackStyle.Light);
    startTransition(() => setView(nextTab));
  }

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
            entities: { ...oldData.entities, [updatedTask.id]: updatedTask },
          };
        }
        const taskIndex = oldData.labels[labelIndex].entities[updatedTask.id];
        if (!taskIndex)
          return {
            ...oldData,
            labels: oldData.labels.map((l) =>
              l?.id === updatedTask.label?.id
                ? {
                    ...l,
                    entities: { ...l.entities, [updatedTask.id]: updatedTask },
                  }
                : l.id === oldTask.label?.id
                ? {
                    ...l,
                    entities: l.entities[oldTask.id]
                      ? omit([oldTask.id], l.entities)
                      : { ...l.entities, [updatedTask.id]: updatedTask },
                  }
                : l
            ),
          };

        return {
          ...oldData,
          labels: oldData.labels.map((l) =>
            l.id === updatedTask.label?.id
              ? {
                  ...l,
                  entities: {
                    ...l.entities,
                    [updatedTask.id]: updatedTask,
                  },
                }
              : l
          ),
        };
      },
      {
        revalidate: false,
      }
    );
  };

  const { height } = useWindowDimensions();
  const [query, setQuery] = useState("");

  const filteredTasks = [
    ...Object.values(data.entities),
    ...data.labels.reduce(
      (acc, curr) => [...acc, ...Object.values(curr.entities)],
      []
    ),
  ].filter((t) => {
    if (t.trash || !t.name.toLowerCase().includes(query.toLowerCase()))
      return false;
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
    else if (view === "completed")
      return t.completionInstances.length && !t.recurrenceRule;
    else if (view === "unscheduled")
      return (
        !t.start && !t.recurrenceRule && t.completionInstances.length === 0
      );
    else if (view === "repeating") return t.recurrenceRule;
  });

  return (
    <View
      style={[
        {
          flex: 1,
          maxHeight: height - 50,
          flexDirection: breakpoints.md ? "row" : undefined,
        },
      ]}
    >
      <View
        style={{
          width: breakpoints.md ? 350 : "100%",
          padding: breakpoints.md ? 40 : 20,
          paddingBottom: 0,
        }}
      >
        {breakpoints.md && (
          <TextField
            variant="filled+outlined"
            placeholder="Search items…"
            onChangeText={setQuery}
            style={{
              height: 50,
              fontSize: 18,
              width: "100%",
              maxWidth: 400,
              marginHorizontal: "auto",
            }}
          />
        )}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: 400,
            marginHorizontal: "auto",
            borderColor: theme[5],
            marginVertical: 10,
            marginTop: breakpoints.md ? 10 : -15,
            borderWidth: 1,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
          }}
        >
          <Text weight={900} style={{ color: theme[11] }}>
            {filteredTasks.length}{" "}
            {filteredTasks.length === 1 ? "item" : "items"}
          </Text>
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
                height={50}
                containerStyle={{
                  marginLeft: "auto",
                }}
                style={{ paddingHorizontal: breakpoints.md ? 20 : 40 }}
                text="Create"
                bold={!breakpoints.md}
                iconPosition="end"
                icon="stylus_note"
              />
            </CreateTask>
          )}
        </View>
        <View
          style={{
            flexDirection: breakpoints.md ? "column" : "row",
          }}
        >
          {streamViews.map((e) => (
            <Button
              key={e.value}
              icon={e.icon}
              backgroundColors={{
                default: theme[e.value === view ? 4 : 1],
                hovered: theme[e.value === view ? 5 : 3],
                pressed: theme[e.value === view ? 6 : 4],
              }}
              onPress={() => selectTab(e.value)}
              text={e.label}
              style={{
                justifyContent: breakpoints.md ? "flex-start" : undefined,
                flexDirection: breakpoints.md ? "row" : "column",
              }}
              height={breakpoints.md ? 50 : 75}
              textStyle={{ fontSize: 12 }}
              containerStyle={{
                flex: 1,
                borderRadius: breakpoints.md ? 10 : 20,
                paddingVertical: breakpoints.md ? undefined : 10,
              }}
            />
          ))}
        </View>
      </View>
      <FadeOnRender key={view} animateUp>
        {!breakpoints.md && (
          <LinearGradient
            colors={[theme[1], addHslAlpha(theme[1], 0)]}
            style={{ width: "100%", zIndex: 99, height: 50, marginBottom: -50 }}
          />
        )}
        <FlashList
          key={view}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={() => mutate()} />
          }
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
          data={filteredTasks}
          estimatedItemSize={113}
          contentContainerStyle={{
            padding: 15,
            paddingTop: breakpoints.md ? 40 : 0.1,
            paddingBottom: insets.bottom + 15,
          }}
          renderItem={({ item }) => (
            <View style={{ maxWidth: 400, width: "100%" }}>
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
      </FadeOnRender>
    </View>
  );
}

