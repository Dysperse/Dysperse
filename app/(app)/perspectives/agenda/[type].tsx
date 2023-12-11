import Text from "@/ui/Text";
import dayjs, { OpUnitType } from "dayjs";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { createContext, useContext } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  Pressable,
  StatusBar,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";

const AgendaContext = createContext({
  type: "week",
  start: dayjs().utc().startOf("week"),
  end: dayjs().utc().endOf("week"),
});
export const useAgendaContext = () => useContext(AgendaContext);

function Header({ start, end }) {
  const { type } = useAgendaContext();
  const isToday = dayjs().isBetween(start, end);

  const formats = {
    heading: {
      week: "DD",
      month: "#W",
      year: "MMMM",
    }[type],
    subheading: {
      week: "dddd",
      month: "D",
      year: "-",
    }[type],
  };

  return (
    <View
      className="flex-row items-center justify-center border-b border-gray-200 p-5"
      style={{ gap: 20 }}
    >
      <View
        className={`w-9 h-9 ${
          isToday ? "bg-gray-700" : "bg-gray-200"
        } rounded-lg items-center justify-center`}
      >
        <Text
          textClassName={`text-xl ${isToday ? "text-white" : "text-black"}`}
          textStyle={{ fontFamily: "body_700" }}
        >
          {dayjs(start).format(formats.heading)}
        </Text>
      </View>
      <Text textClassName="text-xl" textStyle={{ fontFamily: "body_600" }}>
        {dayjs(start).format(formats.subheading)}
      </Text>
    </View>
  );
}

function Task({ task }) {
  return (
    <Pressable className="px-5 py-3 rounded-2xl active:bg-gray-200 hover:bg-gray-100 mb-0.5">
      <Text>{task.name}</Text>
    </Pressable>
  );
}

function Column({ column }) {
  return (
    <View style={{ width: 300 }} className="border-r border-gray-200">
      <Header start={column.start} end={column.end} />
      <FlatList
        data={column.tasks}
        contentContainerStyle={{
          padding: 10,
        }}
        renderItem={({ item }) => <Task task={item} key={item.id} />}
      />
    </View>
  );
}

function Agenda() {
  const { type, start, end } = useAgendaContext();
  const { data, error } = useSWR([
    "space/tasks/perspectives",
    {
      start: start.toISOString(),
      end: end.toISOString(),
      type,
    },
  ]);

  return (
    <ScrollView horizontal contentContainerStyle={{ flexDirection: "row" }}>
      {data ? (
        data.map((col) => <Column key={col.start} column={col} />)
      ) : (
        <ActivityIndicator />
      )}
    </ScrollView>
  );
}

export default function Page() {
  // Note: Everything must be AS performant as POSSIBLE!!!
  const { type, start } = useLocalSearchParams();

  return (
    <AgendaContext.Provider
      value={{
        type: type as string,
        start: dayjs(start as string).startOf(type as OpUnitType),
        end: dayjs(start as string).endOf(type as OpUnitType),
      }}
    >
      <StatusBar barStyle="dark-content" />
      <Agenda />
    </AgendaContext.Provider>
  );
}
