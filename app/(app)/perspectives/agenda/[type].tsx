import { useUser } from "@/context/useUser";
import { BottomSheetBackHandler } from "@/ui/BottomSheet/BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "@/ui/BottomSheet/BottomSheetBackdropComponent";
import Text from "@/ui/Text";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  WINDOW_WIDTH,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import dayjs, { OpUnitType } from "dayjs";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import {
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  Platform,
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
    <TaskDrawer id={task.id}>
      <Pressable className="px-5 py-3 rounded-2xl active:bg-gray-200 hover:bg-gray-100 mb-0.5">
        <Text>{task.name}</Text>
      </Pressable>
    </TaskDrawer>
  );
}

function TaskDrawerContent({ data }) {
  return (
    <BottomSheetScrollView>
      <Text>{JSON.stringify(data, null, 2)}</Text>
    </BottomSheetScrollView>
  );
}

function TaskDrawer({ children, id }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<BottomSheetModal>(null);

  // callbacks
  const handleOpen = useCallback(() => {
    ref.current?.present();
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    ref.current?.close();
  }, []);

  const trigger = cloneElement(children, { onPress: handleOpen });

  // Fetch data
  const { data, error } = useSWR(["space/tasks/task", { id }]);

  return (
    <>
      {trigger}
      <BottomSheetModal
        ref={ref}
        snapPoints={["50%", "80%"]}
        backdropComponent={BottomSheetBackdropComponent}
      >
        <BottomSheetBackHandler handleClose={handleClose} />
        {data ? <TaskDrawerContent data={data} /> : <ActivityIndicator />}
      </BottomSheetModal>
    </>
  );
}

function Column({ column }) {
  return (
    <View
      style={{ width: Platform.OS === "web" ? 300 : WINDOW_WIDTH }}
      className={Platform.OS == "web" ? "border-r border-gray-200" : undefined}
    >
      <Header start={column.start} end={column.end} />
      <FlatList
        data={column.tasks}
        contentContainerStyle={{
          padding: 10,
        }}
        renderItem={({ item }) => <Task task={item} />}
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

  const [currentColumn, setCurrentColumn] = useState(null);

  useEffect(() => {
    if (data?.length > 1)
      setCurrentColumn(
        data.find((i) => dayjs().utc().isBetween(dayjs(i.start), dayjs(i.end)))
      );
  }, [data, setCurrentColumn]);

  if (Platform.OS === "web") {
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

  return (
    <>
      {data ? (
        <View>
          <FlatList
            horizontal
            data={data}
            contentContainerStyle={{
              gap: 15,
              paddingBottom: 15,
              paddingHorizontal: 15,
            }}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                className={`
              h-16 w-16 flex items-center active:bg-gray-200 border-2 border-gray-100 active:border-gray-200 rounded-2xl items-center justify-center
              ${
                item?.start === currentColumn?.start
                  ? "bg-gray-200 border-gray-200 active:bg-gray-300 active:border-gray-300"
                  : ""
              }
              `}
                onPress={() => setCurrentColumn(item)}
              >
                <Text
                  textClassName="uppercase text-xs opacity-60"
                  style={{ fontFamily: "body_400" }}
                >
                  {dayjs(item.start).format("ddd")}
                </Text>
                <Text
                  textClassName="text-xl"
                  style={{ fontFamily: "body_500" }}
                >
                  {dayjs(item.start).format("DD")}
                </Text>
              </Pressable>
            )}
            keyExtractor={(i) => i.start}
          />
          {currentColumn && <Column column={currentColumn} />}
        </View>
      ) : (
        <ActivityIndicator />
      )}
    </>
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
