import ChipInput from "@/components/ChipInput";
import LabelPicker from "@/components/labels/picker";
import { useLabelColors } from "@/components/labels/useLabelColors";
import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import { useStorageContext } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import AutoSizeTextArea from "@/ui/AutoSizeTextArea";
import { Avatar } from "@/ui/Avatar";
import Chip from "@/ui/Chip";
import { DatePicker } from "@/ui/DatePicker";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Modal from "@/ui/Modal";
import { RecurrencePicker } from "@/ui/RecurrencePicker";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { addHslAlpha, useColor, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal, useBottomSheet } from "@gorhom/bottom-sheet";
import dayjs, { Dayjs } from "dayjs";
import { BlurView } from "expo-blur";
import { useGlobalSearchParams, usePathname } from "expo-router";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import React, {
  cloneElement,
  forwardRef,
  memo,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, Platform, Pressable, View } from "react-native";
import Collapsible from "react-native-collapsible";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { RRule } from "rrule";
import useSWR from "swr";
import { TaskAttachmentButton } from "../drawer/attachment/button";

const PinTask = memo(function PinTask({ watch, control }: any) {
  const orange = useColor("orange");
  const pinned = watch("pinned");
  const breakpoints = useResponsiveBreakpoints();

  const rotate = useSharedValue(0);

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
          iconStyle={{
            transform: [{ rotate: "-30deg" }],
            color: value ? orange[11] : theme[11],
          }}
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

function Footer({
  nameRef,
  labelMenuRef,
  setValue,
  watch,
  control,
  dateRef,
  recurrenceRef,
  handleSubmitButtonClick,
  hintRef,
}: {
  nameRef: any;
  labelMenuRef: React.MutableRefObject<BottomSheetModal>;
  setValue: any;
  watch: any;
  control: any;
  dateRef: React.MutableRefObject<BottomSheetModal>;
  recurrenceRef: React.MutableRefObject<BottomSheetModal>;
  handleSubmitButtonClick;
  hintRef;
}) {
  const theme = useColorTheme();
  const recurrenceRule = watch("recurrenceRule");
  const collectionId = watch("collectionId");
  const date = watch("date");
  const dateOnly = watch("dateOnly");
  const label = watch("label");
  const parentTask = watch("parentTask");

  return (
    <View
      style={{
        paddingBottom: 10,
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
        <SpeechRecognition
          handleSubmitButtonClick={handleSubmitButtonClick}
          setValue={setValue}
          hintRef={hintRef}
        />
        {(date || recurrenceRule) && !parentTask && (
          <Chip
            outlined
            icon={<Icon>{recurrenceRule ? "loop" : "calendar_today"}</Icon>}
            onDismiss={
              (recurrenceRule || date) &&
              (() => {
                setValue("date", null);
                setValue("recurrenceRule", null);
              })
            }
            onPress={() => {
              if (date) dateRef.current.present();
              else if (recurrenceRule) recurrenceRef.current.present();
            }}
            style={({ pressed, hovered }) => ({
              borderWidth: 1,
              borderColor: addHslAlpha(
                theme[9],
                pressed ? 0.3 : hovered ? 0.2 : 0.1
              ),
            })}
            label={
              recurrenceRule
                ? capitalizeFirstLetter(new RRule(recurrenceRule).toText())
                : date
                ? date.format(dateOnly ? "MMM Do" : "MMM Do [@] h:mm a")
                : undefined
            }
          />
        )}
        {(label || collectionId) && !parentTask && (
          <CreateTaskLabelInput
            setValue={setValue}
            watch={watch}
            collectionId={collectionId}
            control={control}
            labelMenuRef={labelMenuRef}
            onLabelPickerClose={() => {
              nameRef?.current?.focus();
            }}
          />
        )}
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
  setValue,
}: any) {
  const theme = useColorTheme();
  const colors = useLabelColors();
  const label = watch("label");
  const animation = useSharedValue(1);
  const { data: collectionData } = useSWR(["space/collections"]);

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
          >
            {label ? (
              <Chip
                colorTheme={value?.color}
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
            ) : (
              collectionId && (
                <Chip
                  icon={
                    collectionData ? (
                      <Emoji
                        emoji={
                          collectionData?.find((e) => e.id === collectionId)
                            ?.emoji
                        }
                      />
                    ) : (
                      <Spinner />
                    )
                  }
                  onDismiss={() => setValue("collectionId", null)}
                  style={({ pressed, hovered }) => ({
                    borderWidth: 1,
                    borderColor: addHslAlpha(
                      colors[value?.color]?.[9] || theme[9],
                      pressed ? 0.3 : hovered ? 0.2 : 0.1
                    ),
                  })}
                  label={
                    collectionData
                      ? collectionData.find((e) => e.id === collectionId)?.name
                      : "Loading..."
                  }
                />
              )
            )}
          </LabelPicker>
        )}
      />
    </Animated.View>
  );
});

function NlpProcessor({
  watch,
  value,
  setValue,
  onChange,
  suggestions,
}: {
  watch: any;
  value: string;
  setValue: any;
  onChange: any;
  suggestions: any;
}) {
  const dateValue = watch("date");

  useEffect(() => {
    if (value.includes("\n")) {
      onChange(value.replaceAll("\n", ""));
    }
    const replacementString = Platform.OS === "web" ? "@" : "/";
    suggestions.forEach((suggestion) => {
      if (
        value.includes(suggestion.name) &&
        !value.includes(
          `${replacementString}[${suggestion.name}](${suggestion.id})`
        )
      ) {
        setValue(suggestion.value[0], suggestion.value[1]);
        onChange(
          value.replace(
            suggestion.name,
            `${replacementString}[${suggestion.name}](${suggestion.id})`
          )
        );
      }
    });
    const regex =
      /(?:at|from|during|after|before|by)\s((1[0-2]|0?[1-9])(?::([0-5][0-9]))?(am|pm)?)\s/i;
    if (
      dayjs(dateValue).isValid() &&
      value.match(regex) &&
      !value.includes("](time-prediction)")
    ) {
      const match = value.match(regex);
      // 0: "at 10:00pm ", 1: "10:00", 2: "10", 3: "00", 4: "pm"
      const [_, time, hour, minutes] = match;
      let amPm = match[4];

      if (!amPm) {
        // make these values sensitive to a typical human day
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
        }[hour];
      }

      onChange(
        value.replace(
          match[0],
          `${replacementString}[${match[0]}](time-prediction)`
        )
      );

      setValue("dateOnly", false);
      setValue(
        "date",
        dayjs(dateValue)
          .hour((Number(hour) % 12) + (amPm === "pm" ? 12 : 0))
          .minute(Number(minutes) || 0)
          .second(0)
          .millisecond(0)
      );
    }

    if (value.includes(" ](time-prediction)")) {
      onChange(value.replace(" ](time-prediction)", "](time-prediction) "));
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
  }, [value, suggestions, onChange, dateValue, setValue]);

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

const TimeSuggestion = forwardRef(
  ({
    value,
    hintRef,
    watch,
    isDirty,
  }: {
    value: any;
    hintRef: any;
    watch;
    isDirty;
  }) => {
    const hasTypedRef = useRef(false);
    const date = watch("date");
    const label = watch("label");
    const parentTask = watch("parentTask");
    const collectionId = watch("collectionId");
    const pathname = usePathname();
    const { type, id } = useGlobalSearchParams();

    useEffect(() => {
      if (Platform.OS === "web") {
        if (value !== "") hasTypedRef.current = true;

        const regex =
          /(?:at|from|during|after|before|by)\s((1[0-2]|0?[1-9])(?::([0-5][0-9]))?(am|pm)?)/i;

        hintRef.current.setMessage(
          value.match(regex) && !value.includes("](time-prediction)") && date
            ? {
                text: "Typing a date? Hit [space] to confirm",
                icon: "emoji_objects",
              }
            : Object.keys(COLLECTION_VIEWS).find(
                (e) => e === type && COLLECTION_VIEWS[e].type === "Time Based"
              ) &&
              !date &&
              !parentTask
            ? {
                text: `This task won't appear in ${type} view without a date`,
                icon: "info",
              }
            : Object.keys(COLLECTION_VIEWS).find(
                (e) =>
                  e === type && COLLECTION_VIEWS[e].type === "Category Based"
              ) &&
              !label &&
              !parentTask &&
              type !== "list" &&
              collectionId
            ? {
                text: `Since this task doesn't have a label, it'll appear in a special "Unlabeled" category`,
                icon: "info",
              }
            : !label && id !== "all" && !collectionId
            ? {
                text: 'This task will appear in your "All tasks" view since it isn\'t part of any collection',
                icon: "info",
              }
            : isDirty && !value
            ? {
                text: "Hit [backspace] to reset",
                icon: "magic_button",
              }
            : !localStorage.getItem("attachmentSuggestion")
            ? {
                text: "Type @ to attach something!",
                icon: "emoji_objects",
              }
            : !localStorage.getItem("importantSuggestion")
            ? {
                text: 'Type "!!" to mark as important',
                icon: "emoji_objects",
              }
            : !localStorage.getItem("noteSuggestion")
            ? {
                text: "Hit shift+enter to add a note",
                icon: "emoji_objects",
              }
            : !localStorage.getItem("tagSuggestion")
            ? {
                text: "Type # to add a tag",
                icon: "emoji_objects",
              }
            : !localStorage.getItem("tmwSuggestion")
            ? {
                text: `Type "tmw" to set a due date for tomorrow`,
                icon: "emoji_objects",
              }
            : false
        );
      }
    }, [value, hintRef, date, label, pathname, type, isDirty, parentTask]);
    return null;
  }
);

function TaskNameInput({
  control,
  handleSubmitButtonClick,
  menuRef,
  nameRef,
  setValue,
  watch,
  reset,
  submitRef,
  hintRef,
  descriptionRef,
}: {
  control: any;
  handleSubmitButtonClick: any;
  menuRef: React.MutableRefObject<BottomSheetModal>;
  nameRef: any;
  setValue: any;
  watch;
  reset;
  submitRef;
  hintRef;
  descriptionRef;
}) {
  const attachments = watch("attachments");
  const { forceClose } = useBottomSheet();
  const { data: labelData } = useSWR(["space/labels"]);
  const note = watch("note");

  const suggestions = useMemo(
    () => [
      { id: "1", name: "tmw", value: ["date", dayjs().add(1, "day")] },
      { id: "2", name: "today", value: ["date", dayjs()] },
      { id: "3", name: "!!", value: ["pinned", true] },
      { id: "4", name: "tomorrow", value: ["date", dayjs().add(1, "day")] },
      { id: "5", name: "important", value: ["pinned", true] },
      { id: "6", name: "eod", value: ["date", dayjs().endOf("day")] },
      { id: "7", name: "eow", value: ["date", dayjs().endOf("week")] },
      { id: "8", name: "eom", value: ["date", dayjs().endOf("month")] },
      { id: "9", name: "eoy", value: ["date", dayjs().endOf("year")] },
      { id: "10", name: "EOD", value: ["date", dayjs().endOf("day")] },
      { id: "11", name: "EOW", value: ["date", dayjs().endOf("week")] },
      { id: "12", name: "EOM", value: ["date", dayjs().endOf("month")] },
      { id: "13", name: "EOY", value: ["date", dayjs().endOf("year")] },
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
      render={({
        field: { onChange, onBlur, value },
        formState: { isDirty },
      }) => (
        <>
          <NlpProcessor
            watch={watch}
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
            <TimeSuggestion
              isDirty={isDirty}
              watch={watch}
              value={value}
              hintRef={hintRef}
            />
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
                        submitRef.current.setDisabled(true);
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
                          submitRef.current.setDisabled(false);
                          Toast.hide();
                          Toast.show({
                            type: "error",
                            text1: "Failed to upload",
                            text2: res.error.message,
                          });
                        } else {
                          setValue("attachments", [
                            ...attachments,
                            { type: "IMAGE", data: res.image.display_url },
                          ]);

                          submitRef.current.setDisabled(false);
                          Toast.hide();
                          Toast.show({
                            type: "success",
                            text1: "Image uploaded!",
                          });
                        }
                      }
                    }

                    if (
                      e.clipboardData
                        .getData("text/plain")
                        .match(/!?\[.*\]\(.*\)/)
                    ) {
                      e.preventDefault();
                      e.stopPropagation();
                      const url = e.clipboardData
                        .getData("text/plain")
                        .match(/!\[.*\]\((.*)\)/)[1];
                      setValue("attachments", [
                        ...attachments,
                        { type: "IMAGE", data: url },
                      ]);
                    }
                  },
                }),
                [Platform.OS === "web" ? "onKeyDown" : "onKeyPress"]: (e) => {
                  if (
                    !e.shiftKey &&
                    (e.key === "Enter" || e.nativeEvent.key === "Enter")
                  ) {
                    if (value.replaceAll("\n", "").trim())
                      handleSubmitButtonClick();
                  } else if (
                    e.shiftKey &&
                    (e.key === "Enter" || e.nativeEvent.key === "Enter")
                  ) {
                    e.preventDefault();
                    descriptionRef.current.show();
                    if (Platform.OS === "web")
                      localStorage.setItem("noteSuggestion", "true");
                  }
                  if (e.key === "@") {
                    e.preventDefault();
                    if (Platform.OS === "web")
                      localStorage.setItem("attachmentSuggestion", "true");
                    nameRef.current?.blur();
                    menuRef.current?.present();
                  }

                  if (e.key === "Escape") {
                    if (value) return onChange("");
                    forceClose();
                  }
                  if (e.key === "Backspace" && value === "") {
                    reset();
                    if (hintRef.current.message === "Hit [backspace] to reset")
                      hintRef.current.setMessage(false);
                  }
                  if (Platform.OS === "web") {
                    if (value.includes("!!")) {
                      localStorage.setItem("importantSuggestion", "true");
                      hintRef.current.setMessage(false);
                    }
                    if (value.includes("tmw")) {
                      localStorage.setItem("tmwSuggestion", "true");
                    }
                    if (e.key === "#") {
                      localStorage.setItem("tagSuggestion", "true");
                    }
                  }
                },
              }}
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
              setValue={onChange}
            />
          </View>
        </>
      )}
    />
  );
}

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

const SubmitButton = forwardRef(({ onSubmit }: any, ref) => {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  const [disabled, setDisabled] = useState(false);

  useImperativeHandle(ref, () => ({
    isDisabled: () => disabled,
    setDisabled: (t) => setDisabled(t),
  }));

  return (
    <IconButton
      disabled={disabled}
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

function DateButton({
  watch,
  colors,
  dateRef,
  recurrenceRef,
  defaultValues,
  setValue,
}: any) {
  const breakpoints = useResponsiveBreakpoints();
  const recurrenceRule = watch("recurrenceRule");

  const date = watch("date");
  const end = watch("end");
  const dateOnly = watch("dateOnly");
  const parentTask = watch("parentTask");

  return parentTask ? null : (
    <View
      style={{
        display: date || recurrenceRule ? "none" : "flex",
      }}
    >
      <DatePicker
        ref={dateRef}
        value={{ date, dateOnly, end }}
        setValue={setValue}
      />
      <RecurrencePicker
        ref={recurrenceRef}
        value={recurrenceRule}
        setValue={(t: any) => setValue("recurrenceRule", t)}
      />
      <MenuPopover
        menuProps={{ rendererProps: { placement: "top" } }}
        options={[
          {
            text: "Set recurrence",
            icon: "loop",
            callback: () => recurrenceRef.current.present(),
          },
          {
            text: "Set due date",
            icon: "today",
            callback: () => dateRef.current.present(),
          },
        ]}
        trigger={
          <IconButton
            backgroundColors={colors}
            icon="calendar_today"
            size={breakpoints.md ? 50 : 35}
            variant="filled"
          />
        }
      />
    </View>
  );
}

function LabelButton({ watch, colors, defaultValues, setValue }: any) {
  const value = watch("label");
  const breakpoints = useResponsiveBreakpoints();
  const collectionId = watch("collectionId");
  const labelMenuRef = useRef<BottomSheetModal>(null);
  const parentTask = watch("parentTask");

  return parentTask ? null : (
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

function SubTaskInformation({ watch, setValue }) {
  const parentTask = watch("parentTask");
  const theme = useColorTheme();

  return (
    <View
      style={{
        marginTop: -25,
        marginHorizontal: -25,
      }}
    >
      <Collapsible
        collapsed={!parentTask}
        duration={200}
        style={{
          backgroundColor: addHslAlpha(theme[9], 0.15),
        }}
      >
        <View
          style={{
            gap: 20,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
        >
          <Icon bold style={{ color: theme[11] }}>
            subdirectory_arrow_right
          </Icon>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text weight={900} style={{ color: theme[11], fontSize: 16 }}>
              Creating subtask
            </Text>
            <Text
              style={{ opacity: 0.7, fontSize: 13, color: theme[11] }}
              weight={300}
              numberOfLines={1}
            >
              {parentTask?.name}
            </Text>
          </View>
        </View>
      </Collapsible>
    </View>
  );
}

const TaskDescriptionInput = forwardRef(
  ({ watch, control }: { watch; control }, ref) => {
    const theme = useColorTheme();
    const [open, setOpen] = useState(false);
    const noteRef = useRef(null);
    const note = watch("note");

    useImperativeHandle(ref, () => ({
      show: () => {
        setOpen(true);
        noteRef.current.focus();
      },
    }));

    return (
      <Collapsible collapsed={!open && !note}>
        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, value } }) => (
            <AutoSizeTextArea
              multiline
              placeholder="Enter a description..."
              ref={noteRef}
              value={value}
              onChange={onChange}
              fontSize={17}
              style={{
                fontSize: 17,
                paddingHorizontal: 3,
                opacity: 0.5,
                fontFamily: "body_300",
                color: theme[11],
              }}
              onBlur={() => {
                if (!value) setOpen(false);
              }}
            />
          )}
        />
      </Collapsible>
    );
  }
);

function SpeechRecognition({ setValue, hintRef, handleSubmitButtonClick }) {
  const theme = useColorTheme();
  const red = useColor("red");
  const [recognizing, setRecognizing] = useState(false);

  useSpeechRecognitionEvent("start", () => {
    hintRef.current.setMessage({
      text: "Listening...",
      icon: "mic",
    });
    setRecognizing(true);
  });
  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
    handleSubmitButtonClick();
  });
  useSpeechRecognitionEvent("result", (event) => {
    setValue(
      "name",
      event.results[0]?.transcript?.endsWith(".")
        ? event.results[0]?.transcript.slice(0, -1).trim()
        : event.results[0]?.transcript?.trim()
    );
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.log("error code:", event.error, "error messsage:", event.message);
  });

  const handleStart = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      return;
    }
    // Start speech recognition
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      maxAlternatives: 1,
      continuous: false,
      requiresOnDeviceRecognition: false,
      addsPunctuation: false,
      volumeChangeEventOptions: {
        enabled: true,
        intervalMillis: 300,
      },
      contextualStrings: ["Dysperse"],
    });
  };

  return (
    <Chip
      icon={
        <Icon filled={recognizing} style={recognizing && { color: red[2] }}>
          mic
        </Icon>
      }
      outlined
      style={({ pressed, hovered }) => ({
        borderWidth: 1,
        marginRight: "auto",
        borderColor: addHslAlpha(
          recognizing ? red[9] : theme[9],
          pressed ? 0.3 : hovered ? 0.2 : 0.1
        ),
        backgroundColor: recognizing ? red[9] : undefined,
      })}
      onPress={recognizing ? ExpoSpeechRecognitionModule.stop : handleStart}
    />
  );
}

const BottomSheetContent = forwardRef(
  (
    {
      defaultValues,
      mutateList,
      hintRef,
    }: {
      defaultValues: CreateTaskDrawerProps["defaultValues"];
      mutateList: any;
      hintRef;
    },
    formRef
  ) => {
    const breakpoints = useResponsiveBreakpoints();
    const { sessionToken } = useUser();
    const isDark = useDarkMode();
    const nameRef = useRef(null);
    const dateRef = useRef(null);
    const recurrenceRef = useRef(null);
    const submitRef = useRef(null);
    const menuRef = useRef<BottomSheetModal>(null);
    const labelMenuRef = useRef<BottomSheetModal>(null);
    const descriptionRef = useRef(null);
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
        parentTask: defaultValues.parentTask,
        label: defaultValues.label,
        storyPoints: defaultValues.storyPoints,
        collectionId: defaultValues.collectionId,
        attachments: [],
        note: "",
      },
    });

    useImperativeHandle(formRef, () => ({ setValue }));

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
              name: data.name.replaceAll(/[@/]\[(.*?)\]\((.*?)\)/g, "$1"),
              start: data?.date?.toISOString(),
              agendaOrder: defaultValues.agendaOrder,
              pinned: data.pinned,
              labelId: data.label?.id,
              type: "TASK",
              parentTask: undefined,
              parentId: data.parentTask?.id,
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
      if (!submitRef.current.isDisabled())
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
          <SubTaskInformation watch={watch} setValue={setValue} />
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              zIndex: 0,
              minHeight: 130,
            }}
          >
            <Footer
              hintRef={hintRef}
              handleSubmitButtonClick={handleSubmitButtonClick}
              dateRef={dateRef}
              recurrenceRef={recurrenceRef}
              setValue={setValue}
              watch={watch}
              nameRef={nameRef}
              labelMenuRef={labelMenuRef}
              control={control}
            />
            <TaskNameInput
              descriptionRef={descriptionRef}
              hintRef={hintRef}
              submitRef={submitRef}
              reset={reset}
              watch={watch}
              control={control}
              menuRef={menuRef}
              handleSubmitButtonClick={handleSubmitButtonClick}
              nameRef={nameRef}
              setValue={setValue}
            />
            <TaskDescriptionInput
              control={control}
              watch={watch}
              ref={descriptionRef}
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
              dateRef={dateRef}
              recurrenceRef={recurrenceRef}
              colors={colors}
            />
            <PinTask watch={watch} control={control} />
            <SubmitButton ref={submitRef} onSubmit={handleSubmitButtonClick} />
          </View>
        </BlurView>
      </Pressable>
    );
  }
);

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
    parentTask?: any;
  };
  onPress?: () => void;
  mutate: (newTask) => void;
}

const CreateTaskOuterContent = forwardRef((props, ref) => {
  const isDark = useDarkMode();
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const [message, setMessage] = useState<null | { icon: any; text: any }>(null);

  useImperativeHandle(ref, () => ({
    message,
    setMessage,
  }));

  const animation = useSharedValue(0);
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(animation.value, {
          damping: 23,
          stiffness: 300,
        }),
      },
    ],
  }));

  useEffect(() => {
    if (message) animation.value = 1;

    return () => {
      animation.value = 0;
    };
  }, [message, animation]);

  return (
    message &&
    breakpoints.md && (
      <Animated.View
        style={[
          animatedStyles,
          {
            position: "absolute",
            bottom: -55,
            width: "100%",
            left: 0,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <BlurView
          style={{
            flex: 1,
            paddingHorizontal: 15,
            paddingVertical: 7,
            borderRadius: 20,
            alignItems: "center",
            gap: 10,
            flexDirection: "row",
          }}
          intensity={Platform.OS === "android" ? 0 : 50}
          tint={
            isDark
              ? "systemUltraThinMaterialDark"
              : "systemUltraThinMaterialLight"
          }
        >
          <Icon style={{ opacity: 0.5 }}>{message.icon}</Icon>
          <Text style={{ color: theme[11], opacity: 0.5 }}>{message.text}</Text>
        </BlurView>
      </Animated.View>
    )
  );
});

const CreateTask = forwardRef(
  (
    {
      children,
      defaultValues = {
        date: null,
        agendaOrder: null,
        collectionId: null,
        dateOnly: true,
      },
      onPress = () => {},
      mutate,
    }: CreateTaskDrawerProps,
    forwardedRef
  ) => {
    const ref = useRef<BottomSheetModal>(null);
    const formRef = useRef(null);

    useImperativeHandle(forwardedRef, () => ({
      ...ref.current,
      setValue: (...e) => formRef.current?.setValue(...e),
    }));

    // callbacks
    const handleOpen = useCallback(() => {
      onPress();
      ref.current?.present();
    }, [ref, onPress]);

    const { isReached } = useStorageContext();

    const trigger = cloneElement((children || <Pressable />) as any, {
      onPress: handleOpen,
    });

    const breakpoints = useResponsiveBreakpoints();
    const theme = useColorTheme();
    const { session } = useUser();
    const hintRef = useRef(null);

    if (!session) return null;

    return isReached ? null : (
      <>
        {trigger}
        <Modal
          disablePan={breakpoints.md}
          maxWidth={breakpoints.md ? 700 : "100%"}
          sheetRef={ref}
          keyboardBehavior="interactive"
          transformCenter
          animation={breakpoints.md ? "SCALE" : "SLIDE"}
          innerStyles={{
            backgroundColor: Platform.OS === "web" ? "transparent" : theme[1],
          }}
          outerContent={<CreateTaskOuterContent ref={hintRef} />}
        >
          <BottomSheetContent
            ref={formRef}
            hintRef={hintRef}
            defaultValues={defaultValues}
            mutateList={mutate}
          />
        </Modal>
      </>
    );
  }
);

export default CreateTask;

