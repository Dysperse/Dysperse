import { useUser } from "@/context/useUser";
import { Avatar } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import { RecurrencePicker } from "@/ui/RecurrencePicker";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetFlashList, useBottomSheet } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as chrono from "chrono-node";
import dayjs, { Dayjs } from "dayjs";
import fuzzysort from "fuzzysort";
import React, {
  cloneElement,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Keyboard, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RRule } from "rrule";

const formatDateRelativity = (t: Dayjs) =>
  t.isToday()
    ? "Today"
    : t.isYesterday()
    ? "Yesterday"
    : t.isTomorrow()
    ? "Tomorrow"
    : t.fromNow();

function TaskDateModalContent({ task, updateTask }) {
  const theme = useColorTheme();
  const { forceClose, snapToIndex } = useBottomSheet();

  const active = useSharedValue(0);
  const viewPickerHidden = useSharedValue(0);
  const { session } = useUser();

  const searchRef = useRef(null);
  const recurrenceRef = useRef(null);
  const focusedRef = useRef(null);

  const [view, setView] = useState<"DATE" | "RECURRENCE">(
    task.recurrenceRule ? "RECURRENCE" : "DATE"
  );
  const [timeMode, setTimeMode] = useState(false);
  const [search, setSearch] = useState("");

  const [lastUsedDate, setLastUsedDate] = useState(null);
  const [lastUsedTime, setLastUsedTime] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem("lastUsedDate").then((date) => {
      if (date) {
        const parsedDate = dayjs(date);
        if (parsedDate.isValid()) {
          setLastUsedDate(parsedDate);
        }
      }
    });
    AsyncStorage.getItem("lastUsedTime").then((time) => {
      if (time) {
        const parsedTime = dayjs(time);
        if (parsedTime.isValid()) {
          setLastUsedTime(parsedTime);
        }
      }
    });
  }, [task]);

  const hasRecurrence = view === "RECURRENCE" && task.recurrenceRule;

  const selectedDateStyle = useAnimatedStyle(() => ({
    marginBottom: withSpring(active.value ? -70 : 10, {
      damping: 20,
      stiffness: 200,
    }),
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

    // if search is just a number, treat it as a day offset
    const dayOffset = parseInt(search, 10);
    if (!isNaN(dayOffset)) {
      return [
        {
          date: dayjs().set("date", dayOffset),
          secondary: formatDateRelativity(dayjs().set("date", dayOffset)),
        },
        {
          text: `+${dayOffset}`,
          date: dayjs().add(dayOffset, "day"),
          secondary: `${dayOffset} day${dayOffset === 1 ? "" : "s"} from now`,
        },
      ];
    }

    // Try parsing natural language
    const parsedDate = chrono.parse(search);

    if (parsedDate) {
      return parsedDate.map((date) => ({ date: dayjs(date.start.date()) }));
    }

    // Fallback to dayjs parsing
    const date = dayjs(search);
    return date.isValid() ? [date] : [];
  };

  const searchDate = convertSearchToDate(timeMode ? `at ${search}` : search);

  useEffect(() => {
    viewPickerHidden.value = timeMode ? 1 : 0;
  }, [timeMode]);

  const dateList: any = timeMode
    ? [
        ...(searchDate.length > 0
          ? searchDate.map((item) => ({
              text: item.text,
              icon: item.text ? undefined : "search",
              primary: item.date.format(
                session.user.militaryTime ? "H:mm" : "h:mm A"
              ),
              secondary: "From search",
              value: item.date,
              search,
            }))
          : []),
        lastUsedTime && {
          icon: "history",
          primary: "Last used time",
          secondary: lastUsedTime.format(
            session.user.militaryTime ? "H:mm" : "h:mm A"
          ),
          value: dayjs(view === "DATE" ? task.start : new Date())
            .set("hour", lastUsedTime.hour())
            .set("minute", lastUsedTime.minute()),
        },
        {
          text: "+1",
          primary: "One hour from now",
          secondary: dayjs()
            .add(1, "hour")
            .format(session.user.militaryTime ? "H:mm" : "h:mm A"),
          value: dayjs().add(1, "hour"),
        },
        ...[...new Array(24)]
          .map((_, hour) =>
            [...new Array(12)].map((__, slot) => {
              const minutes = slot * 5;
              const time = dayjs(view === "DATE" ? task.start : new Date())
                .set("hour", hour)
                .set("minute", minutes);
              return {
                text: time.format("hh"),
                primary: time.format(
                  session.user.militaryTime ? "H:mm" : "h:mm A"
                ),
                value: time,
              };
            })
          )
          .flat(),
      ].filter((e) => e)
    : view === "RECURRENCE"
    ? [
        {
          icon: "pan_tool",
          primary: "Select from picker",
          secondary: "Advanced recurrence options",
          recurrencePicker: true,
        },
        {
          icon: "view_day",
          primary: "Daily",
          secondary: "Every day",
          value: new RRule({
            freq: RRule.DAILY,
            dtstart: dayjs().startOf("day").toDate(),
            interval: 1,
          }).options,
        },
        {
          icon: "view_week",
          primary: "Weekly",
          secondary: `On ${dayjs().add(1, "week").format("dddd")}`,
          value: new RRule({
            freq: RRule.WEEKLY,
            dtstart: dayjs().startOf("day").toDate(),
            interval: 1,
            byweekday: [
              RRule[dayjs().format("dddd").substring(0, 2).toUpperCase()],
            ],
          }).options,
        },
        {
          icon: "double_arrow",
          primary: "Every other week",
          secondary: `On ${dayjs().add(1, "week").format("dddd")}`,
          value: new RRule({
            freq: RRule.WEEKLY,
            dtstart: dayjs().startOf("day").toDate(),
            interval: 2,
            byweekday: [
              RRule[dayjs().format("dddd").substring(0, 2).toUpperCase()],
            ],
          }).options,
        },
        {
          icon: "calendar_view_month",
          primary: "Monthly",
          secondary: `On the ${dayjs().add(1, "month").format("Do")}`,
          value: new RRule({
            freq: RRule.MONTHLY,
            dtstart: dayjs().startOf("day").toDate(),
            interval: 1,
            bymonthday: dayjs().add(1, "month").date(),
          }).options,
        },
        {
          icon: "calendar_month",
          primary: "Yearly",
          secondary: `On ${dayjs().add(1, "year").format("MMMM Do")}`,
          value: new RRule({
            freq: RRule.YEARLY,
            dtstart: dayjs().startOf("day").toDate(),
            interval: 1,
            bymonth: dayjs().add(1, "year").month() + 1, // RRule months are 1-indexed
            bymonthday: dayjs().add(1, "year").date(),
          }).options,
        },
      ]
    : [
        ...(searchDate.length > 0
          ? searchDate.map((item) => ({
              text: item.text,
              icon: item.text ? undefined : "search",
              primary: item.date.format("dddd, MMMM Do"),
              secondary:
                item.secondary ||
                (task?.dateOnly
                  ? "From search"
                  : item.date.format(
                      session.user.militaryTime ? "[at] H:mm" : "[at] h:mm A"
                    )),
              value: item.date,
              search,
            }))
          : []),
        dayjs(lastUsedDate).isValid() && {
          icon: "history",
          primary: "Last used date",
          secondary: `${lastUsedDate.format(
            "dddd, MMMM Do"
          )} • ${formatDateRelativity(lastUsedDate)}`,
          value: lastUsedDate,
        },
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
              height={"100%" as any}
              text={label}
              onPress={() => {
                setView(label.toUpperCase() as "DATE" | "RECURRENCE");
                setTimeMode(false);
              }}
            />
          ))}
        </Animated.View>
      </View>
      {view === "RECURRENCE" && (
        <View
          style={{
            padding: 20,
            backgroundColor: addHslAlpha(theme[9], 0.05),
            borderRadius: 20,
            marginHorizontal: 20,
            marginBottom: 10,
          }}
        >
          <Text weight={700} style={{ color: theme[11] }}>
            Heads up! This feature is still in beta and may not work as
            expected.
          </Text>
        </View>
      )}
      {(hasRecurrence || (view === "DATE" && task.start)) && (
        <Animated.View style={selectedDateStyle}>
          <ListItemButton disabled variant="filled">
            <ListItemText
              primary={
                timeMode && task.dateOnly
                  ? "Select a time"
                  : hasRecurrence
                  ? capitalizeFirstLetter(
                      new RRule(task.recurrenceRule)
                        ?.toText()
                        .replace("every day", "Daily")
                        .replace("every week", "Weekly")
                        .replace("every month", "Monthly")
                        .replace("every year", "Yearly")
                        .split("at")?.[0]
                    )
                  : dayjs(task.start).format(
                      !timeMode
                        ? "dddd"
                        : session.user.militaryTime
                        ? "H:mm"
                        : "h:mm A"
                    )
              }
              secondary={
                hasRecurrence
                  ? undefined
                  : dayjs(task.start).format("MMMM Do, YYYY")
              }
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
                    : view === "RECURRENCE"
                    ? dayjs(
                        new RRule(task.recurrenceRule).options.dtstart
                      ).format(session.user.militaryTime ? "H:mm" : "h:mm A")
                    : dayjs(task.start).format(
                        session.user.militaryTime ? "H:mm" : "h:mm A"
                      )
                }
                onPress={() => setTimeMode(!timeMode)}
                containerStyle={{ minWidth: 0 }}
                style={{ paddingHorizontal: 15 }}
              />
              {!timeMode ? (
                <Button
                  variant="outlined"
                  icon="delete"
                  onPress={() =>
                    updateTask({
                      start: null,
                      end: null,
                      recurrenceRule: null,
                      dateOnly: true,
                    })
                  }
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
      )}
      <View style={{ paddingHorizontal: 20, paddingBottom: 5 }}>
        <TextField
          bottomSheet
          variant="filled"
          onChangeText={setSearch}
          onKeyPress={(e) => {
            if (e.nativeEvent.key === "Escape") {
              searchRef.current?.blur();
            }
          }}
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

      <RecurrencePicker
        value={task.recurrenceRule}
        setValue={(t) => updateTask({ recurrenceRule: t })}
        ref={recurrenceRef}
      />

      <BottomSheetFlashList
        keyboardShouldPersistTaps="handled"
        data={filteredData}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 150,
        }}
        renderItem={({ item }: any) => {
          return (
            <ListItemButton
              style={{ marginHorizontal: -10 }}
              onPress={() => {
                // Save to lastUsedDate
                if (view === "DATE" && !timeMode) {
                  AsyncStorage.setItem(
                    "lastUsedDate",
                    item.value.toISOString()
                  );
                }
                if (timeMode) {
                  AsyncStorage.setItem(
                    "lastUsedTime",
                    item.value.toISOString()
                  );
                }

                if (timeMode) {
                  setTimeMode(false);
                  if (view === "DATE") {
                    updateTask({
                      dateOnly: false,
                      start: dayjs(task.start)
                        .set("hour", item.value.hour())
                        .set("minute", item.value.minute())
                        .toDate(),
                    });
                  } else {
                    updateTask({
                      dateOnly: false,
                      recurrenceRule: new RRule({
                        ...task.recurrenceRule,
                        dtstart: dayjs(task.recurrenceRule?.dtstart)
                          .set("hour", item.value.hour())
                          .set("minute", item.value.minute())
                          .toDate(),
                      }).options,
                    });
                  }
                } else {
                  if (item.recurrencePicker) {
                    recurrenceRef.current.present();
                  } else {
                    if (view === "RECURRENCE") {
                      updateTask({
                        recurrenceRule: item.value,
                        start: null,
                        end: null,
                      });
                    } else {
                      updateTask({
                        start: item.value.toDate(),
                        recurrenceRule: null,
                      });
                    }

                    forceClose();
                  }
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

function OnClose({ onClose }) {
  useEffect(() => {
    return () => {
      onClose?.();
    };
  }, [onClose]);

  return null;
}

export function TaskDateModal({
  ref,
  onClose,
  children,
  task,
  updateTask,
}: {
  ref: React.Ref<any>;
  onClose?: () => void;
  children?: React.ReactElement;
  task: any;
  updateTask: (task: any) => void;
}) {
  const sheetRef = useRef(null);
  const insets = useSafeAreaInsets();

  const trigger = cloneElement(children || <Pressable />, {
    onPress: () => {
      sheetRef.current?.present();
      Keyboard.dismiss();
    },
  });

  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.present(),
  }));

  return (
    <>
      {trigger}
      <BottomSheet
        snapPoints={["75%"]}
        containerStyle={{
          marginTop: 40 + insets.top,
          maxWidth: 500,
          width: "100%",
          marginLeft: "50%",
          transform: [{ translateX: "-50%" }],
        }}
        onClose={onClose}
        sheetRef={sheetRef}
      >
        <OnClose onClose={onClose} />
        <TaskDateModalContent task={task} updateTask={updateTask} />
      </BottomSheet>
    </>
  );
}

