import LabelPicker from "@/components/labels/picker";
import { useLabelColors } from "@/components/labels/useLabelColors";
import { useStorageContext } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { ButtonText } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Calendar from "@/ui/Calendar";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  TouchableOpacity,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import dayjs, { Dayjs } from "dayjs";
import React, {
  RefObject,
  cloneElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Menu } from "react-native-popup-menu";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { RRule } from "rrule";
import { TaskAttachmentButton } from "../drawer/attachment/button";

const DueDatePicker = ({ watch, value, setValue }) => {
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const dateOnly = watch("dateOnly");
  const quickDates = useMemo(
    () => [
      { label: "Today", value: dayjs().startOf("day").utc() },
      { label: "Tomorrow", value: dayjs().add(1, "day").utc() },
      { label: "In 2 days", value: dayjs().add(2, "day").utc() },
      { label: "Next week", value: dayjs().add(1, "week").utc() },
    ],
    []
  );
  return (
    <View
      style={{
        flexDirection: breakpoints.md ? "row" : "column",
        gap: 10,
        padding: 10,
        paddingTop: 20,
        paddingHorizontal: 20,
      }}
    >
      <View
        style={{
          flex: breakpoints.md ? 1 : undefined,
          borderColor: theme[6],
          borderWidth: 2,
          borderRadius: 25,
        }}
      >
        <Calendar
          date={value}
          onDayPress={(date) => {
            setValue("date", dayjs(date.dateString, "YYYY-MM-DD"));
          }}
          markedDates={{
            [dayjs(value).format("YYYY-MM-DD")]: {
              selected: true,
              disableTouchEvent: true,
            },
          }}
        />
        <ScrollView
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
            paddingVertical: breakpoints.md ? undefined : 50,
            alignItems: "center",
            padding: 10,
            justifyContent: "center",
          }}
        >
          <Text weight={800} style={{ fontSize: 25 }}>
            {dayjs(value).format("dddd, MMMM Do")}
          </Text>
          <Text style={{ fontSize: 20, opacity: 0.6, marginBottom: 20 }}>
            {dayjs(value).isToday() ? "Today" : dayjs(value).fromNow()}
          </Text>
          <ListItemButton
            onPress={() => setValue("dateOnly", !dateOnly)}
            style={{ height: 40 }}
          >
            <ListItemText
              primaryProps={{ style: { color: theme[11] } }}
              primary={dateOnly ? "All day" : dayjs(value).format("h:mm A")}
            />
            <Icon size={30} style={!dateOnly && { opacity: 0.6 }}>
              toggle_{dateOnly ? "on" : "off"}
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
          <Text weight={200} style={{ fontSize: 25 }}>
            No date set
          </Text>
        </View>
      )}
    </View>
  );
};

function RecurrencePicker({ value, setValue }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const recurrenceRule = new RRule(
    value ||
      new RRule({
        freq: RRule.WEEKLY,
        byweekday: [dayjs().day() - 1],
      }).options
  );

  const [previewRange, setPreviewRange] = useState<Date>(new Date());

  useEffect(() => {
    setValue("date", null);
    if (!value) {
      setValue(
        "recurrenceRule",
        new RRule({
          freq: RRule.WEEKLY,
          byweekday: [dayjs().day() - 1],
        }).options
      );
    }
  }, [value, setValue]);

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
                value={value?.interval || 1}
                onChange={(e) => {
                  const t = e.nativeEvent.text;
                  if (parseInt(t) && parseInt(t) > 0)
                    handleEdit("interval", e.nativeEvent.text);
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
                  callback: () => handleEdit("freq", e.value),
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
            <Text variant="eyebrow" style={{ marginTop: 20, marginBottom: 5 }}>
              ON
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <MenuPopover
                menuProps={{ style: { flex: 1 } }}
                options={[
                  { text: "Sunday", value: 6 },
                  { text: "Monday", value: 0 },
                  { text: "Tuesday", value: 1 },
                  { text: "Wednesday", value: 2 },
                  { text: "Thursday", value: 3 },
                  { text: "Friday", value: 4 },
                  { text: "Saturday", value: 5 },
                ].map((e) => ({
                  ...e,
                  callback: () => {
                    handleEdit(
                      "byweekday",
                      (value.byweekday
                        ? value.byweekday.includes(e.value)
                          ? value.byweekday.filter((day) => day !== e.value)
                          : [...value.byweekday, e.value]
                        : []
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
                      primary={`${value?.byweekday?.length || 0} day${
                        value?.byweekday?.length === 1 ? "" : "s"
                      }`}
                      secondary="Select days"
                    />
                  </ListItemButton>
                }
              />
              {/* <MenuPopover
                options={[
                  {text:"January", value: RRule.},
                ]}
                menuProps={{ style: { flex: 1 } }}
                trigger={
                  <ListItemButton
                    style={{ height: 60, flex: 1 }}
                    variant="filled"
                  >
                    <Icon>calendar_today</Icon>
                    <ListItemText
                      truncate
                      primary="2 selected"
                      secondary="Select months"
                    />
                  </ListItemButton>
                }
              /> */}
            </View>
            <Text variant="eyebrow" style={{ marginTop: 20, marginBottom: 5 }}>
              Ends
            </Text>
            <ListItemButton style={{ height: 40 }} variant="filled">
              <Icon>radio_button_checked</Icon>
              <ListItemText truncate primary="Never" />
            </ListItemButton>
            <ListItemButton style={{ height: 40 }}>
              <Icon>radio_button_unchecked</Icon>
              <ListItemText truncate primary="On" />
              <TextField
                variant="outlined"
                placeholder="Date"
                style={{ padding: 4, borderRadius: 5 }}
              />
            </ListItemButton>
            <ListItemButton style={{ height: 40 }}>
              <Icon>radio_button_unchecked</Icon>
              <ListItemText truncate primary="After" />
              <TextField
                variant="outlined"
                placeholder="#"
                style={{ padding: 4, borderRadius: 5, width: 50 }}
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
                padding: 5,
                flex: 1,
              }}
            >
              <Calendar
                onMonthChange={(newMonth) => {
                  setPreviewRange(new Date(newMonth.timestamp));
                }}
                markedDates={recurrenceRule
                  .between(
                    dayjs(previewRange)
                      .startOf("month")
                      .subtract(1, "month")
                      .toDate(),
                    dayjs(previewRange).endOf("month").add(1, "month").toDate()
                  )
                  .reduce((acc, date) => {
                    acc[dayjs(date).format("YYYY-MM-DD")] = {
                      selected: true,
                      disableTouchEvent: true,
                    };
                    return acc;
                  }, {})}
              />
              <ScrollView horizontal contentContainerStyle={{ gap: 10 }}>
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

export function TaskDatePicker({ setValue, watch, children }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const sheetRef = useRef<BottomSheetModal>(null);
  const handleClose = useCallback(() => sheetRef.current?.close(), []);
  const handleOpen = useCallback(() => sheetRef.current?.present(), []);

  const dueDate = watch("date");
  const recurrence = watch("recurrenceRule");

  const [view, setView] = useState<"date" | "recurrence">("date");

  const trigger = cloneElement(
    children || (
      <Chip
        style={({ pressed, hovered }) => ({
          backgroundColor: theme[pressed ? 6 : hovered ? 5 : 4],
        })}
        icon={<Icon>{recurrence ? "loop" : "calendar_today"}</Icon>}
        label={
          recurrence
            ? capitalizeFirstLetter(new RRule(recurrence).toText())
            : dueDate
            ? dueDate.format("MMM Do")
            : undefined
        }
      />
    ),
    {
      onPress: handleOpen,
    }
  );

  return (
    <>
      {trigger}
      <BottomSheet
        snapPoints={["100%"]}
        sheetRef={sheetRef}
        onClose={handleClose}
        maxWidth={750}
        backgroundStyle={{ backgroundColor: "transparent" }}
        handleComponent={() => null}
      >
        <Pressable onPress={handleClose} style={{ flex: 1 }}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              marginTop: "auto",
              backgroundColor: theme[2],
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingVertical: 15,
            }}
          >
            <BottomSheetScrollView>
              <ButtonGroup
                options={[
                  { value: "date", label: "Date" },
                  { value: "recurrence", label: "Repeat" },
                ]}
                state={[view, setView]}
                containerStyle={{ marginBottom: breakpoints.md ? 0 : 20 }}
              />
              {view === "date" ? (
                <DueDatePicker
                  watch={watch}
                  setValue={setValue}
                  value={dueDate}
                />
              ) : (
                <RecurrencePicker setValue={setValue} value={recurrence} />
              )}
            </BottomSheetScrollView>
          </Pressable>
        </Pressable>
      </BottomSheet>
    </>
  );
}

function Footer({ nameRef, labelMenuRef, setValue, watch, control }) {
  const orange = useColor("orange");
  const theme = useColorTheme();
  const pinned = watch("pinned");

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

  return (
    <ScrollView
      horizontal
      style={{
        maxHeight: 60,
      }}
      contentContainerStyle={{
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: 15,
        paddingVertical: 10,
        gap: 5,
      }}
      showsHorizontalScrollIndicator={false}
    >
      <TaskDatePicker setValue={setValue} watch={watch} />
      <Controller
        control={control}
        name="pinned"
        defaultValue={false}
        render={({ field: { onChange, value } }) => (
          <Chip
            onPress={() => onChange(!value)}
            icon={
              <Animated.View style={rotateStyle}>
                <Icon
                  style={{
                    ...(value && {
                      color: orange[11],
                    }),
                  }}
                  filled={value}
                >
                  push_pin
                </Icon>
              </Animated.View>
            }
            style={{
              backgroundColor: theme[4],
              ...(value && {
                backgroundColor: orange[4],
                borderColor: orange[4],
              }),
            }}
          />
        )}
      />
      <CreateTaskLabelInput
        control={control}
        labelMenuRef={labelMenuRef}
        onLabelPickerClose={() => {
          nameRef?.current?.focus();
        }}
      />

      <TaskSuggestions watch={watch} setValue={setValue} />
    </ScrollView>
  );
}

function CreateTaskLabelInput({ control, labelMenuRef, onLabelPickerClose }) {
  const theme = useColorTheme();
  const colors = useLabelColors();

  return (
    <Controller
      control={control}
      name="label"
      defaultValue={false}
      render={({ field: { onChange, value } }) => (
        <LabelPicker
          label={value}
          setLabel={onChange}
          sheetProps={{
            sheetRef: labelMenuRef,
          }}
          autoFocus
          onClose={onLabelPickerClose}
        >
          <Chip
            style={({ pressed, hovered }) => ({
              backgroundColor: theme[pressed ? 6 : hovered ? 5 : 4],
            })}
            label={value?.name || "Add label"}
            icon={
              value?.emoji ? (
                <Emoji emoji={value?.emoji} />
              ) : (
                <Icon>new_label</Icon>
              )
            }
            {...(value && {
              style: {
                backgroundColor: colors[value?.color]?.[4],
              },
            })}
            colorTheme={value ? value?.color : undefined}
          />
        </LabelPicker>
      )}
    />
  );
}
function TaskNameInput({
  control,
  dateMenuRef,
  handleSubmitButtonClick,
  menuRef,
  nameRef,
  labelMenuRef,
  setValue,
}: {
  control: any;
  dateMenuRef: React.MutableRefObject<Menu>;
  handleSubmitButtonClick: any;
  menuRef: React.MutableRefObject<BottomSheetModal>;
  nameRef: any;
  labelMenuRef: React.MutableRefObject<BottomSheetModal>;
  setValue: any;
}) {
  const theme = useColorTheme();
  const { forceClose } = useBottomSheet();

  useEffect(() => {
    Keyboard.addListener("keyboardWillHide", () => {
      setTimeout(() => nameRef.current.focusInputWithKeyboard(), 0);
    });
  }, [nameRef]);

  return (
    <Controller
      control={control}
      rules={{
        required: true,
      }}
      render={({ field: { onChange, onBlur, value } }) => (
        <BottomSheetTextInput
          enterKeyHint="done"
          selectionColor={theme[8]}
          cursorColor={theme[9]}
          autoFocus={Platform.OS !== "web"}
          ref={nameRef}
          placeholder="Type / for commands"
          onBlur={onBlur}
          onKeyPress={(e: any) => {
            if (e.key === "/") {
              e.preventDefault();
              menuRef.current.present();
            }
            if (e.key === "@") {
              e.preventDefault();
              dateMenuRef.current.open();
            }
            if (e.key === "#") {
              e.preventDefault();
              labelMenuRef.current.present();
            }
            if (e.key === "Enter") {
              handleSubmitButtonClick();
            }
            if (e.key === "Escape") {
              if (value) return onChange("");
              forceClose();
            }
          }}
          onChangeText={(e) => {
            onChange(e.replaceAll("\n", ""));
            if (
              e.includes("!!") ||
              (e === e.toUpperCase() && e.trim().length > 4)
            ) {
              setValue("pinned", true);
            } else if (e === "") {
              setValue("pinned", false);
            }
          }}
          value={value}
          placeholderTextColor={theme[5]}
          multiline
          style={{
            color: theme[11],
            fontFamily: "body_700",
            shadowRadius: 0,
            fontSize: 25,
            paddingHorizontal: 20,
            paddingBottom: 55,
            flex: 1,
            textAlignVertical: "top",
            ...(Platform.OS === "web" && ({ outlineStyle: "none" } as any)),
          }}
        />
      )}
      name="name"
    />
  );
}

const drawerStyles = StyleSheet.create({
  attachmentCard: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 20,
    width: 200,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 70,
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    top: -5,
    right: -5,
    zIndex: 10,
    borderRadius: 7,
    borderWidth: 5,
  },
});

const TaskSuggestions = ({ watch, setValue }) => {
  const theme = useColorTheme();
  const name = watch("name");
  const currentDate = watch("date");
  const currentRecurrenceRule = watch("recurrenceRule");

  const generateChipLabel = useCallback(() => {
    if (!name) return null;
    const regex = /(?:at|from|during|after|before)\s(\d+)/i;
    const match = name.match(regex);

    if (match) {
      const time = match[1];
      let amPm = name.toLowerCase().includes("p") ? "pm" : "am";

      if (
        !name.toLowerCase().includes("am") &&
        !name.toLowerCase().includes("pm")
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

      if (Number(time) > 12) return null;
      if (
        dayjs(currentDate).hour() ===
          Number(time) + (amPm === "pm" && time !== "12" ? 12 : 0) ||
        name.includes("every")
      )
        return null;
      return {
        label: `At ${time} ${amPm}`,
        onPress: () => {
          setValue(
            "date",
            dayjs(currentDate)
              .hour(Number(time) + (amPm === "pm" && time !== "12" ? 12 : 0))
              .minute(0)
          );
          setValue("dateOnly", false);
        },
        icon: "magic_button",
      };
    }
  }, [name, setValue, currentDate]);

  const generateRecurrenceLabel = useCallback(() => {
    try {
      if (!name.includes("every")) return null;
      const split = name.toLowerCase().toString().split("every ");
      const text = "Every " + split[split[1] ? 1 : 0];

      const rule = RRule.fromText(text);

      if (currentRecurrenceRule?.toText() === rule.toText()) return null;

      return {
        label: capitalizeFirstLetter(rule.toText()),
        onPress: () => {
          setValue("date", null);
          setValue("recurrenceRule", rule.options);
        },
        icon: "magic_button",
      };
    } catch (e) {
      return null;
    }
  }, [name, setValue, currentRecurrenceRule]);

  const suggestions = [generateChipLabel(), generateRecurrenceLabel()];

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

const TaskAttachments = ({ watch, setValue }) => {
  const theme = useColorTheme();
  const attachments = watch("attachments");
  const note = watch("note");

  return (
    attachments?.length > 0 && (
      <ScrollView
        horizontal
        style={{
          marginLeft: 20,
          marginTop: "auto",
          maxHeight: 90,
        }}
        contentContainerStyle={{ alignItems: "center", gap: 15 }}
        showsHorizontalScrollIndicator={false}
      >
        {note && (
          <View
            style={[drawerStyles.attachmentCard, { backgroundColor: theme[3] }]}
          >
            <IconButton
              icon="close"
              size={30}
              variant="filled"
              onPress={() => setValue("note", "")}
              style={[drawerStyles.closeIcon, { borderColor: theme[2] }]}
            />
            <Avatar icon="sticky_note_2" />
            <View style={{ flex: 1, flexDirection: "column" }}>
              <Text variant="eyebrow">Note</Text>
              <Text numberOfLines={1}>{note}</Text>
            </View>
          </View>
        )}
        {attachments.map((attachment, i) => (
          <View
            key={i}
            style={[drawerStyles.attachmentCard, { backgroundColor: theme[3] }]}
          >
            <IconButton
              icon="close"
              size={30}
              variant="filled"
              onPress={() => {
                setValue(
                  "attachments",
                  attachments.filter((_, index) => index !== i)
                );
              }}
              style={[drawerStyles.closeIcon, { borderColor: theme[2] }]}
            />
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
              <Text numberOfLines={1}>
                {attachment.type === "IMAGE"
                  ? attachment.data.split("/")[4]
                  : attachment.data}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    )
  );
  // return null;
};

function BottomSheetContent({ nameRef, defaultValues, mutateList }) {
  const breakpoints = useResponsiveBreakpoints();
  const { sessionToken } = useUser();
  const { forceClose } = useBottomSheet();
  const menuRef = useRef<BottomSheetModal>(null);
  const labelMenuRef = useRef<BottomSheetModal>(null);
  const dateMenuRef = useRef<Menu>(null);
  const theme = useColorTheme();
  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      dateOnly: true,
      name: defaultValues.name || "",
      date: defaultValues.date || dayjs().utc(),
      pinned: false,
      label: defaultValues.label,
      collectionId: defaultValues.collectionId,
      attachments: [],
      note: "",
    },
  });

  useEffect(() => {
    if (Platform.OS === "web") {
      setTimeout(
        () => {
          nameRef.current.focus();
        },
        breakpoints.md ? 100 : 500
      );
    }
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
            due: data?.date?.toISOString(),
            agendaOrder: defaultValues.agendaOrder,
            pinned: data.pinned,
            ...(data.recurrenceRule && {
              recurrenceRule: new RRule(data.recurrenceRule).toString(),
            }),
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

  return (
    <Pressable
      onPress={(e) => e.stopPropagation()}
      style={{
        height: 320,
        maxWidth: "100%",
        width: 700,
        borderRadius: 20,
        backgroundColor: theme[2],
        borderWidth: 1,
        borderColor: theme[6],
        shadowColor: "rgba(0, 0, 0, 0.12)",
        margin: "auto",
        shadowOffset: { width: 20, height: 20 },
        shadowRadius: 40,
        padding: 10,
        paddingHorizontal: 20,
      }}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            gap: 10,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={{
              paddingVertical: 10,
              paddingHorizontal: 5,
            }}
            onPress={() => forceClose()}
          >
            <ButtonText style={{ color: theme[10] }} weight={300}>
              Cancel
            </ButtonText>
          </TouchableOpacity>
          <MenuPopover
            menuProps={{
              style: {
                marginLeft: "auto",
                marginRight: "auto",
              },
            }}
            options={[
              { text: "Task", icon: "check_circle" },
              { text: "Note", icon: "sticky_note_2" },
            ]}
            trigger={
              <Pressable
                style={{ alignItems: "center", flexDirection: "row", gap: 3 }}
              >
                <Text variant="eyebrow">Task</Text>
                <Icon style={{ color: theme[11] }}>expand_more</Icon>
              </Pressable>
            }
          />
          <IconButton
            size={breakpoints.md ? 55 : 45}
            variant="outlined"
            icon="north"
            onPress={handleSubmitButtonClick}
          />
        </View>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <Controller
            name="attachments"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <TaskAttachmentButton
                  menuRef={menuRef}
                  onClose={() => nameRef.current.focus()}
                  onOpen={() => nameRef.current.focus()}
                  task={{
                    attachments: value,
                  }}
                  updateTask={(key, value) => {
                    if (key !== "note") {
                      onChange(value);
                    } else {
                      setValue("note", value);
                    }
                  }}
                >
                  <IconButton
                    style={({ pressed, hovered }) => ({
                      marginTop: 63,
                      backgroundColor: theme[pressed ? 6 : hovered ? 5 : 4],
                    })}
                    icon="add"
                    variant="filled"
                    size={35}
                  />
                </TaskAttachmentButton>
              </>
            )}
          />
          <View style={{ flex: 1 }}>
            <Footer
              setValue={setValue}
              watch={watch}
              nameRef={nameRef}
              labelMenuRef={labelMenuRef}
              control={control}
            />
            <TaskNameInput
              labelMenuRef={labelMenuRef}
              control={control}
              menuRef={menuRef}
              handleSubmitButtonClick={handleSubmitButtonClick}
              nameRef={nameRef}
              dateMenuRef={dateMenuRef}
              setValue={setValue}
            />
            <TaskAttachments watch={watch} setValue={setValue} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function CreateTask({
  children,
  sheetRef,
  defaultValues = {
    date: dayjs().utc(),
    agendaOrder: null,
    collectionId: null,
  },
  mutate,
}: {
  children?: any;
  sheetRef?: RefObject<BottomSheetModal>;
  defaultValues?: {
    date?: Dayjs;
    agendaOrder?: string;
    collectionId?: string;
    label?: any;
  };
  mutate: (newTask) => void;
}) {
  const ref = useRef<BottomSheetModal>(null);
  const nameRef = useRef(null);

  // callbacks
  const handleOpen = useCallback(() => {
    ref.current?.present();
  }, []);

  const handleClose = useCallback(() => {
    ref.current?.close();
    mutate?.(null);
  }, [mutate]);

  const { isReached } = useStorageContext();

  const trigger = useMemo(
    () =>
      cloneElement(children || <Pressable />, {
        onPress: handleOpen,
        disabled: isReached,
      }),
    [handleOpen, children, isReached]
  );

  const breakpoints = useResponsiveBreakpoints();

  return (
    <>
      {trigger}
      <BottomSheet
        onClose={handleClose}
        sheetRef={sheetRef || ref}
        snapPoints={["100%"]}
        maxWidth="100%"
        keyboardBehavior="interactive"
        backgroundStyle={{ backgroundColor: "transparent" }}
        handleComponent={null}
        maxBackdropOpacity={0.1}
        {...(breakpoints.md && {
          animationConfigs: {
            overshootClamping: true,
            duration: 0.0001,
          },
        })}
      >
        <Pressable
          onPress={() => (sheetRef || ref).current.forceClose()}
          style={{
            alignItems: "center",
            flex: 1,
            padding: breakpoints.md ? 10 : 20,
            justifyContent: "center",
          }}
        >
          <BottomSheetContent
            defaultValues={defaultValues}
            nameRef={nameRef}
            mutateList={mutate}
          />
        </Pressable>
      </BottomSheet>
    </>
  );
}
