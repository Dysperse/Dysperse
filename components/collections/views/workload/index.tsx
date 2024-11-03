import { mutations } from "@/app/(app)/[tab]/collections/mutations";
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
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: "auto",
          gap: 15,
        }}
      >
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            width: 40,
            height: 40,
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
            <Shape size={40} color={theme[5]} />
          </View>
          <Text
            style={{
              color: theme[11],
              fontSize: 18,
              fontFamily: getFontName("jetBrainsMono", 500),
            }}
          >
            {scale}
          </Text>
        </View>
        <Text weight={900} style={{ color: theme[11] }}>
          {STORY_POINT_SCALE[index]}
        </Text>
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
    ...Object.values(data.entities),
    ...data.labels.reduce(
      (acc, curr) => [...acc, ...Object.values(curr.entities)],
      []
    ),
  ]
    .filter((t) => t.storyPoints === scale && !t.trash)
    .slice()
    .sort((a, b) => {
      const agendaOrderComparison = a.agendaOrder
        ?.toString()
        ?.localeCompare(b.agendaOrder);
      if (agendaOrderComparison !== 0) return agendaOrderComparison;

      const xCompleted = a.completionInstances.length > 0;
      const yCompleted = b.completionInstances.length > 0;

      if (xCompleted === yCompleted) {
        return a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1;
      } else {
        return xCompleted ? 1 : -1;
      }
    });

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
              mutate={mutations.categoryBased.add(mutate)}
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
            onTaskUpdate={mutations.categoryBased.update(mutate)}
          />
        )}
        keyExtractor={(i, d) => `${i.id}-${d}`}
      />
    </View>
  );
};

export default function Workload() {
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

