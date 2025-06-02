import ChipInput from "@/components/ChipInput";
import { LocationPickerModal } from "@/components/collections/views/map";
import LabelPicker from "@/components/labels/picker";
import { useLabelColors } from "@/components/labels/useLabelColors";
import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import { useSession } from "@/context/AuthProvider";
import { useBadgingService } from "@/context/BadgingProvider";
import { AttachStep, OnboardingContainer } from "@/context/OnboardingProvider";
import { useStorageContext } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { addHslAlpha, useColor, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { DatePicker } from "@/ui/DatePicker";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Modal from "@/ui/Modal";
import { RecurrencePicker } from "@/ui/RecurrencePicker";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal, useBottomSheet } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ErrorBoundary } from "@sentry/react-native";
import dayjs, { Dayjs } from "dayjs";
import { BlurView } from "expo-blur";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { useGlobalSearchParams, usePathname } from "expo-router";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import React, {
  cloneElement,
  memo,
  Ref,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, Linking, Platform, Pressable, View } from "react-native";
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
import { useDebouncedCallback } from "use-debounce";
import { TaskNote } from "../drawer/TaskNote";
import VolumeBars from "./speech-recognition";

function PinTask({ control }: any) {
  const orange = useColor("orange");
  const breakpoints = useResponsiveBreakpoints();

  const theme = useColorTheme();

  return (
    <Controller
      control={control}
      name="pinned"
      render={({ field: { onChange, value } }) => (
        <IconButton
          icon="push_pin"
          size={50}
          style={breakpoints.md ? { marginLeft: "auto" } : { width: "100%" }}
          onPress={() => {
            if (Platform.OS !== "web") impactAsync(ImpactFeedbackStyle.Light);
            onChange(!value);
          }}
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
}

function Footer({
  nameRef,
  labelMenuRef,
  setValue,
  watch,
  control,
  dateRef,
  recurrenceRef,
  defaultValues,
}: {
  nameRef: any;
  labelMenuRef: React.MutableRefObject<BottomSheetModal>;
  setValue: any;
  watch: any;
  control: any;
  dateRef: React.MutableRefObject<BottomSheetModal>;
  recurrenceRef: React.MutableRefObject<BottomSheetModal>;
  defaultValues;
}) {
  const theme = useColorTheme();
  const recurrenceRule = watch("recurrenceRule");
  const collectionId = watch("collectionId");
  const date = watch("date");
  const end = watch("end");
  const dateOnly = watch("dateOnly");
  const parentTask = watch("parentTask");

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 10,
      }}
    >
      <ScrollView
        horizontal
        style={{
          marginHorizontal: -25,
        }}
        contentContainerStyle={{
          alignItems: "center",
          flexDirection: "row",
          gap: 5,
          paddingHorizontal: 25,
        }}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!parentTask && (
          <AttachStep index={0}>
            <View>
              {(date || recurrenceRule) && (
                <Button
                  chip
                  large
                  icon={recurrenceRule ? "loop" : "calendar_today"}
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
                  variant="outlined"
                  borderColors={{
                    default: addHslAlpha(theme[9], 0.1),
                    hovered: addHslAlpha(theme[9], 0.2),
                    pressed: addHslAlpha(theme[9], 0.3),
                  }}
                  backgroundColors={{
                    default: addHslAlpha(theme[9], 0),
                    hovered: addHslAlpha(theme[9], 0.1),
                    pressed: addHslAlpha(theme[9], 0.15),
                  }}
                  text={
                    recurrenceRule
                      ? capitalizeFirstLetter(
                          new RRule(recurrenceRule).toText()
                        )
                      : date
                      ? end
                        ? `${date.format(
                            dateOnly ? "MMM Do" : "MMM Do [@] h:mm a"
                          )} — ${end.format(
                            dateOnly ? "MMM Do" : "MMM Do [@] h:mm a"
                          )}`
                        : date.format(dateOnly ? "MMM Do" : "MMM Do [@] h:mm a")
                      : undefined
                  }
                />
              )}
              <DateButton
                nameRef={nameRef}
                watch={watch}
                setValue={setValue}
                defaultValues={defaultValues}
                dateRef={dateRef}
                recurrenceRef={recurrenceRef}
              />
            </View>
          </AttachStep>
        )}

        <AttachStep index={1}>
          <View>
            <CreateTaskLabelInput
              nameRef={nameRef}
              setValue={setValue}
              watch={watch}
              collectionId={collectionId}
              control={control}
              labelMenuRef={labelMenuRef}
              onLabelPickerClose={() => nameRef?.current?.focus()}
            />
          </View>
        </AttachStep>
        <AttachStep index={2}>
          <View>
            <LocationButton
              watch={watch}
              setValue={setValue}
              nameRef={nameRef}
            />
          </View>
        </AttachStep>
        <AiLabelSuggestion
          nameRef={nameRef}
          setValue={setValue}
          watch={watch}
        />
      </ScrollView>
    </View>
  );
}

export const AiLabelSuggestion = ({ watch, setValue, nameRef, style }: any) => {
  const name = watch("name");
  const label = watch("label");
  const [result, setResult] = useState(null);
  const { session } = useSession();
  const { id } = useGlobalSearchParams();

  // Debounce a fetch request to the AI model
  const fetchSuggestions = useDebouncedCallback(async (t) => {
    const data = await sendApiRequest(
      session,
      "POST",
      "ai/categorize-tasks/quick",
      {},
      {
        body: JSON.stringify({ name: t, collectionId: id }),
      }
    );

    setResult(data);
  }, 500);

  useEffect(() => {
    if (name && !label) fetchSuggestions(name);
  }, [name, label, fetchSuggestions]);

  return (
    result?.id &&
    name &&
    !label && (
      <Button
        chip
        large
        text={result?.name}
        variant="outlined"
        icon="add"
        onPress={() => {
          setValue("label", result);
          nameRef.current?.focus();
        }}
        style={[{ borderStyle: "dashed", borderWidth: 1 }, style]}
      />
    )
  );
};

const CreateTaskLabelInput = memo(function CreateTaskLabelInput({
  control,
  collectionId,
  labelMenuRef,
  watch,
  setValue,
  nameRef,
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
            onClose={() => nameRef.current?.focus()}
            autoFocus
          >
            {!label?.id && collectionId ? (
              <Button
                chip
                icon={
                  collectionData ? (
                    <Emoji
                      emoji={
                        collectionData?.find((e) => e.id === collectionId)
                          ?.emoji
                      }
                      size={20}
                    />
                  ) : (
                    <Spinner />
                  )
                }
                height={35}
                textStyle={{ fontSize: 15 }}
                containerStyle={{ borderRadius: 15 }}
                onDismiss={() => setValue("collectionId", null)}
                variant="outlined"
                text={
                  collectionData
                    ? collectionData.find((e) => e.id === collectionId)?.name
                    : "Loading..."
                }
              />
            ) : (
              <Button
                onDismiss={value ? () => onChange(null) : undefined}
                text={value?.name}
                chip
                large
                variant={value ? "filled" : "outlined"}
                textStyle={{
                  color: colors[value?.color]?.[11] || theme[11],
                }}
                dismissButtonProps={{
                  iconStyle: {
                    color: colors[value?.color]?.[11] || theme[11],
                  },
                }}
                icon={
                  value?.emoji ? (
                    <Emoji emoji={value?.emoji} />
                  ) : (
                    <Icon>tag</Icon>
                  )
                }
                backgroundColors={
                  !value
                    ? undefined
                    : {
                        default: addHslAlpha(
                          colors[value?.color]?.[9] || theme[9],
                          0.1
                        ),
                        hovered: addHslAlpha(
                          colors[value?.color]?.[9] || theme[9],
                          0.2
                        ),
                        pressed: addHslAlpha(
                          colors[value?.color]?.[9] || theme[9],
                          0.3
                        ),
                      }
                }
              />
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
      const [_, __, hour, minutes] = match;
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
      const id = match.replace(/__LABEL__{([0-9a-f-]+)}__/, "$1");
      const str = `${Platform.OS === "web" ? "@" : "#"}[${
        label.find((e) => e.id === id)?.name
      }](${match})${Platform.OS === "web" ? "" : " "}`;

      onChange(value.replace(str, ""));
      setValue(
        "label",
        label.find((e) => e.id === id)
      );
    });
  }, [value, label, onChange, setValue]);

  return null;
}

const TimeSuggestion = ({
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
    const setMessage = async () => {
      if (value !== "") hasTypedRef.current = true;

      const regex =
        /(?:at|from|during|after|before|by)\s((1[0-2]|0?[1-9])(?::([0-5][0-9]))?(am|pm)?)/i;

      const importantSuggestion = await AsyncStorage.getItem(
        "importantSuggestion"
      );
      const noteSuggestion = await AsyncStorage.getItem("noteSuggestion");
      const tagSuggestion = await AsyncStorage.getItem("tagSuggestion");
      const tmwSuggestion = await AsyncStorage.getItem("tmwSuggestion");

      hintRef?.current?.setMessage?.(
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
              (e) => e === type && COLLECTION_VIEWS[e].type === "Category Based"
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
          : isDirty && !value && Platform.OS === "web"
          ? {
              text: "Hit [backspace] to reset",
              icon: "magic_button",
            }
          : !importantSuggestion && Platform.OS === "web"
          ? {
              text: 'Type "!" to mark as important',
              icon: "emoji_objects",
            }
          : !tagSuggestion && Platform.OS === "web"
          ? {
              text: "Type # to add a tag",
              icon: "emoji_objects",
            }
          : !tmwSuggestion && Platform.OS === "web"
          ? {
              text: 'Type "tmw" to set a due date for tomorrow',
              icon: "emoji_objects",
            }
          : false
      );
    };

    setMessage();
  }, [value, hintRef, date, label, pathname, type, isDirty, parentTask]);
  return null;
};

function TaskNameInput({
  control,
  handleSubmitButtonClick,
  nameRef,
  setValue,
  watch,
  reset,
  submitRef,
  hintRef,
  disabled,
  descriptionRef,
}: {
  control: any;
  handleSubmitButtonClick: any;
  nameRef: any;
  setValue: any;
  watch;
  reset;
  disabled: boolean;
  submitRef;
  hintRef;
  descriptionRef;
}) {
  const attachments = watch("attachments");
  const { forceClose } = useBottomSheet();
  const { data: labelData } = useSWR(["space/labels"]);

  const suggestions = useMemo(
    () => [
      { id: "1", name: "tmw", value: ["date", dayjs().add(1, "day")] },
      { id: "2", name: "today", value: ["date", dayjs()] },
      { id: "3", name: "!", value: ["pinned", true] },
      { id: "3.5", name: "lock in", value: ["pinned", true] },
      { id: "3.75", name: "LOCK IN", value: ["pinned", true] },
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
          <View
            style={[
              { flex: 1 },
              disabled && { pointerEvents: "auto", opacity: 0.5 },
            ]}
          >
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
                    Platform.OS === "web" &&
                    !e.shiftKey &&
                    (e.key === "Enter" || e.nativeEvent.key === "Enter")
                  ) {
                    if (value.replaceAll("\n", "").trim())
                      handleSubmitButtonClick();
                  } else if (
                    (Platform.OS === "web" &&
                      e.shiftKey &&
                      (e.key === "Enter" || e.nativeEvent.key === "Enter")) ||
                    e.key === "Tab"
                  ) {
                    e.preventDefault();
                    descriptionRef.current.show();
                    if (Platform.OS === "web")
                      localStorage.setItem("noteSuggestion", "true");
                  }
                  if (e.key === "Escape") {
                    if (value) return onChange("");
                    forceClose();
                  }
                  if (e.key === "Backspace" && value === "") {
                    reset();
                    if (hintRef.current.message === "Hit [backspace] to reset")
                      hintRef?.current?.setMessage?.(false);
                  }
                  if (Platform.OS === "web") {
                    if (value.includes("!")) {
                      localStorage.setItem("importantSuggestion", "true");
                      hintRef?.current?.setMessage?.(false);
                    }
                    if (value.includes("tmw")) {
                      AsyncStorage.setItem("tmwSuggestion", "true");
                    }
                    if (e.key === "#") {
                      AsyncStorage.setItem("tagSuggestion", "true");
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
};

const SubmitButton = ({ onSubmit, watch, ref }: any) => {
  const theme = useColorTheme();
  const name = watch("name");
  const breakpoints = useResponsiveBreakpoints();
  const [disabled, setDisabled] = useState(false);

  useImperativeHandle(ref, () => ({
    isDisabled: () => disabled,
    setDisabled: (t) => setDisabled(t),
  }));

  return (
    <Button
      disabled={disabled || !name}
      height={50}
      text="Create"
      bold
      backgroundColors={{
        default:
          disabled || !name
            ? addHslAlpha(theme[9], 0.15)
            : addHslAlpha(theme[9], 0.4),
        hovered: theme[7],
        pressed: theme[8],
      }}
      iconPosition="end"
      style={{ paddingHorizontal: 20 }}
      containerStyle={!breakpoints.md && { flex: 1.5 }}
      textStyle={{ opacity: disabled || !name ? 0.6 : 1 }}
      iconStyle={{ opacity: disabled || !name ? 0.6 : 1 }}
      variant="filled"
      icon="arrow_upward"
      onPress={onSubmit}
    />
  );
};

function DateButton({
  watch,
  colors,
  dateRef,
  recurrenceRef,
  setValue,
  nameRef,
}: any) {
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
        setValue={(t) => {
          setValue("dateOnly", t.dateOnly);
          setValue("date", t.date);
          setValue("end", t.end);
        }}
        onOpen={Keyboard.dismiss}
        onClose={() => nameRef.current?.focus()}
      />
      <RecurrencePicker
        ref={recurrenceRef}
        value={recurrenceRule}
        setValue={(t: any) => setValue("recurrenceRule", t)}
        onClose={() => nameRef.current?.focus()}
      />
      <MenuPopover
        menuProps={{ rendererProps: { placement: "top" } }}
        options={[
          {
            text: "Set repetition",
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
          <Button
            backgroundColors={colors}
            icon="calendar_today"
            variant="outlined"
            chip
            large
          />
        }
      />
    </View>
  );
}

function SubTaskInformation({ watch }) {
  const parentTask = watch("parentTask");
  const theme = useColorTheme();

  return (
    parentTask && (
      <View
        style={{
          marginTop: -25,
          marginHorizontal: -25,
        }}
      >
        <View
          style={{
            gap: 20,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            backgroundColor: addHslAlpha(theme[9], 0.05),
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
      </View>
    )
  );
}

const TaskDescriptionInput = ({
  control,
  nameRef,
  ref,
}: {
  control;
  nameRef;
  ref;
}) => {
  const editorRef = useRef(null);

  useImperativeHandle(ref, () => ({
    show: () => {
      editorRef.current.focus();
    },
  }));

  return (
    <View style={{ marginHorizontal: -10, height: 150 }}>
      <Controller
        control={control}
        name="note"
        render={({ field: { onChange, value } }) => (
          <TaskNote
            openLink={(url) => Linking.openURL(url)}
            onContainerFocus={() => nameRef.current?.focus()}
            showEditorWhenEmpty
            ref={editorRef}
            task={{ note: "<p>hi</p>" }}
            updateTask={(_, t) => onChange(t)}
          />
        )}
      />
    </View>
  );
};

function SpeechRecognition({ setValue }) {
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const red = useColor("red");
  const [recognizing, setRecognizing] = useState(false);

  useSpeechRecognitionEvent("volumechange", (event) => {
    console.log(event);
  });

  useSpeechRecognitionEvent("start", () => {
    setRecognizing(true);
    if (Platform.OS === "web")
      Toast.show({
        type: "info",
        text1: "Listening...",
        visibilityTime: 99999999,
      });
  });
  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
    Toast.hide();
  });
  useSpeechRecognitionEvent("result", (event) => {
    setValue(
      "name",
      event.results[0]?.transcript?.endsWith(".")
        ? event.results[0]?.transcript.slice(0, -1).trim()
        : event.results[0]?.transcript?.trim()
    );
  });
  useSpeechRecognitionEvent("error", (event) => {});

  const handleStart = async () => {
    impactAsync(ImpactFeedbackStyle.Heavy);
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
    <>
      <IconButton
        variant="filled"
        icon={recognizing ? <VolumeBars /> : "mic"}
        size={50}
        style={breakpoints.md ? undefined : { width: "100%" }}
        iconProps={{ filled: recognizing }}
        iconStyle={{
          color: recognizing ? red[2] : theme[11],
        }}
        backgroundColors={
          recognizing
            ? { default: red[9], hovered: red[10], pressed: red[11] }
            : {
                default: addHslAlpha(theme[9], 0.15),
                hovered: addHslAlpha(theme[9], 0.25),
                pressed: addHslAlpha(theme[9], 0.35),
              }
        }
        borderColors={
          recognizing
            ? {
                default: red[9],
                hovered: red[10],
                pressed: red[11],
              }
            : {}
        }
        onPress={
          recognizing
            ? () => {
                ExpoSpeechRecognitionModule.stop();
                impactAsync(ImpactFeedbackStyle.Heavy);
              }
            : handleStart
        }
      />
    </>
  );
}

function LocationButton({ watch, setValue, nameRef }) {
  const theme = useColorTheme();
  const location = watch("location");

  return (
    <LocationPickerModal
      autoFocus={Platform.OS !== "web"}
      hideSkip
      onClose={() => nameRef.current?.focus()}
      onLocationSelect={(location) =>
        setValue("location", {
          placeId: location.place_id,
          name: location.display_name,
          coordinates: [location.lat, location.lon],
        })
      }
    >
      <Button
        variant={location ? "filled" : "outlined"}
        text={location?.name}
        backgroundColors={
          !location
            ? undefined
            : {
                default: addHslAlpha(theme[9], 0.15),
                hovered: addHslAlpha(theme[9], 0.25),
                pressed: addHslAlpha(theme[9], 0.35),
              }
        }
        icon="near_me"
        chip
        large
        textStyle={{ maxWidth: 100 }}
        iconStyle={{ transform: [{ scale: 1.1 }] }}
        onDismiss={!location ? undefined : () => setValue("location", null)}
      />
    </LocationPickerModal>
  );
}

const BottomSheetContent = ({
  defaultValues,
  mutateList,
  hintRef,
  ref: formRef,
}: {
  defaultValues: CreateTaskDrawerProps["defaultValues"];
  mutateList: any;
  hintRef;
  ref;
}) => {
  const breakpoints = useResponsiveBreakpoints();
  const { sessionToken } = useUser();
  const isDark = useDarkMode();
  const nameRef = useRef(null);
  const dateRef = useRef(null);
  const recurrenceRef = useRef(null);
  const submitRef = useRef(null);
  const labelMenuRef = useRef<BottomSheetModal>(null);
  const badgingService = useBadgingService();

  const descriptionRef = useRef(null);
  const theme = useColorTheme();
  const addedTasks = useRef([]);
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
      location: null,
      note: "",
    },
  });

  useImperativeHandle(formRef, () => ({ setValue }));

  const { session } = useUser();
  useEffect(() => {
    // if (!session.user.hintsViewed.includes("CREATE_TASK")) return;
    nameRef.current?.focus({ preventScroll: true });
  }, [session, nameRef, breakpoints]);

  const onSubmit = async (data) => {
    try {
      if (Platform.OS !== "web") impactAsync(ImpactFeedbackStyle.Heavy);
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
        .then((e) => addedTasks.current.push(e))
        .then(() => badgingService?.current?.mutate());

      reset(defaultValues);

      Toast.show({
        type: "success",
        text1: "Created task!",
      });
      nameRef.current?.focus();
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

  useEffect(() => {
    return () => {
      if (addedTasks.current.length > 0) {
        for (let i = 0; i < addedTasks.current.length; i++) {
          mutateList(addedTasks.current[i]);
        }
      }
    };
  }, []);

  return (
    <Pressable
      style={{
        minHeight:
          Platform.OS !== "web"
            ? defaultValues.parentTask
              ? 320
              : 280
            : undefined,
        backgroundColor: addHslAlpha(
          theme[2],
          Platform.OS === "android" ? 1 : 0.5
        ),
      }}
    >
      <BlurView
        style={{ flex: 1, padding: 25, gap: 20, flexDirection: "column" }}
        intensity={Platform.OS === "android" ? 0 : 60}
        tint={
          Platform.OS === "ios"
            ? isDark
              ? "dark"
              : "light"
            : isDark
            ? "systemUltraThinMaterialDark"
            : "systemUltraThinMaterialLight"
        }
      >
        <SubTaskInformation watch={watch} />
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            zIndex: 0,
          }}
        >
          <Footer
            defaultValues={defaultValues}
            dateRef={dateRef}
            recurrenceRef={recurrenceRef}
            setValue={setValue}
            watch={watch}
            nameRef={nameRef}
            labelMenuRef={labelMenuRef}
            control={control}
          />
          <View style={Platform.OS !== "web" && { minHeight: 100 }}>
            <TaskNameInput
              // disabled={!session.user.hintsViewed.includes("CREATE_TASK")}
              descriptionRef={descriptionRef}
              hintRef={hintRef}
              submitRef={submitRef}
              reset={reset}
              watch={watch}
              control={control}
              handleSubmitButtonClick={handleSubmitButtonClick}
              nameRef={nameRef}
              setValue={setValue}
            />
            {/* <TaskDescriptionInput
                nameRef={nameRef}
                control={control}
                ref={descriptionRef}
              /> */}
          </View>
        </View>
        <TaskAttachments watch={watch} setValue={setValue} />
        <View
          style={{
            gap: 7,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <AttachStep index={3}>
            <View style={breakpoints.md ? undefined : { flex: 1 }}>
              <SpeechRecognition setValue={setValue} />
            </View>
          </AttachStep>
          <AttachStep index={4}>
            <View style={breakpoints.md ? { marginLeft: "auto" } : { flex: 1 }}>
              <PinTask control={control} />
            </View>
          </AttachStep>
          <SubmitButton
            watch={watch}
            ref={submitRef}
            onSubmit={handleSubmitButtonClick}
          />
        </View>
      </BlurView>
    </Pressable>
  );
};

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
  ref?: Ref<any>;
}

const CreateTaskOuterContent = (props) => {
  const isDark = useDarkMode();
  const theme = useColorTheme();
  const [message, setMessage] = useState<null | { icon: any; text: any }>(null);

  useImperativeHandle(props.ref, () => ({
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
    message && (
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
            ...(Platform.OS === "android" && {
              backgroundColor: theme[2],
            }),
            flex: 1,
            paddingHorizontal: 15,
            overflow: "hidden",
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
};

const CreateTask = ({
  children,
  defaultValues = {
    date: null,
    agendaOrder: null,
    collectionId: null,
    dateOnly: true,
  },
  onPress = () => {},
  mutate,
  ref: forwardedRef,
}: CreateTaskDrawerProps) => {
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

  const { isReached } = useStorageContext() || {};

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
        transformCenter
        disablePan={breakpoints.md}
        maxWidth={breakpoints.md ? 700 : "100%"}
        sheetRef={ref}
        animation={breakpoints.md ? "SCALE" : "SLIDE"}
        innerStyles={{
          backgroundColor: Platform.OS !== "android" ? "transparent" : theme[1],
        }}
        maxBackdropOpacity={breakpoints.md ? 0.05 : 0.1}
        outerContent={
          breakpoints.md && <CreateTaskOuterContent ref={hintRef} />
        }
        closeContainerStyles={
          !breakpoints.md && {
            justifyContent: "flex-end",
            paddingBottom: 10,
            paddingHorizontal: 10,
          }
        }
      >
        <OnboardingContainer
          delay={Platform.OS === "web" ? 500 : 1000}
          id="CREATE_TASK"
          onlyIf={() => !defaultValues.parentTask}
          steps={[
            {
              text: "Set a due date or recurrence",
            },
            {
              text: "Labels let you categorize similar tasks",
            },
            {
              text: "Here, you can add a location to your task",
            },
            {
              text: "Don't want to type? Use voice recognition!",
            },
            {
              text: "Pinned tasks will always be on top",
            },
          ]}
        >
          {() => (
            <ErrorBoundary
              fallback={
                <Text
                  style={{
                    backgroundColor: theme[2],
                    padding: 20,
                    textAlign: "center",
                  }}
                >
                  Something went wrong, please try again later
                </Text>
              }
            >
              <BottomSheetContent
                ref={formRef}
                hintRef={hintRef}
                defaultValues={defaultValues}
                mutateList={mutate}
              />
            </ErrorBoundary>
          )}
        </OnboardingContainer>
      </Modal>
    </>
  );
};

export default CreateTask;

