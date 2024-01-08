import { LabelPicker } from "@/components/labels/picker";
import { useLabelColors } from "@/components/labels/useLabelColors";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import { Menu } from "@/ui/Menu";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import {
  BottomSheetModal,
  BottomSheetTextInput,
  TouchableOpacity,
} from "@gorhom/bottom-sheet";
import dayjs, { Dayjs } from "dayjs";
import React, {
  cloneElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, Platform, View, useColorScheme } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import DateTimePicker from "react-native-ui-datepicker";
import { TaskAttachmentButton } from "../drawer/content";
import { TaskDrawerContext } from "../drawer/context";

function Footer({ nameRef, menuRef, control }) {
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();

  const dateMenuRef = useRef<BottomSheetModal>(null);
  const orange = useColor("orange", useColorScheme() === "dark");

  const calendarTextStyles = { color: theme[11], fontFamily: "body_400" };

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
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 15,
        height: 60 + insets.bottom,
        paddingBottom: insets.bottom,
        shadowColor: theme[3],
        shadowOffset: { width: 0, height: -40 },
        shadowRadius: 40,
        shadowOpacity: 0.5,
      }}
    >
      <View
        style={{
          backgroundColor: theme[2],
          borderColor: theme[5],
          ...(Platform.OS === "ios" && { width: "100%" }),
          height: "100%",
          alignItems: "center",
          flexDirection: "row",
          marginTop: "auto",
        }}
      >
        <TaskDrawerContext.Provider
          value={{ task: {}, mutateList: () => null, updateTask: () => null }}
        >
          <TaskAttachmentButton
            onClose={() => nameRef.current.focus()}
            onOpen={() => nameRef.current.focus()}
          >
            <Chip icon={<Icon>add</Icon>} />
          </TaskAttachmentButton>
        </TaskDrawerContext.Provider>
      </View>
      <Controller
        control={control}
        rules={{ required: false }}
        name="date"
        render={({ field: { onChange, value } }) => (
          <Menu
            menuRef={dateMenuRef}
            height={[440 + 23.5]}
            trigger={
              <Chip
                style={{ marginLeft: "auto" }}
                icon={<Icon>calendar_today</Icon>}
                label={value ? value.format("MMM Do") : undefined}
              />
            }
          >
            <DateTimePicker
              value={value}
              selectedItemColor={theme[9]}
              todayContainerStyle={{ borderColor: theme[4] }}
              calendarTextStyle={calendarTextStyles}
              headerTextStyle={calendarTextStyles}
              todayTextStyle={calendarTextStyles}
              selectedTextStyle={calendarTextStyles}
              weekDaysTextStyle={calendarTextStyles}
              timePickerTextStyle={calendarTextStyles}
              buttonNextIcon={<Icon>arrow_forward_ios</Icon>}
              buttonPrevIcon={<Icon>arrow_back_ios_new</Icon>}
              weekDaysContainerStyle={{ borderColor: theme[4] }}
              onValueChange={(e) => onChange(dayjs(e))}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 10,
                marginTop: 10,
                paddingVertical: 5,
                borderTopWidth: 2,
                borderTopColor: theme[4],
              }}
            >
              <Button onPress={() => dateMenuRef.current?.forceClose()}>
                <Icon>close</Icon>
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button
                onPress={() => dateMenuRef.current?.forceClose()}
                variant="filled"
              >
                <ButtonText>Done</ButtonText>
                <Icon>check</Icon>
              </Button>
            </View>
          </Menu>
        )}
      />
      <Controller
        control={control}
        name="pinned"
        defaultValue={false}
        render={({ field: { onChange, value } }) => (
          <Chip
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
        onLabelPickerClose={() => {
          nameRef?.current?.focus();
        }}
      />
    </View>
  );
}

function CreateTaskLabelInput({ control, onLabelPickerClose }) {
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
          onClose={onLabelPickerClose}
        >
          <Chip
            icon={
              value ? (
                <Emoji emoji={value?.emoji} />
              ) : (
                <Icon filled={value}>label</Icon>
              )
            }
            {...(value && {
              // label: JSON.stringify(value?.name),
              style: {
                backgroundColor: colors[value?.color]?.[4],
              },
            })}
            color={value ? colors[value?.color]?.[3] : undefined}
          />
        </LabelPicker>
      )}
    />
  );
}
function TaskNameInput({ control, handleSubmitButtonClick, menuRef, nameRef }) {
  const theme = useColorTheme();

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
          placeholder="Task name"
          onBlur={onBlur}
          onKeyPress={(e: any) => {
            if (e.key === "/") {
              menuRef.current.present();
            }
            if (e.key === "Enter") {
              handleSubmitButtonClick();
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
            fontFamily: "body_400",
            fontSize: 25,
            paddingHorizontal: 20,
            paddingBottom: 55,
            flex: 1,
            minHeight: "100%",
            textAlignVertical: "top",
            ...(Platform.OS === "web" && ({ outlineStyle: "none" } as any)),
          }}
        />
      )}
      name="name"
    />
  );
}

function BottomSheetContent({ nameRef, handleClose, defaultValues }) {
  const { sessionToken } = useUser();
  const menuRef = useRef<BottomSheetModal>(null);
  const theme = useColorTheme();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      date: defaultValues.date,
      pinned: false,
      label: null,
    },
  });

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
            pinned: data.pinned,
            labelId: data.label?.id,
            type: "TASK",
          }),
        }
      ).then((e) => console.log(e));
      reset();
      Toast.show({
        type: "success",
        text1: "Created task!",
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later.",
      });
    }
  };

  const handleSubmitButtonClick = () => {
    if (Object.keys(errors).length > 0) {
      Toast.show({
        type: "error",
        text1: "Type in a task name",
      });
    } else handleSubmit(onSubmit)();
  };

  return (
    <>
      <View style={{ flex: 1 }}>
        <View
          style={{
            gap: 10,
            flexDirection: "row",
            paddingHorizontal: 20,
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <TouchableOpacity onPress={handleClose}>
            <ButtonText style={{ color: theme[10] }}>Cancel</ButtonText>
          </TouchableOpacity>
          <Chip
            style={{ marginLeft: "auto", backgroundColor: theme[5] }}
            icon={
              <Icon bold style={{ color: theme[11] }}>
                north
              </Icon>
            }
            onPress={handleSubmitButtonClick}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TaskNameInput
            control={control}
            menuRef={menuRef}
            handleSubmitButtonClick={handleSubmitButtonClick}
            nameRef={nameRef}
          />
        </View>
      </View>
      <Footer nameRef={nameRef} menuRef={menuRef} control={control} />
    </>
  );
}

export default function CreateTask({
  children,
  defaultValues = {
    date: dayjs().utc(),
  },
  mutate,
}: {
  children: any;
  defaultValues?: {
    date?: Dayjs;
  };
  mutate: () => void;
}) {
  const ref = useRef<BottomSheetModal>(null);

  const nameRef = useRef(null);

  // callbacks
  const handleOpen = useCallback(() => {
    ref.current?.present();
    if (Platform.OS === "web") {
      setTimeout(() => {
        nameRef.current.focus();
      }, 200);
    }
  }, []);

  const handleClose = useCallback(() => {
    ref.current?.close();
    mutate();
  }, [mutate]);

  const trigger = useMemo(
    () => cloneElement(children, { onPress: handleOpen }),
    [handleOpen, children]
  );

  return (
    <>
      {trigger}
      <BottomSheet
        onClose={handleClose}
        sheetRef={ref}
        snapPoints={[300]}
        maxWidth={500}
        keyboardBehavior="interactive"
      >
        <BottomSheetContent
          handleClose={handleClose}
          defaultValues={defaultValues}
          nameRef={nameRef}
        />
      </BottomSheet>
    </>
  );
}
