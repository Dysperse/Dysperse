import { useSession } from "@/context/AuthProvider";
import { useOpenTab } from "@/context/tabs";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import { BottomSheetBackHandler } from "@/ui/BottomSheet/BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "@/ui/BottomSheet/BottomSheetBackdropComponent";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import Text, { DTextProps } from "@/ui/Text";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  WINDOW_WIDTH,
} from "@gorhom/bottom-sheet";
import dayjs, { ManipulateType, OpUnitType } from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, {
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
  FlatList,
  Pressable,
  StatusBar,
  StyleProp,
  TextInputProps,
  View,
} from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
      month: "[#]W",
      year: "MMMM",
    }[type],
    subheading: {
      week: "dddd",
      month: "Do",
      year: "-",
    }[type],
  };

  return (
    <View
      className="flex-row items-center justify-center border-b border-gray-200 p-5"
      style={{ gap: 20 }}
    >
      <View
        className={`min-w-9 px-3 h-9 ${
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
        {type === "month" && <> - {dayjs(end).format(formats.subheading)}</>}
      </Text>
    </View>
  );
}

function TaskCheckbox({ completed }: { completed: boolean }) {
  return (
    <Pressable className="w-7 h-7 border-2 border-gray-400 active:bg-gray-100 rounded-full"></Pressable>
  );
}

function Task({ task }) {
  return (
    <TaskDrawer id={task.id}>
      <Pressable
        className={`px-5 py-3 ${
          WINDOW_WIDTH > 600 ? "rounded-2xl" : ""
        } hover:bg-gray-100 active:bg-gray-200 mb-0.5 flex-row items-center`}
        style={{ gap: 15 }}
      >
        <TaskCheckbox completed={task.completionInstances.length > 0} />
        <Text>{task.name}</Text>
      </Pressable>
    </TaskDrawer>
  );
}

interface ChipProps {
  icon?: React.ReactNode;
  label?: String | React.ReactNode;
}

function Chip({ icon, label }: ChipProps) {
  return (
    <Pressable className="flex-row items-center bg-gray-200 active:bg-gray-300 py-1 px-3 rounded-full">
      {icon}
      {typeof label === "string" ? <Text>{label}</Text> : label}
    </Pressable>
  );
}

function ListItemText(props: DTextProps) {
  return <Text {...props} />;
}

interface DTextAreaProps extends TextInputProps {
  inputClassName?: string;
  fontSize?: number;
  inputStyle?: StyleProp<any>;
  inputDefaultValue?: string;
}

function AutoSizeTextArea(props: DTextAreaProps) {
  const [size, setSize] = useState(props.fontSize || 15);
  return (
    <TextInput
      {...props}
      defaultValue={props.inputDefaultValue}
      multiline
      className={`border border-transparent ${props.inputClassName}`}
      style={{
        ...props.inputStyle,
        height: size,
        overflow: "hidden",
        fontSize: props.fontSize || 15,
      }}
      onContentSizeChange={(e) => setSize(e.nativeEvent.contentSize.height)}
    />
  );
}

function TaskDrawerContent({ data, handleClose }) {
  return (
    <BottomSheetScrollView stickyHeaderIndices={[0]}>
      <View
        className="flex-row bg-white"
        style={{ paddingHorizontal: 20, height: 75, paddingVertical: 10 }}
      >
        <IconButton className="bg-gray-200" onPress={handleClose}>
          <Icon>close</Icon>
        </IconButton>
        <View className="flex-1" />
        <IconButton>
          <Icon>dark_mode</Icon>
        </IconButton>
        <IconButton
          className="bg-gray-200 flex-row px-3 ml-1.5"
          style={{ width: "auto", gap: 5 }}
        >
          <Icon>check</Icon>
          <Text>Complete</Text>
        </IconButton>
      </View>
      <View style={{ paddingBottom: 20, paddingHorizontal: 20 }}>
        <View
          className="flex-row"
          style={{ gap: 10, marginVertical: 10, marginTop: 15 }}
        >
          <Chip icon={<Icon filled={data.pinned}>push_pin</Icon>} />
          <Chip icon={<Icon>label</Icon>} />
          <Chip label={dayjs(data.due).format("DD/MM/YYYY")} />
        </View>
        <AutoSizeTextArea
          inputDefaultValue={data.name}
          inputClassName="text-5xl uppercase"
          inputStyle={{
            fontFamily: "heading",
          }}
          fontSize={50}
        />
        <Text
          textClassName="uppercase text-sm text-gray-700 mt-3 mb-1 opacity-60"
          weight={700}
        >
          Note
        </Text>
        <TextInput
          placeholder="Coming soon..."
          value=""
          className="opacity-60"
          style={{ fontFamily: "body_300" }}
        />

        <Text
          textClassName="uppercase text-sm text-gray-700 mt-3 mb-1 opacity-60"
          weight={700}
        >
          Attachments
        </Text>
        <View className="bg-gray-100 rounded-2xl">
          {data.where && (
            <ListItemButton
              className="flex-row"
              style={{ gap: 10, paddingRight: 0, paddingVertical: 0 }}
            >
              <Avatar size={30}>
                <Icon>link</Icon>
              </Avatar>
              <TextInput
                value={data.where}
                style={{
                  fontFamily: "body_600",
                  width: "100%",
                  paddingVertical: 10,
                }}
              />
            </ListItemButton>
          )}
          <ListItemButton buttonClassName="justify-center py-3 bg-gray-200 active:bg-gray-300">
            <Icon>add</Icon>
            <ListItemText>New</ListItemText>
          </ListItemButton>
        </View>

        {data.image && (
          <View className="flex-row">
            <Avatar>
              <Icon>image</Icon>
            </Avatar>
            <TextInput value={data.image} style={{ fontFamily: "body_600" }} />
          </View>
        )}

        <Text
          textClassName="uppercase text-sm text-gray-700 mt-3 mb-1 opacity-60"
          weight={700}
        >
          About
        </Text>
        <View className="bg-gray-100 rounded-2xl">
          <ListItemButton>
            <ProfilePicture
              size={30}
              name={data.createdBy.name}
              image={data.createdBy.Profile.picture}
            />
            <ListItemText>Created by {data.createdBy.name}</ListItemText>
          </ListItemButton>
          <ListItemButton>
            <Avatar size={30}>
              <Icon>workspaces</Icon>
            </Avatar>
            <ListItemText>Found in "{data.property.name}"</ListItemText>
          </ListItemButton>
          <ListItemButton>
            <Avatar size={30}>
              <Icon>access_time</Icon>
            </Avatar>
            <ListItemText>
              Edited {dayjs(data.lastUpdated).fromNow()}
            </ListItemText>
          </ListItemButton>
        </View>

        <View className="bg-gray-100 rounded-2xl mt-5">
          <ListItemButton buttonClassName="justify-center py-4">
            <ListItemText>Delete task</ListItemText>
          </ListItemButton>
        </View>
      </View>
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
        {data ? (
          <TaskDrawerContent data={data} handleClose={handleClose} />
        ) : (
          <ActivityIndicator />
        )}
      </BottomSheetModal>
    </>
  );
}

function Column({ header, column }) {
  return (
    <View
      style={{ width: WINDOW_WIDTH > 600 ? 300 : WINDOW_WIDTH }}
      className={WINDOW_WIDTH > 600 ? "border-r border-gray-200" : undefined}
    >
      {WINDOW_WIDTH > 600 && <Header start={column.start} end={column.end} />}
      <FlatList
        ListHeaderComponent={header}
        data={column.tasks}
        contentContainerStyle={{
          padding: WINDOW_WIDTH > 600 ? 10 : 0,
          paddingTop: WINDOW_WIDTH > 600 ? 10 : 0,
        }}
        renderItem={({ item }) => <Task task={item} />}
        keyExtractor={(i) => `${i.id}-${Math.random()}`}
      />
    </View>
  );
}

function PerspectivesNavbar({ handleToday, currentDateStart, currentDateEnd }) {
  const { start, type } = useAgendaContext();

  const titleFormat = {
    week: "[W]W • MMMM",
    month: "YYYY",
    year: "YYYY",
  }[type];

  const isCurrent = dayjs().isBetween(
    currentDateStart,
    currentDateEnd,
    "day",
    "[]"
  );

  const { session: sessionToken } = useSession();
  const { mutate, session } = useUser();
  const { activeTab } = useOpenTab();

  const handlePrev = useCallback(() => {
    const tab = session?.user?.tabs?.find((i) => i.id === activeTab);

    const href = `/perspectives/agenda/${type}/${dayjs(start)
      .subtract(1, type as ManipulateType)
      .format("YYYY-MM-DD")}`;

    if (tab) {
      sendApiRequest(sessionToken, "PUT", "user/tabs", {
        id: tab.id,
        tabData: JSON.stringify({
          ...tab.tabData,
          href: href,
        }),
      }).then(() => mutate());
    }
    // Change the tab
    router.push(href);
  }, [
    router,
    type,
    start,
    sessionToken,
    mutate,
    activeTab,
    session,
    activeTab,
  ]);

  const handleNext = useCallback(() => {
    const tab = session?.user?.tabs?.find((i) => i.id === activeTab);

    const href = `/perspectives/agenda/${type}/${dayjs(start)
      .add(1, type as ManipulateType)
      .format("YYYY-MM-DD")}`;

    if (tab) {
      sendApiRequest(sessionToken, "PUT", "user/tabs", {
        id: tab.id,
        tabData: JSON.stringify({
          ...tab.tabData,
          href: href,
        }),
      }).then(() => mutate());
    }

    router.push(href);
  }, [
    router,
    type,
    start,
    sessionToken,
    mutate,
    activeTab,
    session,
    activeTab,
  ]);
  const insets = useSafeAreaInsets();

  return (
    <View className="p-4 pb-0" style={{ marginTop: insets.top, height: 80 }}>
      <View
        className="flex-row items-center bg-gray-100 p-2 py-3 rounded-full"
        style={{ height: "100%" }}
      >
        <Text textClassName="ml-2 mr-auto" numberOfLines={1}>
          {dayjs(start).format(titleFormat)}
        </Text>
        {!isCurrent && (
          <Pressable
            className="flex h-full justify-center active:bg-gray-200 px-2 rounded-2xl"
            onPress={handleToday}
          >
            <Icon textClassName="font-gray-600">calendar_today</Icon>
          </Pressable>
        )}
        <Pressable
          onPress={handlePrev}
          className="flex h-full justify-center active:bg-gray-200 px-2 rounded-2xl"
        >
          <Icon textClassName="font-gray-600">arrow_back_ios_new</Icon>
        </Pressable>
        <Pressable
          onPress={handleNext}
          className="flex h-full justify-center active:bg-gray-200 px-2 rounded-2xl"
        >
          <Icon textClassName="font-gray-600">arrow_forward_ios</Icon>
        </Pressable>
      </View>
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
        data.find((i) =>
          dayjs().utc().isBetween(dayjs(i.start), dayjs(i.end))
        ) || data[0]
      );
  }, [data, setCurrentColumn]);

  const handleToday = useCallback(() => {
    if (data?.length > 1) {
      const c = data.find((i) =>
        dayjs().utc().isBetween(dayjs(i.start), dayjs(i.end))
      );
      if (c) setCurrentColumn(c);
      else
        router.push(
          `/perspectives/agenda/${type}/${dayjs().format("YYYY-MM-DD")}`
        );
    }
  }, [data, setCurrentColumn, router, type]);

  if (WINDOW_WIDTH > 600) {
    return (
      <ScrollView horizontal contentContainerStyle={{ flexDirection: "row" }}>
        {data ? (
          data.map((col) => (
            <Column header={() => {}} key={col.start} column={col} />
          ))
        ) : (
          <ActivityIndicator />
        )}
      </ScrollView>
    );
  }

  return (
    <>
      <PerspectivesNavbar
        handleToday={handleToday}
        currentDateStart={currentColumn?.start}
        currentDateEnd={currentColumn?.end}
      />
      {data ? (
        <View>
          {currentColumn && (
            <Column
              column={currentColumn}
              header={
                <FlatList
                  horizontal
                  data={data}
                  contentContainerStyle={{
                    gap: 15,
                    paddingVertical: 20,
                    paddingHorizontal: 20,
                  }}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <Pressable
                      className={`
              h-16 w-16 flex active:bg-gray-200 border-2 border-gray-100 active:border-gray-200 rounded-2xl items-center justify-center
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
                  keyExtractor={(i) => `${i.start}-${i.end}`}
                />
              }
            />
          )}
        </View>
      ) : (
        <ActivityIndicator />
      )}
    </>
  );
}

export default function Page() {
  const { type, start } = useLocalSearchParams();

  return (
    <AgendaContext.Provider
      value={{
        type: type as string,
        start: dayjs(start as string).startOf(type as OpUnitType),
        end: dayjs(start as string)
          .startOf(type as OpUnitType)
          .add(1, type as ManipulateType),
      }}
    >
      <StatusBar barStyle="dark-content" />
      <Agenda />
    </AgendaContext.Provider>
  );
}
