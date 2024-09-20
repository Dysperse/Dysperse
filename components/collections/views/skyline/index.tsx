import CreateTask from "@/components/task/create";
import { getTaskCompletionStatus } from "@/helpers/getTaskCompletionStatus";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { createContext, useEffect, useMemo, useState } from "react";
import { View, ViewStyle } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import useSWR from "swr";
import { useCollectionContext } from "../../context";
import { ColumnEmptyComponent } from "../../emptyComponent";
import { Entity } from "../../entity";
import { AgendaButtons } from "../../navbar/AgendaButtons";

const SkylineContext = createContext(null);

function Header({
  title,
  mutate,
  large = false,
  range,
  setSelectedColumn = (t) => {},
  selectedColumn = "today",
}) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { data } = useCollectionContext();

  const collectionId = data?.id || "all";

  const modes = ["today", "week", "month", "year"];

  return (
    <>
      <View>
        <LinearGradient
          colors={[theme[3], theme[breakpoints.md ? 2 : 1]]}
          style={[
            { padding: 20, paddingBottom: 0 },
            !breakpoints.md && {
              borderTopWidth: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderTopColor: theme[5],
            },
          ]}
        >
          {!breakpoints.md && (
            <IconButton
              icon="arrow_back"
              onPress={() =>
                setSelectedColumn(
                  modes[
                    (modes.indexOf(selectedColumn) - 1 + modes.length) %
                      modes.length
                  ]
                )
              }
            />
          )}
          <View>
            <Text
              style={{
                fontSize: large ? 35 : 25,
                color: theme[11],
                textAlign: breakpoints.md ? "left" : "center",
              }}
              weight={large ? 900 : 700}
            >
              {title}
            </Text>
            <Text
              style={{
                fontSize: 20,
                marginBottom: 10,
                color: theme[11],
                opacity: 0.6,
                textAlign: breakpoints.md ? "left" : "center",
              }}
            >
              {dayjs(range[0])
                .utc()
                .format("MMM D" + (large ? "o" : ""))}{" "}
              {!large && "-"} {!large && dayjs(range[1]).utc().format("MMM D")}
            </Text>
          </View>
          {!breakpoints.md && (
            <IconButton
              icon="arrow_forward"
              onPress={() => {
                setSelectedColumn(
                  modes[(modes.indexOf(selectedColumn) + 1) % modes.length]
                );
              }}
            />
          )}
        </LinearGradient>
        <View
          style={{
            padding: 20,
            paddingBottom: 0,
            paddingTop: breakpoints.md ? 5 : undefined,
          }}
        >
          <CreateTask
            mutate={(task) => {
              mutate((oldData) => {
                const taskStart = dayjs(task.start).utc();
                const unit = Object.values(oldData).find(({ filterRange }) =>
                  taskStart.isBetween(
                    filterRange[0],
                    filterRange[1],
                    null,
                    "[]"
                  )
                );
                if (unit) unit.entities.push(task as never);

                return oldData;
              });
            }}
            defaultValues={{
              dateOnly: true,
              collectionId: collectionId === "all" ? undefined : collectionId,
              date: dayjs(range[0]).add(1, "second"),
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
      </View>
      <LinearGradient
        style={{
          width: "100%",
          height: 30,
          zIndex: 1,
          marginBottom: -30,
          pointerEvents: "none",
        }}
        colors={[theme[breakpoints.md ? 2 : 1], "transparent"]}
      />
    </>
  );
}

export const taskSortAlgorithm = (t) =>
  t
    .slice()
    .sort((a, b) => a.agendaOrder?.toString()?.localeCompare(b.agendaOrder))
    .sort((x, y) => {
      // Get task completion status for both x and y
      const xCompleted = getTaskCompletionStatus(x, x.recurrenceDay);
      const yCompleted = getTaskCompletionStatus(y, y.recurrenceDay);

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

function Content({ data, mutate }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const [selectedColumn, setSelectedColumn] = useState("today");

  const columnStyles = breakpoints.md
    ? ({
        backgroundColor: theme[2],
        width: 300,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 25,
      } as ViewStyle)
    : {};

  const renderItem = ({ item }) => (
    <Entity
      dateRange={item.recurrenceDay}
      isReadOnly={false}
      showDate
      showLabel
      item={item}
      onTaskUpdate={(newTask) => {
        if (!newTask) return;
        mutate(
          (oldData) => {
            const unit = Object.keys(oldData).find((key) =>
              oldData[key].entities.find((entity) => entity.id === newTask.id)
            );

            if (unit) {
              return {
                ...oldData,
                [unit]: {
                  ...oldData[unit],
                  entities: oldData[unit].entities
                    .map((entity) =>
                      entity.id === newTask.id ? newTask : entity
                    )
                    .filter((entity) => entity && !entity.trash),
                },
              };
            }
          },
          { revalidate: false }
        );
      }}
    />
  );

  return breakpoints.md ? (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        padding: 15,
        gap: 15,
      }}
      horizontal
      style={{ flex: 1 }}
    >
      {/* {JSON.stringify(data, null, 2)} */}
      <View style={[columnStyles, { width: 350 }]}>
        <Header
          mutate={mutate}
          title="Today"
          large
          range={data.today.filterRange}
        />
        <FlashList
          contentContainerStyle={{ padding: 20 }}
          data={taskSortAlgorithm(data.today.entities)}
          centerContent={data.today.entities.length === 0}
          ListEmptyComponent={() => <ColumnEmptyComponent />}
          renderItem={renderItem}
        />
      </View>
      <View style={columnStyles}>
        <Header mutate={mutate} title="Week" range={data.week.filterRange} />
        <FlashList
          contentContainerStyle={{ padding: 20 }}
          data={taskSortAlgorithm(data.week.entities)}
          centerContent={data.week.entities.length === 0}
          ListEmptyComponent={() => <ColumnEmptyComponent />}
          renderItem={renderItem}
        />
      </View>
      <View style={columnStyles}>
        <Header mutate={mutate} title="Month" range={data.month.filterRange} />
        <FlashList
          contentContainerStyle={{ padding: 20 }}
          data={taskSortAlgorithm(data.month.entities)}
          centerContent={data.month.entities.length === 0}
          ListEmptyComponent={() => <ColumnEmptyComponent />}
          renderItem={renderItem}
        />
      </View>
      <View style={columnStyles}>
        <Header mutate={mutate} title="Year" range={data.year.filterRange} />
        <FlashList
          contentContainerStyle={{ padding: 20 }}
          data={taskSortAlgorithm(data.year.entities)}
          centerContent={data.year.entities.length === 0}
          ListEmptyComponent={() => <ColumnEmptyComponent />}
          renderItem={renderItem}
        />
      </View>
      <View style={{ width: 1 }} />
    </ScrollView>
  ) : (
    <View
      style={[
        columnStyles,
        { borderTopWidth: 1, borderTopColor: theme[5], flex: 1 },
      ]}
    >
      <AgendaButtons />
      <Header
        mutate={mutate}
        selectedColumn={selectedColumn}
        setSelectedColumn={setSelectedColumn}
        title={capitalizeFirstLetter(selectedColumn)}
        range={data[selectedColumn].filterRange}
      />
      <View style={{ flex: 1 }}>
        <FlashList
          contentContainerStyle={{ padding: 20 }}
          data={data[selectedColumn].entities}
          centerContent={data[selectedColumn].entities.length === 0}
          ListEmptyComponent={() => <ColumnEmptyComponent />}
          renderItem={renderItem}
        />
      </View>
    </View>
  );
}

export default function Skyline() {
  // eslint-disable-next-line prefer-const
  let { start, id } = useLocalSearchParams();
  const { isPublic } = useCollectionContext();
  if (!start) start = dayjs().startOf("day").toISOString();

  const agendaContextValue = useMemo(
    () => ({ id, start: dayjs(start as string) }),
    [start, id]
  );

  const { data, error, mutate } = useSWR([
    "space/collections/collection/skyline",
    {
      start: agendaContextValue.start.startOf("day").toISOString(),
      id: agendaContextValue.id,
      isPublic: isPublic ? "true" : "false",
      timezone: dayjs.tz.guess(),
      ...(agendaContextValue.id === "all" && { all: true }),
    },
  ]);

  const opacity = useSharedValue(0);
  const opacityStyle = useAnimatedStyle(() => ({
    opacity: withSpring(opacity.value, { damping: 20, stiffness: 90 }),
  }));

  useEffect(() => {
    setTimeout(() => (opacity.value = 1), 0);
  }, [opacity]);

  return (
    <SkylineContext.Provider value={agendaContextValue as any}>
      {data ? (
        <Animated.View style={[{ flex: 1 }, opacityStyle]}>
          <Content data={data} mutate={mutate} />
        </Animated.View>
      ) : error ? (
        <ErrorAlert />
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Spinner />
        </View>
      )}
    </SkylineContext.Provider>
  );
}
