import { LabelPicker } from "@/components/labels/picker";
import { useLabelColors } from "@/components/labels/useLabelColors";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Avatar } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { Menu } from "@/ui/Menu";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import {
  BottomSheetModal,
  BottomSheetTextInput,
  TouchableOpacity,
} from "@gorhom/bottom-sheet";
import dayjs, { Dayjs } from "dayjs";
import React, {
  cloneElement,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, Pressable, View, useColorScheme } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import DateTimePicker from "react-native-ui-datepicker";
import { styles } from "./styles";

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
  const { sessionToken } = useUser();
  const menuRef = useRef<BottomSheetModal>(null);
  const dateMenuRef = useRef<BottomSheetModal>(null);
  const orange = useColor("orange", useColorScheme() === "dark");
  const theme = useColorTheme();
  const ref = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  const [date, setDate] = useState<Dayjs | null>(
    defaultValues.date || undefined
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
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
            due: date?.toISOString(),
            type: "TASK",
          }),
        }
      ).then((e) => console.log(e));
      // handleClose();
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
  const handleSubmitButtonClick = () => {
    if (Object.keys(errors).length > 0) {
      Toast.show({
        type: "error",
        text1: "Type in a task name",
      });
    }
    handleSubmit(onSubmit)();
  };

  const nameRef = useRef(null);
  const trigger = useMemo(
    () => cloneElement(children, { onPress: handleOpen }),
    [handleOpen]
  );
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
    <>
      {trigger}
      <BottomSheet
        onClose={handleClose}
        sheetRef={ref}
        snapPoints={[300]}
        maxWidth={500}
        keyboardBehavior="interactive"
        footerComponent={() => (
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
              <Menu
                menuRef={menuRef}
                height={[350]}
                trigger={<Chip icon={<Icon>add</Icon>} />}
                onClose={() => nameRef.current?.focus()}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    gap: 20,
                  }}
                >
                  <IconButton
                    onPress={() => menuRef.current.close()}
                    variant="outlined"
                    size={55}
                  >
                    <Icon>close</Icon>
                  </IconButton>
                  <Text weight={700} style={{ fontSize: 23 }}>
                    Add
                  </Text>
                </View>
                <View style={styles.gridRow}>
                  <Pressable
                    style={({ pressed, hovered }: any) => [
                      styles.attachmentCard,
                      { backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3] },
                    ]}
                  >
                    <Avatar size={45}>
                      <Icon style={{ transform: [{ rotate: "-45deg" }] }}>
                        attachment
                      </Icon>
                    </Avatar>
                    <Text style={styles.attachmentCardText}>Location</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed, hovered }: any) => [
                      styles.attachmentCard,
                      { backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3] },
                    ]}
                  >
                    <Avatar size={45}>
                      <Icon>link</Icon>
                    </Avatar>
                    <Text style={styles.attachmentCardText}>Link</Text>
                  </Pressable>
                </View>
                <View style={styles.gridRow}>
                  <Pressable
                    style={({ pressed, hovered }: any) => [
                      styles.attachmentCard,
                      { backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3] },
                    ]}
                  >
                    <Avatar size={45}>
                      <Icon>sticky_note_2</Icon>
                    </Avatar>
                    <Text style={styles.attachmentCardText}>Note</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed, hovered }: any) => [
                      styles.attachmentCard,
                      { backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3] },
                    ]}
                  >
                    <Avatar size={45}>
                      <Icon>cloud</Icon>
                    </Avatar>
                    <Text style={styles.attachmentCardText}>Image</Text>
                  </Pressable>
                </View>
              </Menu>
            </View>
            <Menu
              menuRef={dateMenuRef}
              height={[440 + 23.5]}
              trigger={
                <Chip
                  style={{ marginLeft: "auto" }}
                  icon={<Icon>calendar_today</Icon>}
                  label={date ? date.format("MMM Do") : undefined}
                />
              }
            >
              <DateTimePicker
                value={date}
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
                onValueChange={(date) => setDate(dayjs(date))}
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
        )}
      >
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
                    if (e.length === 1) {
                      onChange(capitalizeFirstLetter(e.replaceAll("\n", "")));
                    } else {
                      onChange(e.replaceAll("\n", ""));
                    }
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
                    ...(Platform.OS === "web" &&
                      ({ outlineStyle: "none" } as any)),
                  }}
                />
              )}
              name="name"
            />
          </View>
        </View>
      </BottomSheet>
    </>
  );
}
