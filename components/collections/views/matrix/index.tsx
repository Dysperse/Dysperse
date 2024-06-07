import CreateTask from "@/components/task/create";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useCollectionContext } from "../../context";
import { Entity } from "../../entity";
import { ColumnEmptyComponent } from "../planner/Column";

const styles = StyleSheet.create({
  container: { flexDirection: "column", flex: 1, padding: 25, gap: 20 },
  row: { flex: 1, flexDirection: "row", gap: 20, alignItems: "center" },
  cell: { flex: 1, borderWidth: 1, borderRadius: 25, height: "100%" },
  add: {
    alignItems: "center",
    marginVertical: -25,
    height: 35,
    marginLeft: 20,
  },
});

const Cell = ({ onEntityCreate, handleMutate, tasks, defaultOptions }) => {
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
        { backgroundColor: theme[2], borderColor: theme[5] },
      ]}
    >
      <Pressable
        onPress={() =>
          ref.current.scrollToOffset({ animated: true, offset: 0 })
        }
        style={{
          padding: 5,
          paddingHorizontal: 20,
          paddingRight: 10,
          borderBottomWidth: 1,
          borderBottomColor: theme[4],
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text weight={500} style={{ opacity: 0.5 }}>
          {remainingTasks.length} task{remainingTasks.length !== 1 && "s"}
        </Text>
        <CreateTask
          mutate={(n) => onEntityCreate(n)}
          defaultValues={defaultOptions}
        >
          <IconButton icon="add" style={{ marginLeft: "auto" }} />
        </CreateTask>
      </Pressable>
      <FlashList
        ref={ref}
        contentContainerStyle={{ padding: 10 }}
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
        centerContent={filteredTasks.lengh === 0}
        ListFooterComponent={() =>
          tasks.find((i) => i.completionInstances.lengh !== 0) &&
          filteredTasks.lengh !== 0 && (
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
  const theme = useColorTheme();

  return (
    <Text
      variant="eyebrow"
      numberOfLines={1}
      style={
        y
          ? {
              transform: [{ rotate: "-90deg" }],
              width: size,
              marginHorizontal: -(size / 2),
              height: 20,
            }
          : {}
      }
    >
      {x || y}
    </Text>
  );
};

export function Matrix() {
  const theme = useColorTheme();
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

  const pinnedImportant = useMemo(
    () =>
      filteredTasks.filter(
        (e) => e.pinned && dayjs(e.due).isBefore(dayjs().endOf("day"))
      ),
    [filteredTasks]
  );

  const important = useMemo(
    () =>
      filteredTasks.filter(
        (e) => !e.pinned && dayjs(e.due).isBefore(dayjs().endOf("day"))
      ),
    [filteredTasks]
  );

  const pinned = useMemo(
    () =>
      filteredTasks.filter(
        (e) => e.pinned && !dayjs(e.due).isBefore(dayjs().endOf("day"))
      ),
    [filteredTasks]
  );

  const other = useMemo(
    () =>
      filteredTasks.filter(
        (e) => !e.pinned && !dayjs(e.due).isBefore(dayjs().endOf("day"))
      ),
    [filteredTasks]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.row, { flex: 0, justifyContent: "space-around" }]}>
        <Label size={900} x="Urgent" />
        <Label size={900} x="Less urgent" />
      </View>
      <View style={styles.row}>
        <Label size={100} y="Important" />
        <Cell
          onEntityCreate={onEntityCreate}
          handleMutate={onTaskUpdate}
          tasks={pinnedImportant}
          defaultOptions={{ pinned: true, due: dayjs().startOf("day") }}
        />
        <Cell
          onEntityCreate={onEntityCreate}
          handleMutate={onTaskUpdate}
          tasks={important}
          defaultOptions={{ due: dayjs().startOf("day") }}
        />
      </View>
      <View style={styles.row}>
        <Label size={133} y="Less important" />
        <Cell
          onEntityCreate={onEntityCreate}
          handleMutate={onTaskUpdate}
          tasks={pinned}
          defaultOptions={{ pinned: true }}
        />
        <Cell
          onEntityCreate={onEntityCreate}
          handleMutate={onTaskUpdate}
          tasks={other}
          defaultOptions={{}}
        />
      </View>
    </View>
  );
}
