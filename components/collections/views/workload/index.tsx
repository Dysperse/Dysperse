import CreateTask from "@/components/task/create";
import { STORY_POINT_SCALE } from "@/constants/workload";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import IconButton from "@/ui/IconButton";
import RefreshControl from "@/ui/RefreshControl";
import * as shapes from "@/ui/shapes";
import Text, { getFontName } from "@/ui/Text";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useCollectionContext } from "../../context";
import { ColumnEmptyComponent } from "../../emptyComponent";
import { Entity } from "../../entity";
import { ColumnFinishedComponent } from "../kanban/Column";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingBottom: 10,
    gap: 10,
    marginTop: -15,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    width: "100%",
  },
  emptyIcon: { transform: [{ rotate: "-45deg" }] },
  emptyIconContainer: {
    borderRadius: 30,
    marginBottom: 20,
    transform: [{ rotate: "45deg" }],
  },
});

const StoryPointHeader = ({
  scale,
  index,
  columnRef,
  setSelectedScale,
}: {
  scale: number;
  index: number;
  columnRef: any;
  setSelectedScale: Dispatch<SetStateAction<number>>;
}) => {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const Shape = shapes[`shape${index + 1}`] || React.Fragment;

  const handleBack = () => setSelectedScale((t) => (t === 0 ? 0 : t - 1));
  const handleNext = () => setSelectedScale((t) => (t === 4 ? 4 : t + 1));

  return (
    <LinearGradient
      colors={[theme[breakpoints.md ? 2 : 3], theme[breakpoints.md ? 2 : 3]]}
      style={{
        borderRadius: breakpoints.md ? 20 : 0,
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderTopWidth: breakpoints.md ? 0 : 1,
        borderTopColor: theme[5],
      }}
    >
      {!breakpoints.md && (
        <IconButton
          onPress={handleBack}
          size={55}
          icon="arrow_back_ios_new"
          disabled={index === 0}
        />
      )}
      <Pressable
        onPress={() =>
          columnRef.current.scrollToOffset({ index: 0, animated: true })
        }
        style={{
          alignItems: "center",
          marginHorizontal: "auto",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            width: 60,
            height: 60,
            justifyContent: "center",
            marginHorizontal: "auto",
            position: "relative",
          }}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <Shape size={60} color={theme[5]} />
          </View>
          <Text
            style={{
              color: theme[11],
              fontSize: 20,
              fontFamily: getFontName("jetBrainsMono", 500),
            }}
          >
            {scale}
          </Text>
        </View>
        <Text variant="eyebrow">{STORY_POINT_SCALE[index]}</Text>
      </Pressable>
      {!breakpoints.md && (
        <IconButton
          onPress={handleNext}
          size={55}
          icon="arrow_forward_ios"
          disabled={index === 4}
        />
      )}
    </LinearGradient>
  );
};

const StoryPoint = ({
  scale,
  index,
  setSelectedScale,
}: {
  scale: number;
  index: number;
  setSelectedScale: (value: number) => void;
}) => {
  const breakpoints = useResponsiveBreakpoints();
  const { data, access, mutate } = useCollectionContext();
  const isReadOnly = access?.access === "READ_ONLY";
  const theme = useColorTheme();
  const columnRef = useRef(null);

  const filteredTasks = [
    ...data.entities,
    ...data.labels.reduce((acc, curr) => [...acc, ...curr.entities], []),
  ]
    .filter((t) => t.storyPoints === scale && !t.trash)
    .slice()
    .sort((a, b) => a.agendaOrder?.toString()?.localeCompare(b.agendaOrder))
    .sort((x, y) => {
      const xCompleted = x.completionInstances.length > 0;
      const yCompleted = y.completionInstances.length > 0;

      // If completion status is the same, sort by pinned status
      if (xCompleted === yCompleted) {
        // If both are pinned or both are not pinned, return 0
        if (x.pinned === y.pinned) {
          return 0;
        } else {
          // If x is pinned and y is not pinned, x should come before y
          // If x is not pinned and y is pinned, y should come before x
          return x.pinned ? -1 : 1;
        }
      } else {
        // Sort by completion status
        // If x is completed and y is not completed, x should come after y
        // If y is completed and x is not completed, y should come after x
        return xCompleted ? 1 : -1;
      }
    });

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

  return (
    <View
      style={[
        {
          marginBottom: breakpoints.md ? 10 : 0,
          backgroundColor: theme[breakpoints.md ? 2 : 1],
          width: breakpoints.md ? 320 : "100%",
          borderRadius: breakpoints.md ? 20 : 0,
          flex: 1,
        },
        breakpoints.md && {
          borderWidth: 1,
          borderColor: addHslAlpha(theme[5], 0.7),
        },
      ]}
    >
      <StoryPointHeader
        setSelectedScale={setSelectedScale}
        columnRef={columnRef}
        scale={scale}
        index={index}
      />
      {isReadOnly ? null : (
        <>
          <View
            style={[styles.header, { paddingHorizontal: 10, paddingTop: 10 }]}
          >
            <CreateTask
              defaultValues={{
                collectionId: data?.id === "all" ? undefined : data?.id,
                date: dayjs(),
                storyPoints: scale,
              }}
              mutate={(newTask) => {
                mutate((oldData) => {
                  const labelIndex = oldData.labels.findIndex(
                    (l) => l.id === newTask.label?.id
                  );
                  if (labelIndex === -1) {
                    return {
                      ...oldData,
                      entities: [...oldData.entities, newTask],
                    };
                  }

                  return {
                    ...oldData,
                    labels: [
                      ...oldData.labels.slice(0, labelIndex),
                      {
                        ...oldData.labels[labelIndex],
                        entities: [
                          ...oldData.labels[labelIndex].entities,
                          newTask,
                        ],
                      },
                      ...oldData.labels.slice(labelIndex + 1),
                    ],
                  };
                });
              }}
            >
              <Button
                variant="filled"
                containerStyle={{ flex: 1 }}
                large={!breakpoints.md}
                bold={!breakpoints.md}
                iconPosition="end"
                text="Create"
                icon="stylus_note"
                height={breakpoints.md ? 50 : 55}
              />
            </CreateTask>
          </View>
          {filteredTasks.length > 0 &&
            !filteredTasks.find(
              (task) =>
                task.recurrenceRule ||
                (!task.recurrenceRule && task.completionInstances.length === 0)
            ) && <ColumnFinishedComponent />}
        </>
      )}
      <FlashList
        ref={columnRef}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => mutate()} />
        }
        data={filteredTasks
          .sort((a, b) =>
            a.agendaOrder?.toString()?.localeCompare(b.agendaOrder)
          )
          .sort((x, y) => (x.pinned === y.pinned ? 0 : x.pinned ? -1 : 1))
          .sort((x, y) =>
            x.completionInstances.length === y.completionInstances.length
              ? 0
              : x.completionInstances.length === 0
              ? -1
              : 0
          )}
        estimatedItemSize={100}
        contentContainerStyle={{
          padding: 15,
          paddingBottom: 50,
        }}
        centerContent={filteredTasks.length === 0}
        ListEmptyComponent={() => <ColumnEmptyComponent />}
        renderItem={({ item }) => (
          <Entity
            showLabel
            isReadOnly={isReadOnly}
            item={item}
            onTaskUpdate={onTaskUpdate}
          />
        )}
        keyExtractor={(i, d) => `${i.id}-${d}`}
      />
    </View>
  );
};

export default function Workload() {
  const theme = useColorTheme();
  const { mutate } = useCollectionContext();
  const breakpoints = useResponsiveBreakpoints();
  const [selectedScale, setSelectedScale] = useState(0);

  const scale = [2, 4, 8, 16, 32];

  return breakpoints.md ? (
    <ScrollView
      horizontal
      contentContainerStyle={{ padding: 15, gap: 15 }}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={() => mutate()} />
      }
    >
      {scale.map((s, i) => (
        <StoryPoint
          key={s}
          scale={s}
          index={i}
          setSelectedScale={setSelectedScale}
        />
      ))}
    </ScrollView>
  ) : (
    <StoryPoint
      scale={scale[selectedScale]}
      setSelectedScale={setSelectedScale}
      index={selectedScale}
    />
  );
}
