import LabelPicker from "@/components/labels/picker";
import { useLabelColors } from "@/components/labels/useLabelColors";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet from "@/ui/BottomSheet";
import { ButtonText } from "@/ui/Button";
import Calendar from "@/ui/Calendar";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import {
  BottomSheetModal,
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
} from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  View,
  useColorScheme,
} from "react-native";
import { Menu } from "react-native-popup-menu";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { TaskAttachmentButton } from "../drawer/attachment/button";

function Footer({ nameRef, labelMenuRef, dateMenuRef, control }) {
  const orange = useColor("orange", useColorScheme() === "dark");

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
      <Controller
        control={control}
        rules={{ required: false }}
        name="date"
        render={({ field: { onChange, value } }) => (
          <MenuPopover
            menuRef={dateMenuRef}
            containerStyle={{ width: 300 }}
            trigger={
              <Chip
                outlined
                icon={<Icon>calendar_today</Icon>}
                label={value ? value.format("MMM Do") : undefined}
              />
            }
          >
            <Calendar
              date={value}
              onDayPress={(date) => {
                onChange(dayjs(date.dateString, "YYYY-MM-DD"));
                dateMenuRef.current.close();
                nameRef?.current?.focus();
              }}
              markedDates={{
                [dayjs(value).format("YYYY-MM-DD")]: {
                  selected: true,
                  disableTouchEvent: true,
                },
              }}
            />
          </MenuPopover>
        )}
      />
      <Controller
        control={control}
        name="pinned"
        defaultValue={false}
        render={({ field: { onChange, value } }) => (
          <Chip
            outlined
            onPress={() => {
              onChange(!value);
              rotate.value = withSpring(!value ? -35 : 0, {
                mass: 1,
                damping: 10,
                stiffness: 200,
                overshootClamping: false,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 2,
              });
            }}
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
    </ScrollView>
  );
}

function CreateTaskLabelInput({ control, labelMenuRef, onLabelPickerClose }) {
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
            outlined
            label={value?.name || "Add label"}
            icon={
              value ? (
                <Emoji emoji={value?.emoji} />
              ) : (
                <Icon filled={value}>new_label</Icon>
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
}: {
  control: any;
  dateMenuRef: React.MutableRefObject<Menu>;
  handleSubmitButtonClick: any;
  menuRef: React.MutableRefObject<BottomSheetModal>;
  nameRef: any;
  labelMenuRef: React.MutableRefObject<BottomSheetModal>;
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

function BottomSheetContent({ nameRef, defaultValues, mutateList }) {
  const breakpoints = useResponsiveBreakpoints();
  const { sessionToken } = useUser();
  const { forceClose } = useBottomSheet();
  const menuRef = useRef<BottomSheetModal>(null);
  const labelMenuRef = useRef<BottomSheetModal>(null);
  const dateMenuRef = useRef<Menu>(null);
  const theme = useColorTheme();
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: defaultValues.name || "",
      date: defaultValues.date || dayjs().utc(),
      pinned: false,
      label: defaultValues.label,
      collectionId: defaultValues.collectionId,
    },
  });

  useEffect(() => {
    setTimeout(
      () => {
        nameRef.current.focus();
      },
      breakpoints.md ? 50 : 500
    );
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
            labelId: data.label?.id,
            type: "TASK",
            collectionId: data.label?.id ? null : data.collectionId,
          }),
        }
      )
        .then((e) => mutateList(e))
        .then((e) => console.log(e));
      reset();
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
        height: 300,
        maxWidth: "100%",
        width: 700,
        borderRadius: 20,
        backgroundColor: theme[2],
        borderWidth: 1,
        borderColor: theme[6],
        shadowColor: theme[1],
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
          <TouchableOpacity onPress={() => forceClose()}>
            <ButtonText style={{ color: theme[10] }} weight={300}>
              Cancel
            </ButtonText>
          </TouchableOpacity>
          <MenuPopover
            menuProps={{
              style: {
                marginHorizontal: "auto",
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
          <TaskAttachmentButton
            menuRef={menuRef}
            onAttachmentCreate={(e) => console.log(e)}
            onClose={() => nameRef.current.focus()}
            onOpen={() => nameRef.current.focus()}
          >
            <IconButton
              style={{ marginTop: 63 }}
              icon="add"
              variant="filled"
              size={35}
            />
          </TaskAttachmentButton>
          <View style={{ flex: 1 }}>
            <Footer
              dateMenuRef={dateMenuRef}
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
            />
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

  const trigger = useMemo(
    () => cloneElement(children || <Pressable />, { onPress: handleOpen }),
    [handleOpen, children]
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
