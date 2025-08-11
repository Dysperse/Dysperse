import { mutations } from "@/app/(app)/[tab]/collections/mutations";
import CreateTask from "@/components/task/create";
import { STORY_POINT_SCALE } from "@/constants/workload";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import RefreshControl from "@/ui/RefreshControl";
import Text from "@/ui/Text";
import { TEMPORARY_CONTENT_INSET_FIX } from "@/utils/temporary-scrolling-bug-fix";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import {
  Dispatch,
  default as React,
  SetStateAction,
  useRef,
  useState,
} from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useCollectionContext } from "../../context";
import { ColumnEmptyComponent } from "../../emptyComponent";
import { Entity } from "../../entity";
import { taskSortAlgorithm } from "../skyline";

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

function StoryPointShape({ selected, index, onPress }) {
  const scale = ["XS", "S", "M", "L", "XL"];
  const theme = useColorTheme();

  return (
    <IconButton
      onPress={() => {
        impactAsync(ImpactFeedbackStyle.Light);
        if (onPress) onPress();
      }}
      backgroundColors={{
        default: "transparent",
        hovered: "transparent",
        pressed: "transparent",
      }}
      style={{
        flex: 1,
        aspectRatio: 1,
      }}
    >
      <View
        style={
          Platform.OS === "web"
            ? { marginTop: -5 }
            : {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: 1.2 }],
              }
        }
      >
        <Icon
          size={50}
          filled
          style={{
            color: theme[selected ? 11 : 5],
            transform: [{ rotate: index === -1 ? "45deg" : "0deg" }],
          }}
        >
          {index === -1
            ? "circle"
            : [
                "kid_star",
                "square",
                "thermostat_carbon",
                "pentagon",
                "hexagon",
              ][index]}
        </Icon>
      </View>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: theme[selected ? 1 : 11],
            fontSize: 15,
            textAlign: "center",
            marginTop: -2,
          }}
          weight={700}
        >
          {index === -1 ? (
            <View
              style={{
                marginLeft: 4,
                paddingLeft: 4,
                height: 25,
              }}
            >
              <Icon size={24} bold style={{ color: theme[selected ? 1 : 11] }}>
                close
              </Icon>
            </View>
          ) : (
            scale[index]
          )}
        </Text>
      </View>
    </IconButton>
  );
}

const StoryPointHeader = ({
  index,
  columnRef,
}: {
  index: number;
  columnRef: any;
  setSelectedScale: Dispatch<SetStateAction<number>>;
}) => {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <LinearGradient
      colors={[theme[breakpoints.md ? 2 : 1], theme[breakpoints.md ? 2 : 1]]}
      style={{
        borderRadius: breakpoints.md ? 20 : 0,
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderTopWidth: breakpoints.md ? 0 : 1,
        borderTopColor: theme[5],
      }}
    >
      <Pressable
        onPress={() =>
          columnRef.current.scrollToOffset({ index: 0, animated: true })
        }
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginRight: "auto",
          gap: 15,
        }}
      >
        <StoryPointShape index={index} />
        <Text
          style={{
            color: theme[11],
            fontSize: 23,
            fontFamily: "serifText700",
          }}
        >
          {STORY_POINT_SCALE[index] || "Unmarked"}
        </Text>
      </Pressable>
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
    .filter(
      (t) =>
        (t.storyPoints === scale || (scale === -1 && !t.storyPoints)) &&
        !t.trash
    )
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
      {breakpoints.md && (
        <StoryPointHeader
          setSelectedScale={setSelectedScale}
          columnRef={columnRef}
          scale={scale}
          index={index}
        />
      )}
      {isReadOnly ? null : (
        <>
          <View
            style={[
              styles.header,
              { paddingHorizontal: 15, paddingTop: 10, marginBottom: -10 },
            ]}
          >
            <CreateTask
              defaultValues={{
                collectionId: data?.id === "all" ? undefined : data?.id,
                date: dayjs(),
                storyPoints: scale === -1 ? undefined : scale,
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
            ) && (
              <View style={{ padding: 20, paddingBottom: 0, paddingTop: 5 }}>
                <ColumnEmptyComponent
                  row
                  plannerFinished
                  finished
                  offset={index}
                />
              </View>
            )}
        </>
      )}
      {filteredTasks.length === 0 ? (
        <View style={styles.empty}>
          <ColumnEmptyComponent offset={index} />
        </View>
      ) : (
        <FlashList
          contentInset={TEMPORARY_CONTENT_INSET_FIX()}
          ref={columnRef}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={() => mutate()} />
          }
          data={taskSortAlgorithm(filteredTasks).filter((t) => !t.parentTaskId)}
          estimatedItemSize={100}
          contentContainerStyle={{
            padding: 10,
            paddingBottom: 50,
          }}
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
      )}
    </View>
  );
};

export default function Workload() {
  const breakpoints = useResponsiveBreakpoints();
  const [selectedScale, setSelectedScale] = useState(-1);
  const theme = useColorTheme();
  const scale = [2, 4, 8, 16, 32];

  return breakpoints.md ? (
    <ScrollView horizontal contentContainerStyle={{ padding: 15, gap: 15 }}>
      <StoryPoint scale={-1} index={-1} setSelectedScale={setSelectedScale} />
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
    <>
      {!breakpoints.md && (
        <View style={{ padding: 15, gap: 5 }}>
          <Text
            style={{
              color: theme[11],
              fontSize: 23,
              paddingHorizontal: 5,
              fontFamily: "serifText700",
            }}
          >
            {selectedScale == -1
              ? "Unmarked tasks"
              : STORY_POINT_SCALE[selectedScale]}
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 15,
            }}
          >
            <StoryPointShape
              index={-1}
              selected={selectedScale === -1}
              onPress={() => setSelectedScale(-1)}
            />
            {scale.map((s, i) => (
              <StoryPointShape
                key={s}
                index={i}
                selected={selectedScale === i}
                onPress={() => setSelectedScale(i)}
              />
            ))}
          </View>
        </View>
      )}
      <StoryPoint
        scale={selectedScale == -1 ? -1 : scale[selectedScale]}
        setSelectedScale={setSelectedScale}
        index={selectedScale}
      />
    </>
  );
}

