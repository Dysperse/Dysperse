import LabelPicker from "@/components/labels/picker";
import { useLabelColors } from "@/components/labels/useLabelColors";
import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import { STORY_POINT_SCALE } from "@/constants/workload";
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
import Emoji from "@/ui/Emoji";
import { GrowingTextInput } from "@/ui/GrowingTextInput";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Modal from "@/ui/Modal";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import {
  InteractionManager,
  Keyboard,
  Platform,
  Pressable,
  useWindowDimensions,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { TaskAttachmentPicker } from "../drawer/attachment-picker";
import { TaskDrawerContext } from "../drawer/context";
import { TaskDateMenu } from "../drawer/details";
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
            if (Platform.OS !== "web") impactAsync(ImpactFeedbackStyle.Heavy);
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
                  default: addHslAlpha(orange[9], 0.3),
                  hovered: addHslAlpha(orange[9], 0.3),
                  pressed: addHslAlpha(orange[9], 0.4),
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
  const storyPoints = watch("storyPoints");
  const collectionId = watch("collectionId");
  const date = watch("date");
  const end = watch("end");
  const location = watch("location");
  const parentTask = watch("parentTask");

  const legacyComplexityScale = [2, 4, 8, 16, 32];

  return (
    <View
      style={{ marginTop: 5, marginHorizontal: -3, gap: 3, marginBottom: -3 }}
    >
      {!parentTask && (
        <AttachStep index={0}>
          <View>
            <TaskDrawerContext.Provider
              value={{
                task: {
                  ...control._formValues,
                  start: date,
                },
                updateTask: (t) => {
                  Object.keys(t).forEach((key: any) => {
                    setValue(key.replace("start", "date"), t[key]);
                  });
                },
                mutateList: () => alert("mutate"),
                isReadOnly: false,
              }}
            >
              <TaskDateMenu
                isTaskCreation
                onClose={() => nameRef.current.focus()}
              />
            </TaskDrawerContext.Provider>
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
      {storyPoints && (
        <MenuPopover
          options={[
            {
              text: "Remove",
              icon: "remove_circle",
              callback: () => setValue("storyPoints", null),
            },
          ]}
          menuProps={{
            style: { marginRight: "auto" },
          }}
          trigger={
            <Button
              dense
              style={{ gap: 10, opacity: 0.6 }}
              text={
                STORY_POINT_SCALE[
                  legacyComplexityScale.findIndex((i) => i === storyPoints)
                ]
              }
              icon="exercise"
            />
          }
        />
      )}
      {location && (
        <MenuPopover
          options={[
            {
              text: "Remove",
              icon: "remove_circle",
              callback: () => setValue("location", null),
            },
          ]}
          menuProps={{
            style: { marginRight: "auto" },
          }}
          trigger={
            <Button
              dense
              style={{ gap: 10, opacity: 0.6 }}
              text={`${
                location?.name?.substring(0, 20)?.replaceAll(",", "") ||
                "Location"
              }...`}
              icon="near_me"
              iconStyle={{ transform: [{ scale: 1.1 }] }}
            />
          }
        />
      )}
    </View>
  );
}

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
  const { data: collectionData } = useSWR(["space/collections"]);

  return (
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
              dense
              style={{ gap: 10, opacity: 0.5 }}
              icon={
                collectionData ? (
                  <Emoji
                    emoji={
                      collectionData?.find((e) => e.id === collectionId)?.emoji
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
              variant="outlined"
              text={
                collectionData
                  ? collectionData.find((e) => e.id === collectionId)?.name
                  : "Loading..."
              }
            />
          ) : (
            <Button
              dense
              style={{ gap: 10, opacity: 0.6 }}
              text={value?.name || "Add label"}
              textStyle={{ color: colors[value?.color]?.[11] || theme[11] }}
              dismissButtonProps={{
                iconStyle: {
                  color: colors[value?.color]?.[11] || theme[11],
                },
              }}
              icon={
                value?.emoji ? <Emoji emoji={value?.emoji} /> : <Icon>tag</Icon>
              }
            />
          )}
        </LabelPicker>
      )}
    />
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
  disabled,
  handleSubmitButtonClick,
  control,
  nameRef,
}: {
  disabled: boolean;
  handleSubmitButtonClick: () => void;
  control: any;
  nameRef: any;
}) {
  const theme = useColorTheme();

  return (
    <Controller
      control={control}
      rules={{ required: true }}
      name="name"
      render={({ field: { onChange, value } }) => (
        <>
          <GrowingTextInput
            ref={nameRef}
            selectionColor={theme[11]}
            onChangeText={onChange}
            blurOnSubmit
            enterKeyHint="done"
            defaultValue={value}
            bounces={false}
            onSubmitEditing={handleSubmitButtonClick}
            onKeyPress={(e) => {
              if (
                e.nativeEvent.key === "Enter" ||
                e.nativeEvent.key === "Escape"
              ) {
                e.preventDefault();
                if (e.nativeEvent.key === "Enter") handleSubmitButtonClick();
              }
            }}
            scrollEnabled={false}
            placeholder="Task name"
            disabled={disabled}
            placeholderTextColor={addHslAlpha(theme[11], 0.2)}
            style={[
              {
                fontFamily: "serifText700",
                color: theme[11],
                paddingHorizontal: 7,
                marginTop: 5,
                marginBottom: 3,
                borderRadius: 0,
                borderWidth: 2,
                shadowRadius: 0,
                borderColor: "transparent",
              },
            ]}
            fontSize={35}
          />
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
      containerStyle={{ width: 140 }}
      textStyle={{ opacity: disabled || !name ? 0.6 : 1 }}
      iconStyle={{ opacity: disabled || !name ? 0.6 : 1 }}
      variant="filled"
      icon="arrow_upward"
      onPress={onSubmit}
    />
  );
};

function SubTaskInformation({ watch }) {
  const parentTask = watch("parentTask");
  const theme = useColorTheme();

  return (
    parentTask && (
      <View style={{ marginTop: -10, marginHorizontal: -10, marginBottom: 5 }}>
        <View
          style={{
            gap: 20,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            borderWidth: 1,
            borderColor: addHslAlpha(theme[11], 0.1),
            paddingVertical: 5,
            borderRadius: 99,
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
  const { forceClose } = useBottomSheet();

  const [view, setView] = useState<"HOME" | "ATTACH">("HOME");

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
    if (!session.user.hintsViewed.includes("CREATE_TASK")) return;
    if (Platform.OS === "web") setTimeout(() => nameRef.current?.focus(), 0);
    setTimeout(
      () => {
        InteractionManager.runAfterInteractions(() => {
          nameRef.current?.focus({ preventScroll: true });
        });
      },
      Platform.OS === "web" ? 200 : 110
    );
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
    setTimeout(() => nameRef.current?.focus(), 1);
    nameRef.current?.focus();
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
      onPress={(e) => e.stopPropagation()}
      style={[
        {
          flex: Platform.OS === "web" ? 1 : undefined,
          backgroundColor: addHslAlpha(
            theme[2],
            Platform.OS === "android" ? 1 : 0.5
          ),
          marginTop: "auto",
        },
      ]}
    >
      <BlurView
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
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          bounces={false}
          contentContainerStyle={{ gap: 20 }}
          style={{ flexGrow: 1 }}
        >
          {view === "HOME" ? (
            <View style={{ padding: 20, paddingBottom: 0 }}>
              <SubTaskInformation watch={watch} />
              <View style={{ flexDirection: "column", zIndex: 0 }}>
                <TaskNameInput
                  disabled={!session.user.hintsViewed.includes("CREATE_TASK")}
                  // hintRef={hintRef}
                  // submitRef={submitRef}
                  // reset={reset}
                  // watch={watch}
                  control={control}
                  handleSubmitButtonClick={handleSubmitButtonClick}
                  nameRef={nameRef}
                  // setValue={setValue}
                />
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
              </View>
              <TaskAttachments watch={watch} setValue={setValue} />
            </View>
          ) : (
            <TaskDrawerContext.Provider
              value={{
                task: control._formValues,
                updateTask: (t) => {
                  Object.keys(t).forEach((key: any) => {
                    setValue(key, t[key]);
                  });
                },
                mutateList,
                isReadOnly: false,
              }}
            >
              <TaskAttachmentPicker
                handleBack={() => {
                  setView("HOME");
                  setTimeout(() => nameRef.current?.focus(), 20);
                }}
                isTaskCreation
                forceClose={forceClose}
              />
            </TaskDrawerContext.Provider>
          )}

          <View
            style={{
              gap: 5,
              flexDirection: "row",
              alignItems: "center",
              padding: 20,
              paddingTop: 0,
            }}
          >
            <AttachStep index={2} style={{ flex: 1 }}>
              <Button
                icon={view === "HOME" ? "note_stack_add" : "west"}
                text={view === "HOME" ? undefined : "Attach"}
                bold={view === "ATTACH"}
                height={50}
                onPress={() => {
                  Keyboard.dismiss();
                  impactAsync(ImpactFeedbackStyle.Heavy);
                  setView((t) => (t === "HOME" ? "ATTACH" : "HOME"));
                  setTimeout(() => nameRef.current?.focus(), 20);
                }}
                containerStyle={
                  view === "HOME"
                    ? { paddingHorizontal: 0, minWidth: 0 }
                    : { marginRight: "auto" }
                }
                style={view === "ATTACH" && { paddingHorizontal: 20 }}
                variant="filled"
                backgroundColors={{
                  default: addHslAlpha(theme[9], 0.15),
                  hovered: addHslAlpha(theme[9], 0.25),
                  pressed: addHslAlpha(theme[9], 0.35),
                }}
              />
            </AttachStep>
            {view === "HOME" && (
              <>
                <AttachStep
                  index={3}
                  style={breakpoints.md ? undefined : { flex: 1 }}
                >
                  <SpeechRecognition setValue={setValue} />
                </AttachStep>
                <AttachStep
                  index={4}
                  style={breakpoints.md ? { marginLeft: "auto" } : { flex: 1 }}
                >
                  <PinTask control={control} />
                </AttachStep>
                <SubmitButton
                  watch={watch}
                  ref={submitRef}
                  onSubmit={handleSubmitButtonClick}
                />
              </>
            )}
          </View>
        </BottomSheetScrollView>
      </BlurView>
    </Pressable>
  );
};

export interface CreateTaskDrawerProps {
  children?: React.ReactNode;
  stackBehavior?: "push" | "replace";
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
            overflow: "hidden",
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
};

const CreateTask = ({
  children,
  stackBehavior = "push",
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
  const { height } = useWindowDimensions();

  useImperativeHandle(forwardedRef, () => ({
    ...ref.current,
    present: (t) => ref.current?.present(t),
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
  const { session } = useUser();
  const hintRef = useRef(null);

  if (!session) return null;

  return isReached ? null : (
    <>
      {trigger}
      <Modal
        animation={breakpoints.md ? "SCALE" : "SLIDE"}
        sheetRef={ref}
        stackBehavior={stackBehavior}
        height="auto"
        onClose={() => ref.current?.dismiss()}
        transformCenter
        closeContainerStyles={!breakpoints.md && { justifyContent: "flex-end" }}
        containerStyle={
          breakpoints.md && {
            shadowRadius: 50,
            shadowOffset: {
              width: 20,
              height: 20,
            },
            shadowColor: "rgba(0,0,0,0.12)",
          }
        }
        innerStyles={{
          backgroundColor:
            Platform.OS === "android" ? undefined : "transparent",
          borderRadius: 40,
          maxHeight: breakpoints.md
            ? height - 150
            : height - (Keyboard?.metrics?.()?.height || 0) - 100,
        }}
        maxBackdropOpacity={breakpoints.md ? 0.05 : 0.1}
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
              text: "Add a location, complexity, or images",
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
            <BottomSheetContent
              ref={formRef}
              hintRef={hintRef}
              defaultValues={defaultValues}
              mutateList={mutate}
            />
          )}
        </OnboardingContainer>
      </Modal>
    </>
  );
};

export default CreateTask;

