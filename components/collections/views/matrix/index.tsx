import CreateTask from "@/components/task/create";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCollectionContext } from "../../context";
import { Entity } from "../../entity";
import { ColumnEmptyComponent } from "../planner/Column";

const styles = StyleSheet.create({
  container: { flexDirection: "column", flex: 1 },
  row: { flex: 1, flexDirection: "row", alignItems: "center" },
  cell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 25,
    height: "100%",
    overflow: "hidden",
  },
  add: {
    alignItems: "center",
    marginVertical: -25,
    height: 35,
    marginLeft: 20,
  },
});

const Cell = ({
  onEntityCreate,
  handleMutate,
  tasks,
  defaultOptions,
  handleHome,
}: {
  onEntityCreate: any;
  handleMutate: any;
  tasks: any;
  defaultOptions: any;
  handleHome?: any;
}) => {
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const ref = useRef(null);

  const [showCompleted, setShowCompleted] = useState(false);
  const toggleShowCompleted = () => setShowCompleted((t) => !t);

  const remainingTasks = tasks.filter(
    (t) => t.completionInstances.length === 0
  );

  const filteredTasks = showCompleted
    ? tasks.sort(
        (a, b) => a.completionInstances.length - b.completionInstances.length
      )
    : tasks.filter((e) => e.completionInstances.length === 0);
  return (
    <View
      style={[
        styles.cell,
        breakpoints.md
          ? { backgroundColor: theme[2], borderColor: theme[5] }
          : { borderWidth: 0, borderRadius: 0 },
      ]}
    >
      <Pressable
        onPress={() =>
          ref.current.scrollToOffset({ animated: true, offset: 0 })
        }
      >
        <LinearGradient
          colors={breakpoints.md ? [theme[2]] : [theme[3], theme[2]]}
          style={[
            {
              padding: breakpoints.md ? 5 : 10,
              paddingHorizontal: 20,
              paddingRight: 10,
              borderBottomWidth: 1,
              borderBottomColor: theme[4],
              flexDirection: "row",
              alignItems: "center",
            },
            !breakpoints.md && { borderTopWidth: 1, borderTopColor: theme[5] },
          ]}
        >
          {handleHome && (
            <IconButton
              icon="arrow_back_ios_new"
              onPress={handleHome}
              style={{ marginRight: 10 }}
            />
          )}
          <Text weight={500} style={{ opacity: 0.5 }}>
            {remainingTasks.length} task{remainingTasks.length !== 1 && "s"}
          </Text>
          <CreateTask
            mutate={(n) => onEntityCreate(n)}
            defaultValues={defaultOptions}
          >
            <IconButton icon="add" style={{ marginLeft: "auto" }} />
          </CreateTask>
        </LinearGradient>
      </Pressable>
      <FlashList
        estimatedItemSize={118}
        ref={ref}
        contentContainerStyle={{ padding: breakpoints.md ? 10 : 20 }}
        keyExtractor={(i: any) => i.id}
        ListEmptyComponent={() => <ColumnEmptyComponent row />}
        renderItem={({ item }) => (
          <Entity
            showRelativeTime
            showLabel
            isReadOnly={false}
            onTaskUpdate={(newData) => handleMutate(newData, item)}
            item={item}
          />
        )}
        data={filteredTasks}
        centerContent={filteredTasks.length === 0}
        ListFooterComponent={() =>
          tasks.find((i) => i.completionInstances.length !== 0) &&
          filteredTasks.length !== 0 && (
            <Button
              onPress={toggleShowCompleted}
              icon={showCompleted ? "expand_less" : "expand_more"}
              iconPosition="end"
              text={`${showCompleted ? "Hide" : "Show"} completed`}
              variant="outlined"
            />
          )
        }
      />
    </View>
  );
};

const CreateTaskTrigger = () => {
  const theme = useColorTheme();
  return (
    <View style={styles.add}>
      <IconButton
        icon={
          <Icon style={{ color: theme[2] }} bold>
            add
          </Icon>
        }
        style={({ pressed, hovered }) => ({
          backgroundColor: theme[pressed ? 11 : hovered ? 10 : 9],
        })}
        size={35}
        variant="filled"
      />
    </View>
  );
};

const Label = ({ x, y, size }: { x?: string; y?: string; size: number }) => {
  const breakpoints = useResponsiveBreakpoints();

  return (
    <Text
      variant="eyebrow"
      numberOfLines={1}
      style={
        y
          ? {
              transform: [{ rotate: "-90deg" }],
              width: size + 10,
              marginHorizontal: -(size / 2),
              marginRight: breakpoints.md ? undefined : -(size / 2) + 10,
              height: 20,
            }
          : {}
      }
    >
      {x || y}
    </Text>
  );
};

function Preview({ tasks, onPress }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    flex: 1,
    height: "100%",
    transform: [
      {
        scale: withSpring(scale.value, {
          damping: 9000,
          stiffness: 1000,
        }),
      },
    ],
  }));

  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onPress}
        onPressIn={() => (scale.value = 0.95)}
        onPressOut={() => (scale.value = 1)}
        style={[
          styles.cell,
          {
            backgroundColor: theme[2],
            borderColor: theme[5],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          centerContent={tasks.length === 0}
          scrollEnabled={false}
          style={{ padding: breakpoints.md ? 20 : 10 }}
        >
          {tasks.length === 0 && (
            <Text style={{ textAlign: "center", opacity: 0.6 }} weight={900}>
              No tasks
            </Text>
          )}
          {tasks
            .filter(
              (e) => e.completionInstances.length === 0 && !e.recurrenceRule
            )
            .slice(0, 10)
            .map((i) => (
              <View
                key={i.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    width: breakpoints.md ? 20 : 15,
                    height: breakpoints.md ? 20 : 15,
                    borderWidth: 1,
                    borderColor: theme[7],
                    borderRadius: 99,
                  }}
                />
                <Text
                  numberOfLines={1}
                  style={{ fontSize: breakpoints.md ? 13 : 12, opacity: 0.6 }}
                >
                  {i.name}
                </Text>
              </View>
            ))}
        </ScrollView>
        {tasks.length !== 0 && (
          <LinearGradient
            colors={["transparent", theme[2]]}
            style={{
              height: 40,
              marginTop: -40,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 10,
            }}
          >
            <Text weight={800} style={{ color: theme[11] }}>
              View all
            </Text>
            <Icon>expand_all</Icon>
          </LinearGradient>
        )}
      </Pressable>
    </Animated.View>
  );
}

export function Matrix() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();

  const [currentColumn, setCurrentColumn] = useState(null);
  const { data, mutate } = useCollectionContext();

  const filteredTasks = [
    ...data.entities,
    ...data.labels.reduce((acc, curr) => [...acc, ...curr.entities], []),
  ];

  const onTaskUpdate = (updatedTask, oldTask) => {
    mutate(
      (oldData) => {
        const labelIndex = oldData.labels.findIndex(
          (l) => l.id === updatedTask.label?.id
        );
        if (labelIndex === -1)
          return {
            ...oldData,
            entities: oldData.entities.map((t) =>
              t.id === updatedTask.id ? updatedTask : t
            ),
          };

        const taskIndex = oldData.labels[labelIndex].entities.findIndex(
          (t) => t.id === updatedTask.id
        );

        if (taskIndex === -1)
          return {
            ...oldData,
            labels: oldData.labels.map((l) =>
              l?.id === updatedTask.label?.id
                ? {
                    ...l,
                    entities: [...l.entities, updatedTask],
                  }
                : l.id === oldTask.label?.id
                ? {
                    ...l,
                    entities: l.entities.find((t) => t.id === oldTask.id)
                      ? l.entities.filter((t) => t.id !== oldTask.id)
                      : [updatedTask, ...l.entities],
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

  const onEntityCreate = (newTask) => {
    if (!newTask) return;
    mutate(
      (data) => {
        const labelIndex = data.labels.findIndex(
          (l) => l.id === newTask?.label.id
        );
        if (labelIndex === -1) return data;
        return {
          ...data,
          labels: data.labels.map((l) =>
            l.id === newTask?.lebel.id
              ? { ...l, entities: [...l.entities, newTask] }
              : l
          ),
        };
      },
      {
        revalidate: false,
      }
    );
  };

  const grid = useMemo(
    () => ({
      pinnedImportant: filteredTasks.filter(
        (e) => e.pinned && dayjs(e.start).isBefore(dayjs().endOf("day"))
      ),
      important: filteredTasks.filter(
        (e) => !e.pinned && dayjs(e.start).isBefore(dayjs().endOf("day"))
      ),
      pinned: filteredTasks.filter(
        (e) => e.pinned && !dayjs(e.start).isBefore(dayjs().endOf("day"))
      ),
      other: filteredTasks.filter(
        (e) => !e.pinned && !dayjs(e.start).isBefore(dayjs().endOf("day"))
      ),
    }),
    [filteredTasks]
  );
  const padding = breakpoints.md ? 20 : currentColumn ? 0 : 20;
  return (
    <View
      style={[
        styles.container,
        { padding },
        { paddingBottom: (currentColumn ? 0 : insets.bottom) + padding },
        { gap: breakpoints.md ? 20 : 10 },
        !currentColumn &&
          !breakpoints.md && {
            backgroundColor: theme[3],
            borderTopWidth: 1,
            borderTopColor: theme[5],
          },
      ]}
    >
      {breakpoints.md || !currentColumn ? (
        <>
          <View
            style={[
              styles.row,
              {
                flex: 0,
                justifyContent: "space-around",
                paddingLeft: breakpoints.md ? 30 : 50,
                marginVertical: breakpoints.md ? 0 : 3,
                marginBottom: breakpoints.md ? 0 : 10,
              },
            ]}
          >
            <Label size={900} x="Urgent" />
            <Label size={900} x="Less urgent" />
          </View>
          <View style={[styles.row, { gap: breakpoints.md ? 20 : 10 }]}>
            <Label size={100} y="Important" />
            {breakpoints.md ? (
              <Cell
                onEntityCreate={onEntityCreate}
                handleMutate={onTaskUpdate}
                tasks={grid.pinnedImportant}
                defaultOptions={{ pinned: true, due: dayjs().startOf("day") }}
              />
            ) : (
              <Preview
                onPress={() => setCurrentColumn("pinnedImportant")}
                tasks={grid.pinnedImportant}
              />
            )}
            {breakpoints.md ? (
              <Cell
                onEntityCreate={onEntityCreate}
                handleMutate={onTaskUpdate}
                tasks={grid.important}
                defaultOptions={{ due: dayjs().startOf("day") }}
              />
            ) : (
              <Preview
                onPress={() => setCurrentColumn("important")}
                tasks={grid.important}
              />
            )}
          </View>
          <View style={[styles.row, { gap: breakpoints.md ? 20 : 10 }]}>
            <Label size={133} y="Less important" />
            {breakpoints.md ? (
              <Cell
                onEntityCreate={onEntityCreate}
                handleMutate={onTaskUpdate}
                tasks={grid.pinned}
                defaultOptions={{ pinned: true }}
              />
            ) : (
              <Preview
                onPress={() => setCurrentColumn("pinned")}
                tasks={grid.pinned}
              />
            )}
            {breakpoints.md ? (
              <Cell
                onEntityCreate={onEntityCreate}
                handleMutate={onTaskUpdate}
                tasks={grid.other}
                defaultOptions={{}}
              />
            ) : (
              <Preview
                onPress={() => setCurrentColumn("other")}
                tasks={grid.other}
              />
            )}
          </View>
        </>
      ) : (
        <Cell
          onEntityCreate={onEntityCreate}
          handleMutate={onTaskUpdate}
          tasks={grid[currentColumn]}
          defaultOptions={{ pinned: true }}
          handleHome={() => setCurrentColumn(null)}
        />
      )}
    </View>
  );
}
