import { useCollectionContext } from "@/components/collections/context";
import { Entity } from "@/components/collections/entity";
import CreateTask from "@/components/task/create";
import { omit } from "@/helpers/omit";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import RefreshControl from "@/ui/RefreshControl";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ColumnEmptyComponent } from "../../emptyComponent";

const streamViews = [
  { label: "Unscheduled", value: "unscheduled", icon: "change_history" },
  { label: "Backlog", value: "backlog", icon: "west" },
  { label: "Done", value: "completed", icon: "check_circle" },
  { label: "Repeating", value: "repeating", icon: "loop" },
  { label: "Upcoming", value: "upcoming", icon: "east" },
];

function StreamColumn({ view, mutate, filteredTasks, index }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();
  const { access } = useCollectionContext();
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

  return (
    <View
      style={[
        breakpoints.md && {
          backgroundColor: theme[2],
          borderWidth: 1,
          borderColor: addHslAlpha(theme[5], 0.5),
          borderRadius: 20,
          width: 320,
        },
        {
          flex: 1,
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 15,
          justifyContent: "center",
          marginTop: 30,
          marginBottom: 10,
        }}
      >
        <Icon size={30} bold>
          {view.icon}
        </Icon>
        <Text style={{ color: theme[11], fontSize: 20 }} weight={600}>
          {view.label}
        </Text>
      </View>
      <LinearGradient
        colors={[
          theme[breakpoints.md ? 2 : 1],
          addHslAlpha(theme[breakpoints.md ? 2 : 1], 0),
        ]}
        style={{
          width: "100%",
          zIndex: 99,
          height: 30,
          marginBottom: -30,
          marginTop: breakpoints.md
            ? undefined
            : Platform.OS === "web"
            ? -100
            : -40,
          pointerEvents: "none",
        }}
      />
      <FlashList
        key={view}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => mutate()} />
        }
        ListEmptyComponent={() => <ColumnEmptyComponent offset={index} />}
        centerContent={filteredTasks.length === 0}
        data={filteredTasks}
        estimatedItemSize={113}
        contentContainerStyle={{
          padding: 5,
          paddingHorizontal: breakpoints.md ? 5 : 15,
          paddingTop: 20,
          paddingBottom: insets.bottom + 15,
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
        keyExtractor={(i, d) => `${i.id}-${d}`}
      />
    </View>
  );
}

function MobileHeader() {
  const theme = useColorTheme();
  const { mobileStreamMode } = useLocalSearchParams();

  return (
    <View
      style={{
        padding: 15,
        paddingBottom: 0,
        paddingLeft: 25,
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
      }}
    >
      <Icon size={30} bold>
        {streamViews.find(
          (v) => v.value === (mobileStreamMode || "unscheduled")
        )?.icon || "circle"}
      </Icon>
      <Text
        style={{
          fontSize: 23,
          fontFamily: "serifText700",
          color: theme[11],
        }}
      >
        {capitalizeFirstLetter(mobileStreamMode || "unscheduled")}
      </Text>

      <View style={{ flexDirection: "row", marginLeft: "auto" }}>
        <IconButton
          icon="west"
          size={50}
          disabled={mobileStreamMode === "unscheduled"}
          onPress={() => {
            router.setParams({
              mobileStreamMode:
                streamViews[
                  streamViews.findIndex(
                    (v) => v.value === (mobileStreamMode || "unscheduled")
                  ) - 1
                ]?.value,
            });
            impactAsync(ImpactFeedbackStyle.Light);
          }}
        />
        <IconButton
          icon="east"
          size={50}
          disabled={mobileStreamMode === "upcoming"}
          onPress={() => {
            router.setParams({
              mobileStreamMode:
                streamViews[
                  streamViews.findIndex(
                    (v) => v.value === (mobileStreamMode || "unscheduled")
                  ) + 1
                ]?.value,
            });
            impactAsync(ImpactFeedbackStyle.Light);
          }}
        />
      </View>
    </View>
  );
}

export default function Stream() {
  const breakpoints = useResponsiveBreakpoints();
  const { data, mutate } = useCollectionContext();
  const { mobileStreamMode } = useLocalSearchParams();

  const filteredTasks = (_view) =>
    [
      ...Object.values(data.entities),
      ...data.labels.reduce(
        (acc, curr) => [...acc, ...Object.values(curr.entities)],
        []
      ),
    ].filter((t) => {
      if (t.trash) return false;
      if (_view === "backlog")
        return (
          !t.completionInstances.length &&
          dayjs(t.start).isBefore(dayjs()) &&
          (!t.dateOnly || !dayjs(t.start).isToday())
        );
      else if (_view === "upcoming")
        return (
          dayjs(t.start).isAfter(dayjs().startOf("day")) &&
          !t.completionInstances.length
        );
      else if (_view === "completed")
        return t.completionInstances.length && !t.recurrenceRule;
      else if (_view === "unscheduled")
        return (
          !t.start && !t.recurrenceRule && t.completionInstances.length === 0
        );
      else if (_view === "repeating") return t.recurrenceRule;
    });

  return (
    <View style={{ flex: 1 }}>
      {!breakpoints.md && <MobileHeader />}
      <View
        style={{ padding: 15, paddingBottom: 2.5, paddingTop: 0, zIndex: 999 }}
      >
        <CreateTask
          defaultValues={{ collectionId: data.id }}
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
            height={60}
            containerStyle={{
              flex: 1,
              marginTop: 10,
              marginBottom: 15,
            }}
            large
            bold
            style={{ paddingHorizontal: breakpoints.md ? 20 : 40 }}
            text="Create"
            iconPosition="end"
            icon="stylus_note"
          />
        </CreateTask>
      </View>
      {breakpoints.md ? (
        <ScrollView
          horizontal
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            padding: 15,
            paddingTop: 2.5,
            gap: 15,
          }}
        >
          {streamViews.map((view, index) => (
            <StreamColumn
              key={index}
              index={index}
              view={view}
              mutate={mutate}
              filteredTasks={filteredTasks(view.value)}
            />
          ))}
        </ScrollView>
      ) : (
        <StreamColumn
          view={mobileStreamMode || "unscheduled"}
          mutate={mutate}
          index={streamViews.findIndex(
            (v) => v.value === (mobileStreamMode || "unscheduled")
          )}
          filteredTasks={filteredTasks(mobileStreamMode || "unscheduled")}
        />
      )}
    </View>
  );
}

