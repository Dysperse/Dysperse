import { mutations } from "@/app/(app)/[tab]/collections/mutations";
import CreateTask from "@/components/task/create";
import { getTaskCompletionStatus } from "@/helpers/getTaskCompletionStatus";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import IconButton from "@/ui/IconButton";
import RefreshControl from "@/ui/RefreshControl";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { createContext, useMemo, useState } from "react";
import { Platform, View, ViewStyle } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { useCollectionContext } from "../../context";
import { ColumnEmptyComponent } from "../../emptyComponent";
import { Entity } from "../../entity";
import { AgendaButtons } from "../../navbar/AgendaButtons";

const SkylineContext = createContext(null);

function ColumnSwitcher({ setCurrentColumn, currentColumn }) {
  const theme = useColorTheme();

  const columns = [
    ["Today", dayjs().format("MMM D")],
    [
      "Week",
      `${dayjs().format("Do")} - ${dayjs().add(6, "days").format("Do")}`,
    ],
    ["Month", dayjs().format("MMMM")],
    ["Year", dayjs().format("YYYY")],
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: -10,
      }}
    >
      {columns.map((column, index) => (
        <Button
          key={index}
          containerStyle={{ flex: 1, borderRadius: 20 }}
          bold={currentColumn === index}
          onPress={() => setCurrentColumn(index)}
          style={{ flexDirection: "column", gap: 0 }}
          height={60}
          backgroundColors={
            currentColumn === index
              ? {
                  default: addHslAlpha(theme[9], 0.1),
                  hovered: addHslAlpha(theme[9], 0.2),
                  pressed: addHslAlpha(theme[9], 0.3),
                }
              : {
                  default: "transparent",
                  hovered: addHslAlpha(theme[9], 0.1),
                  pressed: addHslAlpha(theme[9], 0.2),
                }
          }
        >
          <ButtonText weight={600}>{column[0]}</ButtonText>
          <ButtonText
            style={{
              opacity: 0.6,
              fontSize: 12,
            }}
          >
            {column[1]}
          </ButtonText>
        </Button>
      ))}
    </View>
  );
}

function Header({
  title,
  mutate,
  large = false,
  range,
  setSelectedColumn = (t) => {},
  selectedColumn = 0,
}) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { data } = useCollectionContext();

  const collectionId = data?.id || "all";

  /**
   * 0: Today
   * 1: Week
   * 2: Month
   * 3: Year
   */
  const modes = [0, 1, 2, 3];

  return (
    <>
      <View>
        {!breakpoints.md && (
          <ColumnSwitcher
            setCurrentColumn={setSelectedColumn}
            currentColumn={selectedColumn}
          />
        )}
        {breakpoints.md && (
          <View
            style={[
              {
                padding: 20,
                paddingVertical: 10,
                paddingTop: 30,
                backgroundColor: theme[breakpoints.md ? 2 : 3],
              },
              !breakpoints.md && {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              },
            ]}
          >
            {!breakpoints.md && (
              <IconButton
                icon="arrow_back"
                onPress={() =>
                  setSelectedColumn(
                    modes[(selectedColumn - 1 + modes.length) % modes.length]
                  )
                }
              />
            )}
            <View>
              <Text
                style={{
                  color: theme[11],
                  fontSize: large ? 27 : 20,
                  textAlign: "center",
                }}
                weight={900}
              >
                {title}
              </Text>
              <Text
                style={{
                  marginBottom: 10,
                  color: theme[11],
                  opacity: 0.6,
                  textAlign: "center",
                }}
              >
                {dayjs(range[0])
                  .utc()
                  .format("MMM D" + (large ? "o" : ""))}{" "}
                {!large && "-"}{" "}
                {!large && dayjs(range[1]).utc().format("MMM D")}
              </Text>
            </View>
            {!breakpoints.md && (
              <IconButton
                icon="arrow_forward"
                onPress={() =>
                  setSelectedColumn((selectedColumn + 1) % modes.length)
                }
              />
            )}
          </View>
        )}
        <View
          style={{
            padding: 20,
            paddingBottom: 10,
            paddingTop: breakpoints.md ? 5 : undefined,
          }}
        >
          <CreateTask
            mutate={mutations.timeBased.add(mutate)}
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
          marginTop: Platform.OS !== "web" && 50,
          pointerEvents: "none",
        }}
        colors={[
          theme[breakpoints.md ? 2 : 1],
          addHslAlpha(theme[breakpoints.md ? 2 : 1], 0),
        ]}
      />
    </>
  );
}

export const taskSortAlgorithm = (t) =>
  t
    .slice()
    .filter((t) => t && !t.trash)
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
  const [selectedColumn, setSelectedColumn] = useState(0);

  const columnStyles = breakpoints.md
    ? ({
        backgroundColor: theme[2],
        width: 320,
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
      onTaskUpdate={mutations.timeBased.update(mutate)}
    />
  );

  const refreshControl = (
    <RefreshControl refreshing={false} onRefresh={() => mutate()} />
  );

  return breakpoints.md ? (
    <ScrollView
      contentContainerStyle={{
        padding: 15,
        gap: 15,
      }}
      horizontal
      style={{ flex: 1 }}
    >
      <View style={[columnStyles, { width: 370 }]}>
        <Header
          mutate={mutate}
          title="Today"
          large
          range={[data[0].start, data[0].end]}
        />
        <FlashList
          contentContainerStyle={{ padding: 20 }}
          data={taskSortAlgorithm(Object.values(data[0].entities))}
          centerContent={Object.keys(data[0].entities).length === 0}
          ListEmptyComponent={() => <ColumnEmptyComponent />}
          renderItem={renderItem}
          refreshControl={refreshControl}
        />
      </View>
      <View style={columnStyles}>
        <Header
          mutate={mutate}
          title="Week"
          range={[data[1].start, data[1].end]}
        />
        <FlashList
          contentContainerStyle={{ padding: 20 }}
          data={taskSortAlgorithm(Object.values(data[1].entities))}
          centerContent={Object.keys(data[1].entities).length === 0}
          ListEmptyComponent={() => <ColumnEmptyComponent />}
          renderItem={renderItem}
          refreshControl={refreshControl}
        />
      </View>
      <View style={columnStyles}>
        <Header
          mutate={mutate}
          title="Month"
          range={[data[2].start, data[2].end]}
        />
        <FlashList
          contentContainerStyle={{ padding: 20 }}
          data={taskSortAlgorithm(Object.values(data[2].entities))}
          centerContent={Object.keys(data[2].entities).length === 0}
          ListEmptyComponent={() => <ColumnEmptyComponent />}
          renderItem={renderItem}
          refreshControl={refreshControl}
        />
      </View>
      <View style={columnStyles}>
        <Header
          mutate={mutate}
          title="Year"
          range={[data[3].start, data[3].end]}
        />
        <FlashList
          contentContainerStyle={{ padding: 20 }}
          data={taskSortAlgorithm(Object.values(data[3].entities))}
          centerContent={Object.keys(data[3].entities).length === 0}
          ListEmptyComponent={() => <ColumnEmptyComponent />}
          renderItem={renderItem}
          refreshControl={refreshControl}
        />
      </View>
      <View style={{ width: 1 }} />
    </ScrollView>
  ) : (
    <View
      style={[
        columnStyles,
        {
          flex: 1,
        },
      ]}
    >
      <AgendaButtons center />
      <Header
        mutate={mutate}
        selectedColumn={selectedColumn}
        setSelectedColumn={setSelectedColumn}
        title={capitalizeFirstLetter(
          ["Today", "Week", "Month", "Year"][selectedColumn]
        )}
        range={[data[selectedColumn].start, data[selectedColumn].end]}
      />
      <View style={{ flex: 1 }}>
        <FlashList
          contentContainerStyle={{ padding: 20 }}
          data={Object.values(data[selectedColumn].entities)}
          centerContent={
            Object.keys(data[selectedColumn].entities).length === 0
          }
          ListEmptyComponent={() => <ColumnEmptyComponent />}
          renderItem={renderItem}
          refreshControl={refreshControl}
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

  return (
    <SkylineContext.Provider value={agendaContextValue as any}>
      {data ? (
        <View style={{ flex: 1 }}>
          <Content data={data} mutate={mutate} />
        </View>
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

