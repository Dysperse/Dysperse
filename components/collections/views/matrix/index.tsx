import { mutations } from "@/app/(app)/[tab]/collections/mutations";
import CreateTask from "@/components/task/create";
import { OnboardingContainer } from "@/context/OnboardingProvider";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import RefreshControl from "@/ui/RefreshControl";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AttachStep } from "react-native-spotlight-tour";
import { useCollectionContext } from "../../context";
import { ColumnEmptyComponent } from "../../emptyComponent";
import { Entity } from "../../entity";

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
  name,
  tasks,
  defaultOptions,
  handleHome,
  cellIndex,
}: {
  name?: string;
  tasks: any;
  defaultOptions: any;
  handleHome?: any;
  cellIndex?: number;
}) => {
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const ref = useRef(null);
  const { mutate } = useCollectionContext();

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
    <Animated.View
      entering={FadeInDown}
      style={[
        styles.cell,
        breakpoints.md
          ? { backgroundColor: theme[2], borderColor: theme[5] }
          : { borderWidth: 0, borderRadius: 0, marginTop: 10 },
      ]}
    >
      <Pressable
        onPress={() =>
          ref.current.scrollToOffset({ animated: true, offset: 0 })
        }
      >
        <View
          style={[
            {
              padding: 10,
              paddingHorizontal: breakpoints.md ? 20 : 10,
              paddingRight: 10,
              backgroundColor: theme[breakpoints.md ? 2 : 3],
              borderRadius: 25,
              marginHorizontal: breakpoints.md ? 0 : 20,
              flexDirection: "row",
              alignItems: "center",
            },
          ]}
        >
          {handleHome && (
            <IconButton
              icon="arrow_back_ios_new"
              onPress={handleHome}
              size={50}
              style={{ marginRight: 5 }}
            />
          )}
          <View>
            {name && (
              <Text
                weight={800}
                style={{ color: theme[11], fontSize: 18, marginBottom: -2 }}
              >
                {name}
              </Text>
            )}
            <Text weight={500} style={{ color: theme[11], opacity: 0.6 }}>
              {remainingTasks.length} task{remainingTasks.length !== 1 && "s"}
            </Text>
          </View>
          <CreateTask
            mutate={mutations.categoryBased.add(mutate)}
            defaultValues={defaultOptions}
          >
            <IconButton
              iconProps={{ bold: true }}
              size={50}
              style={{
                borderRadius: 20,
                marginLeft: "auto",
              }}
              backgroundColors={{
                default: addHslAlpha(theme[9], 0.1),
                hovered: addHslAlpha(theme[9], 0.2),
                pressed: addHslAlpha(theme[9], 0.3),
              }}
              icon="stylus_note"
            />
          </CreateTask>
        </View>
      </Pressable>
      <FlashList
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => mutate()} />
        }
        estimatedItemSize={118}
        ref={ref}
        contentContainerStyle={{
          padding: breakpoints.md ? 10 : 20,
          paddingTop: breakpoints.md ? undefined : 5,
        }}
        keyExtractor={(i: any) => i.id}
        ListEmptyComponent={() => (
          <ColumnEmptyComponent offset={cellIndex} row={breakpoints.md} />
        )}
        renderItem={({ item }) => (
          <Entity
            showRelativeTime
            showLabel
            isReadOnly={false}
            onTaskUpdate={mutations.categoryBased.update(mutate)}
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
    </Animated.View>
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
        onPress={() => {
          onPress();
          impactAsync(ImpactFeedbackStyle.Light);
        }}
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
          style={{
            padding: breakpoints.md ? 20 : 10,
            flex: 1,
          }}
          contentContainerStyle={{ flex: 1 }}
        >
          {tasks.length === 0 && (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Text
                  style={{
                    textAlign: "center",
                    color: theme[11],
                    opacity: 0.6,
                  }}
                  weight={900}
                >
                  No tasks
                </Text>
                <Icon size={20} style={{ opacity: 0.6 }}>
                  arrow_forward_ios
                </Icon>
              </View>
            </View>
          )}
          {tasks.slice(0, 10).map((i) => (
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
                  borderColor: theme[11],
                  opacity: 0.2,
                  borderRadius: 99,
                }}
              />
              <Text
                numberOfLines={1}
                style={{
                  fontSize: breakpoints.md ? 13 : 12,
                  opacity: 0.6,
                  color: theme[11],
                  flex: 1,
                }}
              >
                {i.name}
              </Text>
            </View>
          ))}
        </ScrollView>
        {tasks.length !== 0 && (
          <LinearGradient
            colors={[addHslAlpha(theme[2], 0), theme[2]]}
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

export default function Matrix() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();
  const [currentColumn, setCurrentColumn] = useState(null);
  const { data, mutate } = useCollectionContext();

  const filteredTasks = useMemo(
    () => [
      ...Object.values(data.entities),
      ...data.labels.reduce(
        (acc, curr) => [...acc, ...Object.values(curr.entities)],
        []
      ),
    ],
    [data]
  );

  const grid = useMemo(
    () => ({
      pinnedImportant: filteredTasks
        .filter(
          (e) => e.pinned && dayjs(e.start).isBefore(dayjs().endOf("day"))
        )
        .filter((e) => e.completionInstances.length === 0 && !e.recurrenceRule),
      important: filteredTasks
        .filter(
          (e) => !e.pinned && dayjs(e.start).isBefore(dayjs().endOf("day"))
        )
        .filter((e) => e.completionInstances.length === 0 && !e.recurrenceRule),
      pinned: filteredTasks
        .filter(
          (e) => e.pinned && !dayjs(e.start).isBefore(dayjs().endOf("day"))
        )
        .filter((e) => e.completionInstances.length === 0 && !e.recurrenceRule),
      other: filteredTasks
        .filter(
          (e) => !e.pinned && !dayjs(e.start).isBefore(dayjs().endOf("day"))
        )
        .filter((e) => e.completionInstances.length === 0 && !e.recurrenceRule),
    }),
    [filteredTasks]
  );
  const padding = breakpoints.md ? 20 : currentColumn ? 0 : 20;
  return (
    <View
      style={[
        styles.container,
        { padding },
        {
          paddingBottom: breakpoints.md
            ? padding
            : (currentColumn ? 0 : insets.bottom) + padding,
        },
        { gap: breakpoints.md ? 20 : 10 },
        !currentColumn &&
          !breakpoints.md && {
            backgroundColor: theme[1],
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
                marginVertical:
                  Platform.OS === "web" ? (breakpoints.md ? 0 : 3) : -10,
                marginBottom:
                  Platform.OS === "web" ? (breakpoints.md ? 0 : 10) : 0,
              },
            ]}
          >
            <Label size={900} x="Urgent" />
            <Label size={900} x="Less urgent" />
          </View>
          <OnboardingContainer
            id="MATRIX_VIEW"
            delay={500}
            steps={[
              {
                text: "Urgent & important → These are your deadlines & emergencies.",
              },
              {
                text: "Important but not urgent → Schedule it (e.g., planning).",
              },
              {
                text: "Urgent but not important → Interruptions you'll work on later",
              },
              {
                text: "Not urgent and not important → Delete it (e.g., distractions).",
              },
            ]}
          >
            {() => (
              <>
                <View style={[styles.row, { gap: breakpoints.md ? 20 : 10 }]}>
                  <Label size={100} y="Important" />
                  {breakpoints.md ? (
                    <AttachStep index={0}>
                      <View style={{ flex: 1 }}>
                        <Cell
                          cellIndex={0}
                          onEntityCreate={mutations.categoryBased.add(mutate)}
                          onTaskUpdate={mutations.categoryBased.update(mutate)}
                          tasks={grid.pinnedImportant}
                          defaultOptions={{
                            pinned: true,
                            due: dayjs().startOf("day"),
                          }}
                        />
                      </View>
                    </AttachStep>
                  ) : (
                    <AttachStep index={0}>
                      <View style={{ flex: 1 }}>
                        <Preview
                          onPress={() => setCurrentColumn("pinnedImportant")}
                          tasks={grid.pinnedImportant}
                        />
                      </View>
                    </AttachStep>
                  )}
                  {breakpoints.md ? (
                    <AttachStep index={1}>
                      <View style={{ flex: 1 }}>
                        <Cell
                          cellIndex={1}
                          onEntityCreate={mutations.categoryBased.add(mutate)}
                          onTaskUpdate={mutations.categoryBased.update(mutate)}
                          tasks={grid.important}
                          defaultOptions={{ due: dayjs().startOf("day") }}
                        />
                      </View>
                    </AttachStep>
                  ) : (
                    <AttachStep index={1}>
                      <View style={{ flex: 1 }}>
                        <Preview
                          onPress={() => setCurrentColumn("important")}
                          tasks={grid.important}
                        />
                      </View>
                    </AttachStep>
                  )}
                </View>
                <View style={[styles.row, { gap: breakpoints.md ? 20 : 10 }]}>
                  <Label size={150} y="Less important" />
                  {breakpoints.md ? (
                    <AttachStep index={2}>
                      <View style={{ flex: 1 }}>
                        <Cell
                          cellIndex={2}
                          onEntityCreate={mutations.categoryBased.add(mutate)}
                          onTaskUpdate={mutations.categoryBased.update(mutate)}
                          tasks={grid.pinned}
                          defaultOptions={{ pinned: true }}
                        />
                      </View>
                    </AttachStep>
                  ) : (
                    <AttachStep index={2}>
                      <View style={{ flex: 1 }}>
                        <Preview
                          onPress={() => setCurrentColumn("pinned")}
                          tasks={grid.pinned}
                        />
                      </View>
                    </AttachStep>
                  )}
                  {breakpoints.md ? (
                    <AttachStep index={3}>
                      <View style={{ flex: 1 }}>
                        <Cell
                          cellIndex={3}
                          onEntityCreate={mutations.categoryBased.add(mutate)}
                          onTaskUpdate={mutations.categoryBased.update(mutate)}
                          tasks={grid.other}
                          defaultOptions={{}}
                        />
                      </View>
                    </AttachStep>
                  ) : (
                    <AttachStep index={3}>
                      <View style={{ flex: 1 }}>
                        <Preview
                          onPress={() => setCurrentColumn("other")}
                          tasks={grid.other}
                        />
                      </View>
                    </AttachStep>
                  )}
                </View>
              </>
            )}
          </OnboardingContainer>
        </>
      ) : (
        <Cell
          cellIndex={
            currentColumn == "pinnedImportant"
              ? 0
              : currentColumn == "important"
              ? 1
              : currentColumn == "pinned"
              ? 2
              : 3
          }
          name={
            currentColumn == "pinnedImportant"
              ? "Urgent & important"
              : currentColumn == "important"
              ? "Important"
              : currentColumn == "pinned"
              ? "Urgent"
              : "Least priority"
          }
          onEntityCreate={mutations.categoryBased.add(mutate)}
          onTaskUpdate={mutations.categoryBased.update(mutate)}
          tasks={grid[currentColumn]}
          defaultOptions={{ pinned: true }}
          handleHome={() => setCurrentColumn(null)}
        />
      )}
    </View>
  );
}

