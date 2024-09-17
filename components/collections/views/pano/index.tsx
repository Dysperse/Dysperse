import CreateTask from "@/components/task/create";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { useLocalSearchParams } from "expo-router";
import { createContext, useContext, useMemo } from "react";
import { View, ViewStyle } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { useCollectionContext } from "../../context";
import { ColumnEmptyComponent } from "../../emptyComponent";
import { Entity } from "../../entity";

const PanoContext = createContext(null);
const usePanoContext = () => useContext(PanoContext);

function Header({ title, large = false, range }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View style={{ padding: 20, paddingBottom: 0 }}>
      <Text
        style={{
          fontSize: large ? 35 : 25,
          color: theme[11],
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
        }}
      >
        {dayjs(range[0])
          .utc()
          .format("MMM D" + (large ? "o" : ""))}{" "}
        {!large && "-"} {!large && dayjs(range[1]).utc().format("MMM D")}
      </Text>

      <CreateTask mutate={(n) => {}} defaultValues={{ date: dayjs() }}>
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
  );
}

function Content({ data, mutate }) {
  const theme = useColorTheme();
  const columnStyles = {
    backgroundColor: theme[2],
    width: 300,
    borderWidth: 1,
    borderColor: theme[5],
    borderRadius: 25,
  } as ViewStyle;

  const renderItem = ({ item }) => (
    <Entity
      isReadOnly={false}
      showDate
      showLabel
      item={item}
      onTaskUpdate={(newTask) => {
        if (!newTask) return;
        mutate((oldData) => {}, { revalidate: false });
      }}
    />
  );

  return (
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
        <Header title="Today" large range={data.today.filterRange} />
        <FlashList
          contentContainerStyle={{ padding: 20 }}
          data={data.today.entities}
          centerContent={data.today.entities.length === 0}
          ListEmptyComponent={() => <ColumnEmptyComponent />}
          renderItem={renderItem}
        />
      </View>
      <View style={columnStyles}>
        <Header title="Week" range={data.week.filterRange} />
        <FlashList
          contentContainerStyle={{ padding: 20 }}
          data={data.week.entities}
          centerContent={data.week.entities.length === 0}
          ListEmptyComponent={() => <ColumnEmptyComponent />}
          renderItem={renderItem}
        />
      </View>
      <View style={columnStyles}>
        <Header title="Month" range={data.month.filterRange} />
        <FlashList
          contentContainerStyle={{ padding: 20 }}
          data={data.month.entities}
          centerContent={data.month.entities.length === 0}
          ListEmptyComponent={() => <ColumnEmptyComponent />}
          renderItem={renderItem}
        />
      </View>
      <View style={columnStyles}>
        <Header title="Year" range={data.year.filterRange} />
        <FlashList
          contentContainerStyle={{ padding: 20 }}
          data={data.year.entities}
          centerContent={data.year.entities.length === 0}
          ListEmptyComponent={() => <ColumnEmptyComponent />}
          renderItem={renderItem}
        />
      </View>
      <View style={{ width: 1 }} />
    </ScrollView>
  );
}

export default function Pano() {
  // eslint-disable-next-line prefer-const
  let { start, id } = useLocalSearchParams();
  const { isPublic } = useCollectionContext();
  if (!start) start = dayjs().startOf("day").toISOString();

  const agendaContextValue = useMemo(
    () => ({ id, start: dayjs(start as string) }),
    [start, id]
  );

  const { data, error, mutate } = useSWR([
    "space/collections/collection/pano",
    {
      start: agendaContextValue.start.utc().toISOString(),
      id: agendaContextValue.id,
      isPublic: isPublic ? "true" : "false",
      timezone: dayjs.tz.guess(),
      ...(agendaContextValue.id === "all" && { all: true }),
    },
  ]);

  return (
    <PanoContext.Provider value={agendaContextValue as any}>
      {data ? (
        <Content data={data} mutate={mutate} />
      ) : error ? (
        <ErrorAlert />
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Spinner />
        </View>
      )}
    </PanoContext.Provider>
  );
}
