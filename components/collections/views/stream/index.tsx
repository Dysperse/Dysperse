import { useCollectionContext } from "@/components/collections/context";
import { Entity } from "@/components/collections/entity";
import { FadeOnRender } from "@/components/layout/FadeOnRender";
import CreateTask from "@/components/task/create";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Modal from "@/ui/Modal";
import RefreshControl from "@/ui/RefreshControl";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState, useTransition } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ColumnEmptyComponent } from "../../emptyComponent";

type streamType = "backlog" | "upcoming" | "completed" | "unscheduled";
const streamViews = [
  { label: "Backlog", value: "backlog", icon: "west" },
  { label: "Upcoming", value: "upcoming", icon: "east" },
  { label: "Completed", value: "completed", icon: "check_circle" },
  { label: "Unscheduled", value: "unscheduled", icon: "sunny" },
  { label: "Repeating", value: "repeating", icon: "loop" },
];

function StreamViewPicker() {
  const theme = useColorTheme();
  const ref = useRef(null);
  const { view } = useLocalSearchParams();
  const currentView = streamViews.find((e) => e.value === (view || "backlog"));

  return (
    <>
      <Pressable
        onPress={() => ref.current.present()}
        style={{
          padding: 10,
          backgroundColor: theme[3],
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderTopWidth: 1,
          gap: 5,
          borderTopColor: theme[5],
        }}
      >
        <Text weight={600}>{currentView.label}</Text>
        <Icon bold>expand_more</Icon>
      </Pressable>

      <Modal sheetRef={ref} animation="SLIDE" height="auto">
        <View style={{ padding: 20 }}>
          {streamViews.map((e) => (
            <ListItemButton
              key={e.value}
              onPress={() => {
                router.setParams({ view: e.value });
                ref.current.close();
              }}
              variant={e.value === currentView.value ? "filled" : "default"}
            >
              <Icon>{e.icon}</Icon>
              <ListItemText primary={e.label} />
            </ListItemButton>
          ))}
        </View>
      </Modal>
    </>
  );
}

export default function Stream() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [, startTransition] = useTransition();
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

  const { height } = useWindowDimensions();
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
      else if (view === "repeating") return t.recurrenceRule;
    })
    .filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={[{ flex: 1, maxHeight: height - 50 }]}>
      {!breakpoints.md && <StreamViewPicker />}
      <View
        style={{
          width: breakpoints.md ? 350 : "100%",
          padding: breakpoints.md ? 40 : 20,
          paddingBottom: 0,
        }}
      >
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
                style={{ paddingHorizontal: 20 }}
                text="Create"
                iconPosition="end"
                icon="stylus_note"
              />
            </CreateTask>
          )}
        </View>
        {breakpoints.md && (
          <ScrollView>
            {streamViews.map((e) => (
              <Button
                key={e.value}
                icon={e.icon}
                backgroundColors={{
                  default: theme[e.value === view ? 5 : 1],
                  hovered: theme[e.value === view ? 6 : 3],
                  pressed: theme[e.value === view ? 7 : 4],
                }}
                onPress={() => selectTab(e.value)}
                text={e.label}
                style={{
                  justifyContent: "flex-start",
                }}
              />
            ))}
          </ScrollView>
        )}
      </View>
      <FadeOnRender key={view} animateUp>
        <FlashList
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
            paddingTop: 40,
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

