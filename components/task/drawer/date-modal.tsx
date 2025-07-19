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
import React, { cloneElement, useRef, useState } from "react";
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
  const searchRef = useRef(null);
  const focusedRef = useRef(null);

  const [view, setView] = useState<"DATE" | "TIME">("DATE");
  const [search, setSearch] = useState("");

  const selectedDateStyle = useAnimatedStyle(() => ({
    marginTop: withSpring(active.value ? -80 : 0, {
      damping: 20,
      stiffness: 200,
    }),
    marginBottom: 10,
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

  const dateList =
    view === "TIME"
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
        <TextField
          bottomSheet
          variant="filled"
          onChangeText={setSearch}
          placeholder={view === "DATE" ? "Find a date..." : "Find a time..."}
          weight={800}
          style={{
            fontSize: 20,
            textAlign: "center",
            height: 50,
            borderRadius: 999,
            flex: 1,
          }}
          inputRef={searchRef}
          onFocus={() => {
            active.value = 1;
            focusedRef.current = true;
          }}
          onBlur={() => {
            active.value = 0;
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
        ListHeaderComponent={() =>
          task.start && (
            <Animated.View style={selectedDateStyle}>
              <ListItemButton
                disabled
                variant="filled"
                backgroundColors={{
                  default: addHslAlpha(theme[9], 0.05),
                  hover: addHslAlpha(theme[9], 0.1),
                  active: addHslAlpha(theme[9], 0.2),
                }}
              >
                <ListItemText
                  primary={
                    view === "TIME" && task.dateOnly
                      ? "Select a time"
                      : dayjs(task.start).format(
                          view === "DATE" ? "dddd" : "h:mm A"
                        )
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
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Button
                    backgroundColors={{
                      default: theme[4],
                      hovered: theme[5],
                      pressed: theme[6],
                    }}
                    text={
                      view === "DATE"
                        ? task.dateOnly
                          ? "Set a time"
                          : dayjs(task.start).format("h:mm A")
                        : "Done"
                    }
                    onPress={() => setView(view === "DATE" ? "TIME" : "DATE")}
                    containerStyle={{ paddingHorizontal: 7 }}
                  />
                  {view === "DATE" ? (
                    <Button
                      backgroundColors={{
                        default: theme[4],
                        hovered: theme[5],
                        pressed: theme[6],
                      }}
                      icon="delete"
                      onPress={() => {
                        updateTask({ start: null });
                      }}
                    />
                  ) : (
                    !task.dateOnly && (
                      <Button
                        backgroundColors={{
                          default: theme[4],
                          hovered: theme[5],
                          pressed: theme[6],
                        }}
                        onPress={() => {
                          updateTask({
                            dateOnly: true,
                          });
                        }}
                        text="Clear"
                      />
                    )
                  )}
                </View>
              </ListItemButton>
            </Animated.View>
          )
        }
        renderItem={({ item }) => {
          return (
            <ListItemButton
              style={{ marginHorizontal: -10 }}
              onPress={() => {
                if (view === "DATE") {
                  updateTask({
                    start: item.value.toDate(),
                  });
                } else {
                  updateTask({
                    dateOnly: false,
                    start: dayjs(task.start)
                      .set("hour", item.value.hour())
                      .set("minute", item.value.minute())
                      .toDate(),
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
