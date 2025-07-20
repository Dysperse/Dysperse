import { Avatar } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { BottomSheetFlashList, useBottomSheet } from "@gorhom/bottom-sheet";
import * as chrono from "chrono-node";
import dayjs from "dayjs";
import fuzzysort from "fuzzysort";
import React, { cloneElement, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function TaskDateModalContent({ task, updateTask }) {
  const theme = useColorTheme();
  const { forceClose, snapToIndex } = useBottomSheet();

  const active = useSharedValue(0);
  const viewPickerHidden = useSharedValue(0);

  const searchRef = useRef(null);
  const focusedRef = useRef(null);

  const [view, setView] = useState<"DATE" | "RECURRENCE">("DATE");
  const [timeMode, setTimeMode] = useState(false);

  const [search, setSearch] = useState("");

  const selectedDateStyle = useAnimatedStyle(() => ({
    marginTop: withSpring(active.value ? -80 : 0, {
      damping: 20,
      stiffness: 200,
    }),
    marginBottom: 10,
    paddingHorizontal: 20,
    pointerEvents: !active.value ? "auto" : "none",
    opacity: withSpring(!active.value ? 1 : 0, {
      damping: 20,
      stiffness: 200,
    }),
  }));

  const opacityStyle = useAnimatedStyle(() => ({
    opacity: withSpring(!viewPickerHidden.value ? 1 : 0, {
      damping: 20,
      stiffness: 200,
    }),
    transform: [{ scale: withSpring(!viewPickerHidden.value ? 1 : 0.8) }],
    pointerEvents: viewPickerHidden.value ? "none" : "auto",
  }));

  const convertSearchToDate = (search) => {
    if (!search) return [];

    // Try parsing natural language
    const parsedDate = chrono.parse(search);

    if (parsedDate) {
      return parsedDate.map((date) => dayjs(date.start.date()));
    }

    // Fallback to dayjs parsing
    const date = dayjs(search);
    return date.isValid() ? [date] : [];
  };

  const searchDate = convertSearchToDate(search);

  useEffect(() => {
    viewPickerHidden.value = timeMode ? 1 : 0;
  }, [timeMode]);

  const dateList = timeMode
    ? [
        {
          text: "+1",
          primary: "One hour from now",
          secondary: dayjs().add(1, "hour").format("h:mm A"),
          value: dayjs().add(1, "hour"),
        },
        ...[...new Array(24)]
          .map((_, hour) =>
            [...new Array(12)].map((__, slot) => {
              const minutes = slot * 5;
              const time = dayjs(task.start)
                .set("hour", hour)
                .set("minute", minutes);
              return {
                text: time.format("hh"),
                primary: time.format("h:mm a"),
                value: time,
              };
            })
          )
          .flat(),
      ]
    : view === "RECURRENCE"
    ? [
        {
          icon: "view_day",
          primary: "Daily",
          secondary: "Every day",
          value: dayjs().startOf("day"),
        },
        {
          icon: "view_week",
          primary: "Weekly",
          secondary: `On ${dayjs().add(1, "week").format("dddd")}`,
          value: dayjs().startOf("day"),
        },
        {
          icon: "double_arrow",
          primary: "Every other week",
          secondary: `On ${dayjs().add(1, "week").format("dddd")}`,
          value: dayjs().startOf("day"),
        },
        {
          icon: "calendar_view_month",
          primary: "Monthly",
          secondary: `On the ${dayjs().add(1, "month").format("Do")}`,
          value: dayjs().startOf("day"),
        },
        {
          icon: "calendar_month",
          primary: "Yearly",
          secondary: `On ${dayjs().add(1, "year").format("MMMM Do")}`,
          value: dayjs().startOf("day"),
        },
      ]
    : [
        ...(searchDate.length > 0
          ? searchDate.map((date) => ({
              icon: "search",
              primary: date.format("dddd, MMMM Do"),
              secondary: task?.dateOnly
                ? "From search"
                : date.format("[at] h:mm A"),
              value: date,
              search,
            }))
          : []),
        {
          icon: "today",
          primary: "Today",
          secondary: dayjs().format("MMMM Do"),
          value: dayjs().startOf("day"),
        },
        // tomorrow
        {
          text: "+1",
          primary: "Tomorrow",
          secondary: dayjs().add(1, "day").format("MMMM Do"),
          value: dayjs().add(1, "day").startOf("day"),
        },
        // in 3 days
        {
          text: "+3",
          primary: "3 days",
          secondary: dayjs().add(3, "day").format("MMMM Do"),
          value: dayjs().add(3, "day"),
        },
        // end of week
        {
          icon: "next_week",
          primary: dayjs().endOf("week").format("dddd"),
          secondary: dayjs().endOf("week").format("MMMM Do"),
          value: dayjs().endOf("week"),
        },
        // next week
        {
          text: "+7",
          primary: `Next ${dayjs().add(1, "week").format("dddd")}`,
          secondary: dayjs().add(1, "week").format("MMMM Do"),
          value: dayjs().add(1, "week").startOf("day"),
        },
        // next month
        {
          icon: "calendar_month",
          primary: dayjs().add(1, "month").format("dddd, MMMM Do"),
          secondary: dayjs().add(1, "month").format("MMMM Do"),
          value: dayjs().add(1, "month").startOf("day"),
        },
      ]
        .filter((e) => e)
        .filter(
          (item, index, self) =>
            self.findIndex((i) =>
              i?.value && item.value ? i.value.isSame(item.value) : i === item
            ) === index
        );

  const filteredData = fuzzysort
    .go(search, dateList, {
      keys: ["primary", "secondary", "search"],
      all: true,
    })
    .map((result) => result.obj);

  const closeModalIconStyle = useAnimatedStyle(() => ({
    flexDirection: "row",
    width: 100,
    transform: [
      {
        translateX: withSpring(!active.value ? -13 : -63, {
          damping: 20,
          stiffness: 200,
        }),
      },
    ],
  }));

  return (
    <View style={{ height: "100%" }}>
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          padding: 10,
          paddingHorizontal: 20,
        }}
      >
        <IconButton
          size={50}
          style={{ overflow: "hidden" }}
          icon={
            <Animated.View style={closeModalIconStyle}>
              <View
                style={{
                  width: 50,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon>close</Icon>
              </View>
              <View
                style={{
                  width: 50,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon>arrow_back_ios_new</Icon>
              </View>
            </Animated.View>
          }
          variant="filled"
          onPress={() => {
            if (focusedRef.current) {
              searchRef.current?.blur();
            } else {
              forceClose();
            }
          }}
        />
        <Animated.View
          style={[
            opacityStyle,
            {
              borderRadius: 99,
              flexDirection: "row",
              backgroundColor: addHslAlpha(theme[9], 0.05),
              height: 50,
              marginLeft: "auto",
            },
          ]}
        >
          {["Date", "Recurrence"].map((label, idx) => (
            <Button
              large
              bold={view === label.toUpperCase()}
              key={idx}
              backgroundColors={{
                default: addHslAlpha(
                  theme[9],
                  view === label.toUpperCase() ? 0.1 : 0
                ),
                hovered: addHslAlpha(theme[9], 0.2),
                pressed: addHslAlpha(theme[9], 0.3),
              }}
              containerStyle={{ width: label === "Date" ? 80 : 140 }}
              height={"100%"}
              text={label}
              onPress={() => {
                setView(label.toUpperCase() as "DATE" | "RECURRENCE");
                setTimeMode(false);
              }}
            />
          ))}
        </Animated.View>
      </View>
      {(view === "RECURRENCE" && task.recurrenceRule) ||
        (view === "DATE" && task.start && (
          <Animated.View style={selectedDateStyle}>
            <ListItemButton disabled variant="filled">
              <ListItemText
                primary={
                  timeMode && task.dateOnly
                    ? "Select a time"
                    : dayjs(task.start).format(!timeMode ? "dddd" : "h:mm A")
                }
                secondary={dayjs(task.start).format("MMMM Do, YYYY")}
                primaryProps={{
                  style: { color: theme[11], fontSize: 20 },
                  weight: 800,
                }}
                secondaryProps={{
                  style: {
                    color: theme[11],
                    fontSize: 15,
                    marginTop: -5,
                    opacity: 0.5,
                  },
                }}
              />
              <View
                style={{
                  flexDirection: "row-reverse",
                  gap: 5,
                }}
              >
                <Button
                  backgroundColors={{
                    default: theme[4],
                    hovered: theme[5],
                    pressed: theme[6],
                  }}
                  icon={timeMode && !task.dateOnly && "check"}
                  text={
                    timeMode && !task.dateOnly
                      ? undefined
                      : task.dateOnly
                      ? !timeMode
                        ? "Add time"
                        : "Cancel"
                      : dayjs(task.start).format("h:mm A")
                  }
                  onPress={() => setTimeMode(!timeMode)}
                  containerStyle={{ minWidth: 0 }}
                  style={{ paddingHorizontal: 15 }}
                />
                {!timeMode ? (
                  <Button
                    variant="outlined"
                    icon="delete"
                    onPress={() => updateTask({ start: null })}
                    containerStyle={{ minWidth: 0 }}
                    style={{ paddingHorizontal: 15 }}
                  />
                ) : (
                  !task.dateOnly && (
                    <Button
                      variant="outlined"
                      onPress={() => {
                        updateTask({ dateOnly: true });
                      }}
                      text="Clear time"
                    />
                  )
                )}
              </View>
            </ListItemButton>
          </Animated.View>
        ))}
      <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
        <TextField
          bottomSheet
          variant="filled"
          onChangeText={setSearch}
          placeholder={
            timeMode ? "Find a time..." : `Find a ${view.toLowerCase()}...`
          }
          weight={800}
          style={{
            fontSize: 20,
            textAlign: "center",
            height: 50,
            borderRadius: 999,
          }}
          inputRef={searchRef}
          onFocus={() => {
            active.value = 1;
            viewPickerHidden.value = 1;
            focusedRef.current = true;
          }}
          onBlur={() => {
            active.value = 0;
            viewPickerHidden.value = timeMode ? 1 : 0;
            focusedRef.current = false;
            snapToIndex(0);
          }}
        />
      </View>

      <BottomSheetFlashList
        keyboardShouldPersistTaps="handled"
        data={filteredData}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 150,
        }}
        renderItem={({ item }) => {
          return (
            <ListItemButton
              style={{ marginHorizontal: -10 }}
              onPress={() => {
                if (timeMode) {
                  setTimeMode(false);
                  updateTask({
                    dateOnly: false,
                    start: dayjs(task.start)
                      .set("hour", item.value.hour())
                      .set("minute", item.value.minute())
                      .toDate(),
                  });
                } else {
                  forceClose();
                  updateTask({
                    start: item.value.toDate(),
                  });
                }
              }}
            >
              <Avatar
                disabled
                icon={typeof item.icon === "string" ? item.icon : undefined}
                size={45}
                iconProps={{
                  style: {
                    color: theme[8],
                  },
                }}
                style={{
                  borderRadius: 17,
                  backgroundColor: addHslAlpha(theme[9], 0.1),
                }}
              >
                {typeof item.text === "string" && (
                  <Text
                    style={{
                      color: theme[8],
                    }}
                  >
                    {item.text}
                  </Text>
                )}
              </Avatar>
              <ListItemText primary={item.primary} secondary={item.secondary} />
            </ListItemButton>
          );
        }}
      />
    </View>
  );
}

export function TaskDateModal({ children, task, updateTask }) {
  const sheetRef = useRef(null);
  const insets = useSafeAreaInsets();

  const trigger = cloneElement(children, {
    onPress: () => sheetRef.current?.present(),
  });

  return (
    <>
      {trigger}
      <BottomSheet
        snapPoints={["70%"]}
        containerStyle={{
          marginTop: 40 + insets.top,
        }}
        sheetRef={sheetRef}
      >
        <TaskDateModalContent task={task} updateTask={updateTask} />
      </BottomSheet>
    </>
  );
}
