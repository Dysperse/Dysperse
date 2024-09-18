import ChipInput from "@/components/ChipInput";
import { dysperseCalendarTheme } from "@/components/collections/navbar/AgendaCalendarMenu";
import LabelPicker from "@/components/labels/picker";
import { useLabelColors } from "@/components/labels/useLabelColors";
import { useStorageContext } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover from "@/ui/MenuPopover";
import Modal from "@/ui/Modal";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha, useColor, useDarkMode } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal, useBottomSheet } from "@gorhom/bottom-sheet";
import {
  Calendar,
  fromDateId,
  toDateId,
} from "@marceloterreiro/flash-calendar";
import convertTime from "convert-time";
import dayjs, { Dayjs } from "dayjs";
import { BlurView } from "expo-blur";
import React, {
  RefObject,
  cloneElement,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import {
  InteractionManager,
  Keyboard,
  Platform,
  Pressable,
  View,
} from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { Options, RRule } from "rrule";
import useSWR from "swr";
import { TaskAttachmentButton } from "../drawer/attachment/button";
import { normalizeRecurrenceRuleObject } from "../drawer/details";
import TaskDatePicker from "./TaskDatePicker";

const TimeInput = React.forwardRef(
  (
    {
      value: defaultValue,
      setValue: setDefaultValue,
      valueKey = "date",
    }: {
      value: Dayjs;
      setValue: (key: string, value: Dayjs) => void;
      valueKey?: "date" | "end";
    },
    ref: RefObject<TextInput>
  ) => {
    const breakpoints = useResponsiveBreakpoints();
    const [value, setValue] = useState(defaultValue?.format?.("h:mm A") || "");

    return (
      <TextField
        selectTextOnFocus
        onBlur={(e) => {
          const n = e.nativeEvent.text.toLowerCase();
          if (convertTime(n)) {
            const [hours, minutes] = convertTime(n).split(":");
            setDefaultValue(
              valueKey,
              dayjs(defaultValue)
                .hour(parseInt(hours))
                .minute(parseInt(minutes))
            );
            setValue(
              dayjs(defaultValue)
                .hour(parseInt(hours))
                .minute(parseInt(minutes))
                .format("h:mm A")
            );
          } else {
            setValue(defaultValue.format("h:mm A"));
            Toast.show({
              type: "error",
              text1: "Please type a valid time",
            });
          }
        }}
        inputRef={ref}
        variant="filled+outlined"
        style={{
          width: breakpoints.md ? 100 : "100%",
          textAlign: "center",
          height: 35,
        }}
        placeholder="12:00"
        value={value}
        onChangeText={(e) => setValue(e)}
      />
    );
  }
);

export const DueDatePicker = ({ watch, value, setValue }) => {
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const dateOnly = watch("dateOnly");
  const endDate = watch("end");
  const timeInputRef = useRef<TextInput>(null);
  const endTimeInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (endDate && dayjs(endDate).isBefore(dayjs(value))) {
      setValue("end", dayjs(value).add(1, "hour").minute(0));
      Toast.show({ type: "error", text1: "End time must be after start time" });
      InteractionManager.runAfterInteractions(() => {
        endTimeInputRef.current?.focus();
      });
    }
  }, [dateOnly, setValue, endDate, value]);

  const quickDates = useMemo(
    () => [
      { label: "Today", value: dayjs().startOf("day").utc() },
      { label: "Tomorrow", value: dayjs().add(1, "day").utc() },
      { label: "In 2 days", value: dayjs().add(2, "day").utc() },
      { label: "Next week", value: dayjs().add(1, "week").utc() },
    ],
    []
  );

  const [calendarMonthId, setCalendarMonthId] = useState(
    toDateId(
      dayjs(
        dayjs(value).isValid() ? value.toISOString() : dayjs().toISOString()
      ).toDate()
    )
  );

  useEffect(() => {
    setCalendarMonthId(
      toDateId(
        dayjs(
          dayjs(value).isValid() ? value.toISOString() : dayjs().toISOString()
        ).toDate()
      )
    );
  }, [value]);

  return (
    <View
      style={{
        flexDirection: breakpoints.md ? "row" : "column-reverse",
        gap: 10,
        padding: 10,
        paddingTop: breakpoints.md ? 20 : 0,
        paddingHorizontal: 20,
        paddingBottom: 20,
      }}
    >
      <View
        style={{
          flex: breakpoints.md ? 1 : undefined,
          borderColor: theme[6],
          borderWidth: 2,
          borderRadius: 25,
          padding: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            marginBottom: -20,
            zIndex: 99,
            justifyContent: "space-between",
          }}
        >
          <IconButton
            icon="arrow_back"
            onPress={() =>
              setCalendarMonthId(
                toDateId(
                  dayjs(fromDateId(calendarMonthId).toISOString())
                    .subtract(1, "month")
                    .toDate()
                )
              )
            }
          />
          <IconButton
            icon="arrow_forward"
            onPress={() =>
              setCalendarMonthId(
                toDateId(
                  dayjs(fromDateId(calendarMonthId).toISOString())
                    .add(1, "month")
                    .toDate()
                )
              )
            }
          />
        </View>
        <Calendar
          calendarMonthId={calendarMonthId}
          theme={{
            ...dysperseCalendarTheme(theme),
            rowMonth: {
              content: {
                textAlign: "center",
                textTransform: "uppercase",
                marginTop: -15,
                color: addHslAlpha(theme[11], 0.5),
                fontFamily: "body_900",
              },
            },
          }}
          onCalendarDayPress={(date) => {
            setValue("date", dayjs(fromDateId(date).toISOString()));
          }}
          calendarActiveDateRanges={
            value
              ? [
                  {
                    startId: toDateId(dayjs(value.toISOString()).toDate()),
                    endId: toDateId(dayjs(value.toISOString()).toDate()),
                  },
                ]
              : []
          }
        />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, padding: 10 }}
        >
          {quickDates.map((date, i) => (
            <Chip
              key={i}
              outlined={value?.toString() !== date.value.toString()}
              label={date.label}
              onPress={() => setValue("date", date.value)}
              icon={
                value?.toString() === date.value.toString() && (
                  <Icon filled>check</Icon>
                )
              }
            />
          ))}
        </ScrollView>
      </View>
      {value ? (
        <View
          style={{
            flex: breakpoints.md ? 1 : undefined,
            alignItems: "center",
            padding: 10,
            justifyContent: "center",
          }}
        >
          <Text weight={800} style={{ fontSize: 25, textAlign: "center" }}>
            {dayjs(value).format("dddd, MMMM Do")}
          </Text>
          <Text style={{ fontSize: 20, opacity: 0.6, marginBottom: 20 }}>
            {dayjs(value).isToday() ? "Today" : dayjs(value).fromNow()}
          </Text>
          <ListItemButton
            onPress={() => {
              setValue("dateOnly", !dateOnly);
              if (dateOnly)
                setTimeout(() => {
                  timeInputRef.current?.focus();
                }, 10);
            }}
            style={{ height: 40 }}
          >
            {dateOnly ? (
              <ListItemText
                primaryProps={{ style: { color: theme[11] } }}
                primary={dateOnly ? "All day" : dayjs(value).format("h:mm A")}
              />
            ) : (
              <Pressable
                style={{ flex: 1 }}
                onPress={(e) => e.stopPropagation()}
              >
                <TimeInput
                  ref={timeInputRef}
                  value={value}
                  setValue={setValue}
                />
              </Pressable>
            )}
            <Icon size={30} style={!dateOnly && { opacity: 0.6 }}>
              toggle_{dateOnly ? "on" : "off"}
            </Icon>
          </ListItemButton>
          <ListItemButton
            onPress={() => {
              if (dateOnly)
                Toast.show({ type: "error", text1: "Add a time first" });
              else
                setTimeout(() => {
                  endTimeInputRef.current?.focus();
                  if (!endDate)
                    setValue("end", dayjs(value).add(1, "hour").minute(0));
                  else setValue("end", null);
                }, 10);
            }}
            style={{ height: 40 }}
          >
            {!dateOnly && endDate ? (
              <Pressable
                style={{ flex: 1 }}
                onPress={(e) => e.stopPropagation()}
              >
                <TimeInput
                  ref={endTimeInputRef}
                  value={endDate}
                  setValue={setValue}
                  valueKey="end"
                  key={dayjs(endDate).format("h:mm A")}
                />
              </Pressable>
            ) : (
              <ListItemText
                primaryProps={{ style: { color: theme[11] } }}
                primary={
                  !dateOnly && endDate
                    ? dayjs(value).format("h:mm A")
                    : "Add end time"
                }
              />
            )}
            <Icon size={30} style={!dateOnly && { opacity: 0.6 }}>
              {endDate ? "delete" : "add"}
            </Icon>
          </ListItemButton>
          <ListItemButton
            onPress={() => setValue("date", null)}
            style={{ height: 40 }}
          >
            <ListItemText
              primaryProps={{ style: { color: theme[11] } }}
              primary="Clear"
            />
            <Icon>remove_circle</Icon>
          </ListItemButton>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.6,
            padding: 10,
          }}
        >
          <Text weight={900} style={{ fontSize: 20 }}>
            No date set
          </Text>
        </View>
      )}
    </View>
  );
};
export type defaultRecurrenceOptions = {
  dtstart?: string;
};

export function RecurrencePicker({
  value,
  setValue,
  defaultRecurrenceOptions,
}: {
  value: any;
  setValue: any;
  defaultRecurrenceOptions?: defaultRecurrenceOptions;
}): React.JSX.Element {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { session } = useUser();
  const defaultOptions = useMemo(
    (): Partial<Options> => ({
      freq: RRule.WEEKLY,
      byweekday: [dayjs().day() - 1],
      dtstart: dayjs(defaultRecurrenceOptions?.dtstart)
        .utc()
        .startOf("day")
        .toDate(),
      wkst: session?.space?.space?.weekStart === "SUNDAY" ? RRule.SU : RRule.MO,
    }),
    [session, defaultRecurrenceOptions]
  );

  const recurrenceRule = normalizeRecurrenceRuleObject(
    value || normalizeRecurrenceRuleObject(defaultOptions).options
  );

  const [previewRange, setPreviewRange] = useState<Date>(new Date());
  const endsInputCountRef = useRef<TextInput>(null);
  const endsInputDateRef = useRef<TextInput>(null);

  const handleEdit = (key, newValue) => {
    setValue("recurrenceRule", {
      ...value,
      [key]: newValue,
    });
  };

  const quickRules = useMemo(
    () => [
      { label: "Every day", value: new RRule({ freq: RRule.DAILY }) },
      {
        label: `Every ${dayjs().format("dddd")}`,
        value: new RRule({ freq: RRule.WEEKLY }),
      },
      {
        label: `Monthly on the ${dayjs().format("Do")}`,
        value: new RRule({ freq: RRule.MONTHLY }),
      },
      {
        label: `Yearly on ${dayjs().format("MMM Do")}`,
        value: new RRule({ freq: RRule.YEARLY }),
      },
    ],
    []
  );

  console.log(value);

  return (
    <>
      {recurrenceRule && (
        <View
          style={{
            flexDirection: breakpoints.md ? "row" : "column",
            paddingHorizontal: 20,
            gap: 20,
          }}
        >
          <View style={{ flex: breakpoints.md ? 1 : undefined }}>
            <Text variant="eyebrow" style={{ marginBottom: 5, marginTop: 20 }}>
              Repeat every
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: theme[6],
                backgroundColor: theme[3],
                borderRadius: 15,
                flexDirection: "row",
              }}
            >
              <TextField
                placeholder="1"
                style={{ flex: 1, paddingHorizontal: 20 }}
                defaultValue={value?.interval || 1}
                onChange={(e) => {
                  const t = e.nativeEvent.text;
                  if (parseInt(t) && parseInt(t) > 0)
                    handleEdit("interval", parseInt(e.nativeEvent.text));
                }}
              />
              <MenuPopover
                options={[
                  { text: "Daily", value: RRule.DAILY },
                  { text: "Week", value: RRule.WEEKLY },
                  { text: "Month", value: RRule.MONTHLY },
                  { text: "Year", value: RRule.YEARLY },
                ].map((e) => ({
                  ...e,
                  callback: () => {
                    setValue(
                      "recurrenceRule",
                      new RRule({
                        freq: e.value,
                        interval: value?.interval || 1,
                      }).options
                    );
                  },
                  selected: value?.freq === e.value,
                }))}
                trigger={
                  <ListItemButton style={{ height: 40 }}>
                    <ListItemText
                      truncate
                      primary={
                        ["days", "weeks", "months", "years"][3 - value?.freq]
                      }
                    />
                    <Icon>expand_more</Icon>
                  </ListItemButton>
                }
              />
            </View>
            {/* {value?.freq === RRule.WEEKLY && ( */}
            <>
              <Text
                variant="eyebrow"
                style={{ marginTop: 20, marginBottom: 5 }}
              >
                ON
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <MenuPopover
                  menuProps={{ style: { flex: 1 } }}
                  options={[
                    { value: 6, text: "Sunday" },
                    { value: 0, text: "Monday" },
                    { value: 1, text: "Tuesday" },
                    { value: 2, text: "Wednesday" },
                    { value: 3, text: "Thursday" },
                    { value: 4, text: "Friday" },
                    { value: 5, text: "Saturday" },
                  ].map((e) => ({
                    ...e,
                    callback: () => {
                      handleEdit(
                        "byweekday",
                        (value.byweekday
                          ? value.byweekday.includes(e.value)
                            ? value.byweekday.filter((day) => day !== e.value)
                            : [...value.byweekday, e.value]
                          : [
                              ...new Set(
                                [...(value?.byweekday || []), e.value].sort()
                              ),
                            ]
                        ).sort()
                      );
                    },
                    selected: value?.byweekday?.includes(e.value),
                  }))}
                  closeOnSelect={false}
                  trigger={
                    <ListItemButton
                      style={{ height: 60, flex: 1 }}
                      variant="filled"
                    >
                      <Icon>wb_sunny</Icon>
                      <ListItemText
                        truncate
                        primary={
                          value?.byweekday?.length === 0 || !value?.byweekday
                            ? "All days"
                            : `${value?.byweekday?.length || 0} day${
                                value?.byweekday?.length === 1 ? "" : "s"
                              }`
                        }
                        secondary="Select days"
                      />
                    </ListItemButton>
                  }
                />
              </View>
            </>
            <Text variant="eyebrow" style={{ marginTop: 20, marginBottom: 5 }}>
              Ends
            </Text>
            <ListItemButton
              style={{ height: 40 }}
              variant={!value?.until && !value?.count ? "filled" : null}
              onPress={() => {
                setValue("recurrenceRule", {
                  ...value,
                  until: null,
                  count: null,
                });
                endsInputDateRef.current?.clear();
                endsInputCountRef.current?.clear();
              }}
            >
              <Icon>
                {!value?.until && !value?.count
                  ? "radio_button_checked"
                  : "radio_button_unchecked"}
              </Icon>
              <ListItemText truncate primary="Never" />
            </ListItemButton>
            <ListItemButton
              style={{ height: 40 }}
              variant={value?.until && !value?.count ? "filled" : null}
              onPress={() => {
                setTimeout(() => {
                  endsInputDateRef.current?.focus();
                }, 0);
              }}
            >
              <Icon>
                {value?.until && !value?.count
                  ? "radio_button_checked"
                  : "radio_button_unchecked"}
              </Icon>
              <ListItemText truncate primary="On" />
              <TextField
                inputRef={endsInputDateRef}
                variant="outlined"
                placeholder="Date"
                style={{ padding: 4, borderRadius: 5 }}
                defaultValue={
                  value?.until ? dayjs(value?.until).format("MM/DD/YYYY") : ""
                }
                onBlur={(e) => {
                  let n = dayjs(e.nativeEvent.text);
                  if (
                    n.year() === 2001 &&
                    !e.nativeEvent.text.split(" ").includes("2001")
                  ) {
                    n = n.year(dayjs().year());
                  }
                  console.log(n);
                  if (n.isValid()) {
                    endsInputCountRef.current?.clear();
                    setValue("recurrenceRule", {
                      ...value,
                      until: n.toDate(),
                      count: null,
                    });
                  } else if (e.nativeEvent.text) {
                    endsInputDateRef.current?.clear();
                    Toast.show({
                      type: "error",
                      text1: "Please type a valid date",
                    });
                  }
                }}
              />
            </ListItemButton>
            <ListItemButton
              style={{ height: 40 }}
              variant={value?.count && !value?.until ? "filled" : null}
              onPress={() => {
                setTimeout(() => {
                  endsInputCountRef.current?.focus();
                }, 0);
              }}
            >
              <Icon>
                {value?.count && !value?.until
                  ? "radio_button_checked"
                  : "radio_button_unchecked"}
              </Icon>
              <ListItemText truncate primary="After" />
              <TextField
                inputRef={endsInputCountRef}
                variant="outlined"
                placeholder="#"
                style={{ padding: 4, borderRadius: 5, width: 50 }}
                onBlur={(e) => {
                  const n = parseInt(e.nativeEvent.text);
                  if (n === 0) endsInputCountRef.current?.clear();
                  if (n && !isNaN(n)) {
                    endsInputDateRef.current?.clear();
                    setValue("recurrenceRule", {
                      ...value,
                      until: null,
                      count: n === 0 ? null : n,
                    });
                  } else if (e.nativeEvent.text) {
                    endsInputCountRef.current?.clear();
                    Toast.show({
                      type: "error",
                      text1: "Please type a number",
                    });
                  }
                }}
              />
              <ListItemText truncate primary="times" />
            </ListItemButton>
          </View>
          <View
            style={{
              padding: 10,
              flex: breakpoints.md ? 1 : undefined,
            }}
          >
            <View
              style={{
                marginTop: breakpoints.md ? 0 : 30,
                borderWidth: 2,
                borderColor: theme[6],
                borderRadius: 25,
                padding: 10,
                flex: 1,
              }}
            >
              <Calendar
                onCalendarDayPress={() => {}}
                calendarMonthId={toDateId(previewRange)}
                theme={dysperseCalendarTheme(theme)}
                calendarActiveDateRanges={recurrenceRule
                  .between(
                    dayjs(previewRange)
                      .startOf("month")
                      .subtract(1, "month")
                      .utc()
                      .toDate(),
                    dayjs(previewRange)
                      .utc()
                      .endOf("month")
                      .add(1, "month")
                      .toDate()
                  )
                  .map((date) => ({
                    startId: toDateId(date),
                    endId: toDateId(date),
                  }))}
              />
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsHorizontalScrollIndicator={false}
                horizontal
                contentContainerStyle={{ gap: 10, padding: 10 }}
              >
                {quickRules.map((date, i) => (
                  <Chip
                    key={i}
                    outlined={value?.toString() !== date.value.toString()}
                    label={date.label}
                    onPress={() =>
                      setValue("recurrenceRule", date.value.options)
                    }
                    icon={
                      value?.toString() === date.value.toString() && (
                        <Icon filled>check</Icon>
                      )
                    }
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      )}
    </>
  );
}

const PinTask = memo(function PinTask({ watch, control }: any) {
  const orange = useColor("orange");
  const pinned = watch("pinned");
  const breakpoints = useResponsiveBreakpoints();

  const rotate = useSharedValue(0);
  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotate.value}deg`,
        },
      ],
    };
  });

  useEffect(() => {
    rotate.value = withSpring(pinned ? -35 : 0, {
      mass: 1,
      damping: 10,
      stiffness: 200,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 2,
    });
  });
  const theme = useColorTheme();
  return (
    <Controller
      control={control}
      name="pinned"
      defaultValue={false}
      render={({ field: { onChange, value } }) => (
        <IconButton
          icon="push_pin"
          size={breakpoints.md ? 50 : 35}
          onPress={() => onChange(!value)}
          variant="filled"
          iconProps={{ filled: value }}
          iconStyle={{ transform: [{ rotate: "-30deg" }] }}
          backgroundColors={
            value
              ? {
                  default: orange[6],
                  hovered: orange[5],
                  pressed: orange[4],
                }
              : {
                  default: addHslAlpha(theme[9], 0.15),
                  hovered: addHslAlpha(theme[9], 0.25),
                  pressed: addHslAlpha(theme[9], 0.35),
                }
          }
        />
      )}
    />
  );
});

function DatePicker({ setValue, watch }: any) {
  const date = watch("date");

  return (
    <TaskDatePicker
      setValue={setValue}
      watch={watch}
      defaultRecurrenceOptions={{ dtstart: date || new Date() }}
    />
  );
}

function Footer({
  nameRef,
  labelMenuRef,
  setValue,
  watch,
  control,
  menuRef,
}: {
  nameRef: any;
  labelMenuRef: React.MutableRefObject<BottomSheetModal>;
  setValue: any;
  watch: any;
  control: any;
  menuRef: React.MutableRefObject<BottomSheetModal>;
}) {
  const collectionId = watch("collectionId");
  const date = watch("date");
  const label = watch("label");

  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={{
        paddingBottom: 10,
        display: !date && !label ? "none" : "flex",
      }}
    >
      <ScrollView
        horizontal
        contentContainerStyle={{
          alignItems: "center",
          flexDirection: "row",
          gap: 5,
        }}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {date && <DatePicker setValue={setValue} watch={watch} />}
        {label && (
          <CreateTaskLabelInput
            watch={watch}
            collectionId={collectionId}
            control={control}
            labelMenuRef={labelMenuRef}
            onLabelPickerClose={() => {
              nameRef?.current?.focus();
            }}
          />
        )}

        <TaskSuggestions />
      </ScrollView>
    </View>
  );
}

const CreateTaskLabelInput = memo(function CreateTaskLabelInput({
  control,
  collectionId,
  labelMenuRef,
  onLabelPickerClose,
  watch,
}: any) {
  const theme = useColorTheme();
  const colors = useLabelColors();
  const label = watch("label");

  const animation = useSharedValue(1);

  const animationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animation.value }],
  }));

  useEffect(() => {
    if (label) {
      animation.value = withSequence(
        withTiming(1.06, { duration: 140 }),
        withTiming(1)
      );
    }
  }, [label, animation]);

  return (
    <Animated.View style={animationStyle}>
      <Controller
        control={control}
        name="label"
        defaultValue={false}
        render={({ field: { onChange, value } }) => (
          <LabelPicker
            label={value}
            setLabel={onChange}
            defaultCollection={collectionId}
            sheetProps={{ sheetRef: labelMenuRef }}
            autoFocus
            onClose={onLabelPickerClose}
          >
            <ColorThemeProvider theme={colors[value?.color] || theme}>
              <Chip
                onDismiss={value ? () => onChange(null) : undefined}
                label={value?.name || "Label"}
                icon={
                  value?.emoji ? (
                    <Emoji emoji={value?.emoji} />
                  ) : (
                    <Icon>new_label</Icon>
                  )
                }
                style={({ pressed, hovered }) => ({
                  borderWidth: 1,
                  backgroundColor: addHslAlpha(
                    colors[value?.color]?.[9] || theme[9],
                    pressed ? 0.3 : hovered ? 0.2 : 0.1
                  ),
                })}
              />
            </ColorThemeProvider>
          </LabelPicker>
        )}
      />
    </Animated.View>
  );
});

function NlpProcessor({
  value,
  setValue,
  onChange,
  suggestions,
}: {
  value: string;
  setValue: any;
  onChange: any;
  suggestions: any;
}) {
  useEffect(() => {
    const replacementString = Platform.OS === "web" ? "@" : "/";
    suggestions.forEach((suggestion) => {
      if (
        value.includes(suggestion.name) &&
        !value.includes(
          `${replacementString}[${suggestion.name}](${suggestion.id})`
        )
      ) {
        onChange(
          value.replace(
            suggestion.name,
            `${replacementString}[${suggestion.name}](${suggestion.id})`
          )
        );
      }
    });

    if (
      value.match(/(?:at|from|during|after|before)\s(\d+)(am|pm|) /i) &&
      !value.includes("](time-prediction)")
    ) {
      const match = value.match(
        /(?:at|from|during|after|before)\s(\d+)(am|pm|)/i
      );
      const time = match[1];
      let amPm = value.toLowerCase().includes("p") ? "pm" : "am";

      if (
        !value.toLowerCase().includes("am") &&
        !value.toLowerCase().includes("pm")
      ) {
        // make these values sensitive to a human's life
        amPm = {
          "1": "pm",
          "2": "pm",
          "3": "pm",
          "4": "pm",
          "5": "pm",
          "6": "pm",
          "7": "pm",
          "8": "pm",
          "9": "pm",
          "10": "pm",
          "11": "am",
          "12": "pm",
        }[time];
      }

      if (Number(time) > 12) return;
      if (
        dayjs().hour() ===
          Number(time) + (amPm === "pm" && time !== "12" ? 12 : 0) ||
        value.includes("every")
      )
        return;

      onChange(
        value.replace(
          match[0],
          `${replacementString}[${match[0]}](time-prediction)`
        )
      );
    }

    if (/\]\(time-prediction\) (pm|PM|am|AM) /.test(value)) {
      onChange(
        value.replace(
          /\]\(time-prediction\) (pm|PM|am|AM) /g,
          (match, p1) => `${p1}](time-prediction) `
        )
      );
    }

    if (
      /for [0-9]\s*(h|d|w|hour|hours|day|week)\s/.test(value) &&
      !value.includes("](end)")
    ) {
      const match = value.match(/for [0-9]\s*(h|d|w|hour|hours|day|week)/);
      onChange(
        value.replace(match[0], `${replacementString}[${match[0]}](end)`)
      );
    }
    if (value.includes("h](end)our")) {
      onChange(value.replace(/([0-9])\s*h\]\(end\)our/, "$1 hour](end)"));
    }
  }, [value, suggestions, onChange]);

  return null;
}

function LabelNlpProcessor({
  value,
  onChange,
  label,
  setValue,
}: {
  value: string;
  onChange: any;
  label: any;
  setValue;
}) {
  useEffect(() => {
    const regex =
      /__LABEL__{([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})}__/g;

    value.match(regex)?.forEach((match) => {
      console.log("MATCH FOUND: ", match);
      const id = match.replace(/__LABEL__{([0-9a-f-]+)}__/, "$1");
      const str = `${Platform.OS === "web" ? "@" : "#"}[${
        label.find((e) => e.id === id)?.name
      }](${match})${Platform.OS === "web" ? "" : " "}`;
      console.log("REPLACING: ", str, value);
      onChange(value.replace(str, ""));
      setValue(
        "label",
        label.find((e) => e.id === id)
      );
    });
  }, [value, label, onChange, setValue]);

  return null;
}

function TaskNameInput({
  control,
  handleSubmitButtonClick,
  menuRef,
  nameRef,
  setValue,
  watch,
}: {
  control: any;
  handleSubmitButtonClick: any;
  menuRef: React.MutableRefObject<BottomSheetModal>;
  nameRef: any;
  setValue: any;
  watch;
}) {
  const attachments = watch("attachments");
  const { forceClose } = useBottomSheet();
  const { data: labelData } = useSWR(["space/labels"]);

  const suggestions = useMemo(
    () => [
      { id: "1", name: "tmw" },
      { id: "2", name: "today" },
      { id: "3", name: "!!" },
      { id: "4", name: "tomorrow" },
      { id: "5", name: "important" },
    ],
    []
  );

  useEffect(() => {
    Keyboard.addListener("keyboardWillHide", () => {
      setTimeout(() => nameRef.current.focusInputWithKeyboard(), 0);
    });
  }, [nameRef]);

  return (
    <Controller
      control={control}
      rules={{ required: true }}
      name="name"
      render={({ field: { onChange, onBlur, value } }) => (
        <>
          <NlpProcessor
            value={value}
            onChange={onChange}
            setValue={setValue}
            suggestions={suggestions}
          />
          <LabelNlpProcessor
            value={value}
            onChange={onChange}
            label={labelData}
            setValue={setValue}
          />
          <View>
            <ChipInput
              placeholder="What's on your mind?"
              onSubmitEditing={() => handleSubmitButtonClick()}
              inputProps={{
                onBlur,
                ...(Platform.OS === "web" && {
                  onPaste: async (e) => {
                    const items = (
                      e.clipboardData || e.originalEvent.clipboardData
                    ).items;
                    for (const index in items) {
                      const item = items[index];
                      if (item.kind === "file") {
                        Toast.show({
                          type: "info",
                          props: { loading: true },
                          text1: "Uploading image...",
                          swipeable: false,
                          visibilityTime: 1e9,
                        });
                        const form: any = new FormData();
                        const blob = item.getAsFile();

                        form.append(
                          "source",
                          new File([blob], "filename", {
                            type: "image/png",
                            lastModified: new Date().getTime(),
                          })
                        );

                        const res = await fetch(
                          "https://api.dysperse.com/upload",
                          {
                            method: "POST",
                            body: form,
                          }
                        ).then((res) => res.json());
                        if (res.error) {
                          Toast.hide();
                          Toast.show({
                            type: "error",
                            text1: "Failed to upload",
                            text2: res.error.message,
                          });
                        } else {
                          console.log(res);
                          setValue("attachments", [
                            ...attachments,
                            { type: "IMAGE", data: res.image.display_url },
                          ]);

                          Toast.hide();
                          Toast.show({
                            type: "success",
                            text1: "Image uploaded!",
                          });
                        }
                      }
                    }
                  },
                }),
                [Platform.OS === "web" ? "onKeyDown" : "onKeyPress"]: (e) => {
                  if (e.key === "Enter" || e.nativeEvent.key === "Enter") {
                    e?.preventDefault?.();
                    if (value.replaceAll("\n", "").trim())
                      handleSubmitButtonClick();
                    else setValue("name", value.replaceAll("\n", ""));
                  }
                  if (e.key === "@") {
                    e.preventDefault();
                    nameRef.current?.blur();
                    menuRef.current?.present();
                  }
                  if (e.key === "Escape") {
                    if (value) return onChange("");
                    forceClose();
                  }
                },
              }}
              height={95}
              inputRef={nameRef}
              suggestions={[
                {
                  key: Platform.OS === "web" ? "/" : "‎",
                  suggestions,
                },
                {
                  key: "#",
                  suggestions:
                    (Array.isArray(labelData) &&
                      labelData.map((label) => ({
                        id: `__LABEL__{${label.id}}__`,
                        name: label.name,
                        icon: <Emoji size={20} emoji={label.emoji} />,
                      }))) ||
                    [],
                },
              ]}
              value={value}
              setValue={(d) => {
                onChange(d);
                if (d.includes("!!") || d.includes("important")) {
                  setValue("pinned", true);
                }
                if (d === "") {
                  setValue("pinned", false);
                }
              }}
            />
          </View>
        </>
      )}
    />
  );
}

const TaskSuggestions = () => {
  const theme = useColorTheme();

  // const generateChipLabel = useCallback(() => {
  //   if (!name) return null;
  //   const regex = /(?:at|from|during|after|before)\s(\d+)/i;
  //   const match = name.match(regex);

  //   if (match) {
  //     const time = match[1];
  //     let amPm = name.toLowerCase().includes("p") ? "pm" : "am";

  //     if (
  //       !name.toLowerCase().includes("am") &&
  //       !name.toLowerCase().includes("pm")
  //     ) {
  //       // make these values sensitive to a human's life
  //       amPm = {
  //         "1": "pm",
  //         "2": "pm",
  //         "3": "pm",
  //         "4": "pm",
  //         "5": "pm",
  //         "6": "pm",
  //         "7": "pm",
  //         "8": "pm",
  //         "9": "pm",
  //         "10": "pm",
  //         "11": "am",
  //         "12": "pm",
  //       }[time];
  //     }

  //     if (Number(time) > 12) return null;
  //     if (
  //       dayjs(currentDate).hour() ===
  //         Number(time) + (amPm === "pm" && time !== "12" ? 12 : 0) ||
  //       name.includes("every")
  //     )
  //       return null;
  //     return {
  //       label: `At ${time} ${amPm}`,
  //       onPress: () => {
  //         setValue(
  //           "date",
  //           dayjs(currentDate)
  //             .hour(Number(time) + (amPm === "pm" && time !== "12" ? 12 : 0))
  //             .minute(0)
  //         );
  //         setValue("dateOnly", false);
  //       },
  //       icon: "magic_button",
  //     };
  //   }
  // }, [name, setValue, currentDate]);

  // const generateRecurrenceLabel = useCallback(() => {
  //   try {
  //     if (!name.includes("every")) return null;
  //     const split = name.toLowerCase().toString().split("every ");
  //     const text = "Every " + split[split[1] ? 1 : 0];

  //     const rule = RRule.fromText(text);

  //     if (currentRecurrenceRule?.toText() === rule.toText()) return null;

  //     return {
  //       label: capitalizeFirstLetter(rule.toText()),
  //       onPress: () => {
  //         setValue("date", null);
  //         setValue("recurrenceRule", rule.options);
  //       },
  //       icon: "magic_button",
  //     };
  //   } catch (e) {
  //     return null;
  //   }
  // }, [name, setValue, currentRecurrenceRule]);

  const suggestions = [
    // generateChipLabel(), generateRecurrenceLabel()
  ];

  return (
    suggestions.length > 0 && (
      <>
        {suggestions
          .filter((e) => e)
          .map((suggestion, i) => (
            <Chip
              key={i}
              outlined
              style={{ borderColor: theme[5] }}
              label={suggestion.label}
              icon={suggestion.icon}
              onPress={suggestion.onPress}
            />
          ))}
      </>
    )
  );
};

const TaskAttachments = ({ watch, setValue }: any) => {
  const theme = useColorTheme();
  const attachments = watch("attachments");
  const note = watch("note");

  return (
    attachments?.length > 0 && (
      <ScrollView
        horizontal
        keyboardShouldPersistTaps="handled"
        style={{
          marginTop: -10,
          maxHeight: 65,
          marginBottom: -5,
        }}
        contentContainerStyle={{ alignItems: "center", gap: 15 }}
        showsHorizontalScrollIndicator={false}
      >
        {note && (
          <View
            style={[
              {
                backgroundColor: theme[3],
                borderRadius: 20,
                flexDirection: "row",
                gap: 10,
                padding: 10,
                position: "relative",
              },
            ]}
          >
            <Avatar icon="sticky_note_2" />
            <View style={{ flex: 1, flexDirection: "column" }}>
              <Text variant="eyebrow">Note</Text>
              <Text numberOfLines={1}>{note}</Text>
            </View>
            <IconButton
              icon="close"
              size={30}
              variant="filled"
              onPress={() => setValue("note", "")}
              style={{ borderColor: theme[2], alignSelf: "center" }}
            />
          </View>
        )}
        {attachments.map((attachment, i) => (
          <View
            key={i}
            style={[
              {
                backgroundColor: addHslAlpha(theme[9], 0.1),
                borderRadius: 20,
                flexDirection: "row",
                gap: 10,
                padding: 10,
                position: "relative",
              },
            ]}
          >
            <Avatar
              image={attachment.type === "IMAGE" ? attachment.data : null}
              icon={
                attachment.type === "LOCATION"
                  ? "location_on"
                  : attachment.type === "LINK"
                  ? "attachment"
                  : "image"
              }
            />
            <View style={{ flex: 1, flexDirection: "column" }}>
              <Text variant="eyebrow">{attachment.type}</Text>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{
                    color: theme[11],
                    maxWidth: 120,
                  }}
                  numberOfLines={1}
                >
                  {attachment.type === "IMAGE"
                    ? new URL(attachment.data).pathname
                        .split("/")
                        .pop()
                        .split(".")[0]
                    : attachment.data?.name || attachment.data}
                </Text>
                {attachment.type === "IMAGE" && (
                  <Text style={{ color: theme[11] }} weight={500}>
                    .
                    {
                      new URL(attachment.data).pathname
                        .split("/")
                        .pop()
                        .split(".")[1]
                    }
                  </Text>
                )}
              </View>
            </View>
            <IconButton
              icon="close"
              size={30}
              variant="filled"
              backgroundColors={{
                default: "transparent",
                hovered: "transparent",
                pressed: "transparent",
              }}
              onPress={() => {
                setValue(
                  "attachments",
                  attachments.filter((_, index) => index !== i)
                );
              }}
              style={{ borderColor: theme[2], alignSelf: "center" }}
            />
          </View>
        ))}
      </ScrollView>
    )
  );
  // return null;
};

function Attachment({ control, nameRef, setValue, menuRef }: any) {
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();

  return (
    <Controller
      name="attachments"
      control={control}
      render={({ field: { onChange, value } }) => (
        <>
          <TaskAttachmentButton
            menuRef={menuRef}
            onClose={() => nameRef.current.focus()}
            task={{ attachments: value }}
            updateTask={(key, value) => {
              if (key !== "note") {
                onChange(value);
              } else {
                setValue("note", value);
              }
            }}
          >
            <IconButton
              size={breakpoints.md ? 50 : 35}
              pressableStyle={{
                gap: 5,
                flexDirection: "row",
              }}
              variant="filled"
              backgroundColors={{
                default: addHslAlpha(theme[9], 0.15),
                hovered: addHslAlpha(theme[9], 0.25),
                pressed: addHslAlpha(theme[9], 0.35),
              }}
            >
              <Icon>note_stack_add</Icon>
            </IconButton>
          </TaskAttachmentButton>
        </>
      )}
    />
  );
}

const SubmitButton = memo(({ onSubmit }: any) => {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <IconButton
      size={breakpoints.md ? 50 : 35}
      iconStyle={{ color: theme[1] }}
      iconProps={{ bold: true }}
      backgroundColors={{
        default: theme[10],
        hovered: theme[11],
        pressed: theme[12],
      }}
      variant="filled"
      icon="arrow_upward"
      onPress={onSubmit}
    />
  );
});

const CancelButton = memo(() => {
  const { forceClose } = useBottomSheet();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <IconButton
      size={breakpoints.md ? 50 : 35}
      variant="outlined"
      icon="close"
      style={{ marginRight: "auto" }}
      onPress={() => forceClose()}
    />
  );
});

function DateButton({ watch, colors, defaultValues, setValue }: any) {
  const date = watch("date");
  const breakpoints = useResponsiveBreakpoints();
  const recurrenceRule = watch("recurrenceRule");

  return (
    <View
      style={{
        display: date || recurrenceRule ? "none" : "flex",
      }}
    >
      <TaskDatePicker
        setValue={setValue}
        watch={watch}
        defaultRecurrenceOptions={{
          dtstart: (defaultValues.date || new Date()).toISOString(),
        }}
      >
        <IconButton
          backgroundColors={colors}
          icon="calendar_today"
          size={breakpoints.md ? 50 : 35}
          variant="filled"
        />
      </TaskDatePicker>
    </View>
  );
}

function LabelButton({ watch, colors, defaultValues, setValue }: any) {
  const value = watch("label");
  const breakpoints = useResponsiveBreakpoints();
  const collectionId = watch("collectionId");
  const labelMenuRef = useRef<BottomSheetModal>(null);

  return (
    <View
      style={{
        display: value ? "none" : "flex",
      }}
    >
      <LabelPicker
        label={value}
        setLabel={(e) => setValue("label", e)}
        defaultCollection={collectionId}
        sheetProps={{ sheetRef: labelMenuRef }}
        autoFocus
        // onClose={onLabelPickerClose}
      >
        <IconButton
          backgroundColors={colors}
          icon="new_label"
          size={breakpoints.md ? 50 : 35}
          variant="filled"
        />
      </LabelPicker>
    </View>
  );
}

function BottomSheetContent({
  defaultValues,
  mutateList,
}: {
  defaultValues: CreateTaskDrawerProps["defaultValues"];
  mutateList: any;
}) {
  const breakpoints = useResponsiveBreakpoints();
  const { sessionToken } = useUser();
  const isDark = useDarkMode();
  const nameRef = useRef(null);
  const menuRef = useRef<BottomSheetModal>(null);
  const labelMenuRef = useRef<BottomSheetModal>(null);
  const theme = useColorTheme();
  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      dateOnly:
        typeof defaultValues.dateOnly === "boolean"
          ? defaultValues.dateOnly
          : true,
      name: defaultValues.name || "",
      date: defaultValues.date,
      pinned: defaultValues.pinned || false,
      label: defaultValues.label,
      storyPoints: defaultValues.storyPoints,
      collectionId: defaultValues.collectionId,
      attachments: [],
      note: "",
    },
  });

  useEffect(() => {
    nameRef.current.focus({ preventScroll: true });
  }, [nameRef, breakpoints]);

  const onSubmit = async (data) => {
    try {
      sendApiRequest(
        sessionToken,
        "POST",
        "space/entity",
        {},
        {
          body: JSON.stringify({
            ...data,
            name: data.name.replaceAll(/@\[(.*?)\]\((.*?)\)/g, "$1"),
            start: data?.date?.toISOString(),
            agendaOrder: defaultValues.agendaOrder,
            pinned: data.pinned,
            labelId: data.label?.id,
            type: "TASK",
            collectionId: data.label?.id ? null : data.collectionId,
          }),
        }
      )
        .then((e) => mutateList(e))
        .then((e) => console.log(e));
      reset(defaultValues);

      Toast.show({
        type: "success",
        text1: "Created task!",
      });
      nameRef.current.focus();
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later.",
      });
    }
  };

  const handleSubmitButtonClick = () => {
    handleSubmit(onSubmit, () =>
      Toast.show({
        type: "error",
        text1: "Type in a task name",
      })
    )();
  };

  const colors = {
    default: addHslAlpha(theme[9], 0.15),
    hovered: addHslAlpha(theme[9], 0.25),
    pressed: addHslAlpha(theme[9], 0.35),
  };

  return (
    <Pressable
      style={{
        minHeight: Platform.OS === "android" ? 280 : undefined,
        backgroundColor: addHslAlpha(
          theme[2],
          Platform.OS === "android" ? 1 : 0.5
        ),
      }}
    >
      <BlurView
        style={{ flex: 1, padding: 25, gap: 20, flexDirection: "column" }}
        intensity={Platform.OS === "android" ? 0 : 50}
        tint={
          isDark
            ? "systemUltraThinMaterialDark"
            : "systemUltraThinMaterialLight"
        }
      >
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            zIndex: 0,
          }}
        >
          <Footer
            menuRef={menuRef}
            setValue={setValue}
            watch={watch}
            nameRef={nameRef}
            labelMenuRef={labelMenuRef}
            control={control}
          />
          <TaskNameInput
            watch={watch}
            control={control}
            menuRef={menuRef}
            handleSubmitButtonClick={handleSubmitButtonClick}
            nameRef={nameRef}
            setValue={setValue}
          />
        </View>
        <TaskAttachments watch={watch} setValue={setValue} />
        <View
          style={{
            gap: 7,
            zIndex: Platform.OS === "web" ? -2 : undefined,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <CancelButton />
          <Attachment
            menuRef={menuRef}
            control={control}
            nameRef={nameRef}
            setValue={setValue}
          />
          <LabelButton
            watch={watch}
            setValue={setValue}
            defaultValues={defaultValues}
            colors={colors}
          />
          <DateButton
            watch={watch}
            setValue={setValue}
            defaultValues={defaultValues}
            colors={colors}
          />
          <PinTask watch={watch} control={control} />
          <SubmitButton onSubmit={handleSubmitButtonClick} />
        </View>
      </BlurView>
    </Pressable>
  );
}

export interface CreateTaskDrawerProps {
  children?: React.ReactNode;
  sheetRef?: RefObject<BottomSheetModal>;
  defaultValues?: {
    date?: Dayjs;
    agendaOrder?: string;
    collectionId?: string;
    label?: any;
    storyPoints?: number;
    dateOnly?: boolean;
    name?: string;
    pinned?: boolean;
  };
  onPress?: () => void;
  mutate: (newTask) => void;
}

const CreateTask = forwardRef(
  (
    {
      children,
      defaultValues = {
        date: null,
        agendaOrder: null,
        collectionId: null,
        storyPoints: 2,
        dateOnly: true,
      },
      onPress = () => {},
      mutate,
    }: CreateTaskDrawerProps,
    forwardedRef
  ) => {
    const ref = useRef<BottomSheetModal>(null);

    useImperativeHandle(forwardedRef, () => ref.current);

    // callbacks
    const handleOpen = useCallback(() => {
      onPress();
      ref.current?.present();
    }, [ref, onPress]);

    const { isReached } = useStorageContext();

    const trigger = cloneElement((children || <Pressable />) as any, {
      onPress: handleOpen,
      disabled: isReached,
    });

    const breakpoints = useResponsiveBreakpoints();
    const theme = useColorTheme();
    const { session } = useUser();
    if (!session) return null;

    return (
      <>
        {trigger}
        <Modal
          maxBackdropOpacity={0.1}
          maxWidth={breakpoints.md ? 700 : "100%"}
          sheetRef={ref}
          keyboardBehavior="interactive"
          animation={breakpoints.md ? "NONE" : "SLIDE"}
          innerStyles={{
            backgroundColor: Platform.OS === "web" ? "transparent" : theme[1],
          }}
        >
          <BottomSheetContent
            defaultValues={defaultValues}
            mutateList={mutate}
          />
        </Modal>
      </>
    );
  }
);

export default CreateTask;

