import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Avatar } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import { Menu } from "@/ui/Menu";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import dayjs, { Dayjs } from "dayjs";
import React, {
  cloneElement,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import DateTimePicker from "react-native-ui-datepicker";

import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import IconButton from "@/ui/IconButton";
import TextField from "@/ui/TextArea";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { EmojiPicker } from "@/ui/EmojiPicker";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    zIndex: 100000000, // Ensure the menu is above other components
  },
  attachmentCard: {
    borderRadius: 25,
    padding: 20,
    flexDirection: "column",
    flex: 1,
  },
  attachmentCardText: {
    fontSize: 20,
    marginTop: 5,
    paddingLeft: 5,
    fontFamily: "body_700",
  },
  gridRow: {
    flexDirection: "row",
    gap: 15,
    marginTop: 15,
    paddingHorizontal: 15,
  },
});

const labelPickerStyles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    marginBottom: 10,
  },
  labelOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 25,
  },
  labelDot: {
    width: 25,
    height: 25,
    borderRadius: 999,
    marginRight: 15,
  },
  labelSubHeading: {
    opacity: 0.6,
  },
});

const useLabelColors = () => {
  const red = useColor("red", useColorScheme() === "dark");
  const orange = useColor("orange", useColorScheme() === "dark");
  const yellow = useColor("yellow", useColorScheme() === "dark");
  const green = useColor("green", useColorScheme() === "dark");
  const blue = useColor("blue", useColorScheme() === "dark");
  const purple = useColor("purple", useColorScheme() === "dark");
  const pink = useColor("pink", useColorScheme() === "dark");
  const brown = useColor("brown", useColorScheme() === "dark");
  const gray = useColor("gray", useColorScheme() === "dark");

  const colors = {
    red,
    orange,
    yellow,
    green,
    blue,
    purple,
    pink,
    brown,
    gray,
  };

  return colors;
};

function CreateLabelModal({ children, mutate }) {
  const theme = useColorTheme();
  const ref = useRef<BottomSheetModal>(null);
  const { sessionToken } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      color: "red",
      emoji: "1f600",
    },
  });

  const colors = useLabelColors();

  const onSubmit = async (e) => {
    try {
      setIsLoading(true);
      await sendApiRequest(
        sessionToken,
        "POST",
        "space/labels",
        {},
        {
          body: JSON.stringify(e),
        }
      );
      Toast.show({
        type: "success",
        text1: "Created label!",
      });
      await mutate();
      handleClose();
      setIsLoading(false);
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later.",
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        snapPoints={["50%"]}
        onClose={handleClose}
        stackBehavior="push"
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 10,
            gap: 20,
          }}
        >
          <IconButton onPress={() => ref.current.close()}>
            <Icon>close</Icon>
          </IconButton>
          <Text weight={700} style={{ fontSize: 23, flex: 1 }}>
            Create label
          </Text>
          <IconButton
            onPress={() => {
              if (Object.keys(errors).length > 0) {
                return Toast.show({
                  type: "error",
                  text1: "Type in a label name",
                });
              }
              handleSubmit(onSubmit)();
            }}
            variant="filled"
          >
            {isLoading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Icon>check</Icon>
            )}
          </IconButton>
        </View>
        <ScrollView>
          <View style={{ padding: 20, gap: 20 }}>
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, value } }) => (
                  <EmojiPicker emoji={value} setEmoji={onChange}>
                    <IconButton
                      style={{
                        borderStyle: "dashed",
                        borderWidth: 2,
                        width: 100,
                        height: 100,
                        borderColor: theme[7],
                      }}
                    >
                      <Emoji emoji={value} size={50} />
                    </IconButton>
                  </EmojiPicker>
                )}
                name="emoji"
              />
            </View>
            <View>
              <Text variant="eyebrow" style={{ marginBottom: 5 }}>
                Name
              </Text>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    placeholder="Task name"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    variant="filled"
                  />
                )}
                name="name"
              />
            </View>
            <View>
              <Text variant="eyebrow">Color</Text>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, value } }) => (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginTop: 10,
                      gap: 10,
                    }}
                  >
                    {Object.keys(colors).map((color) => (
                      <Pressable
                        key={color}
                        onPress={() => onChange(color)}
                        style={() => ({
                          width: 30,
                          height: 30,
                          borderRadius: 999,
                          backgroundColor: colors[color][9],
                          borderWidth: 3,
                          borderColor: colors[color][color === value ? 12 : 9],
                          shadowColor: colors[color][9],
                          shadowOffset: { width: 0, height: 0 },
                          shadowRadius: 10,
                        })}
                      />
                    ))}
                  </View>
                )}
                name="color"
              />
            </View>
          </View>
        </ScrollView>
      </BottomSheet>
    </>
  );
}

function LabelPicker({ children, label, setLabel }) {
  const ref = useRef<BottomSheetModal>(null);
  // callbacks
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  const theme = useColorTheme();
  const colors = useLabelColors();

  const { data, mutate, error } = useSWR(["space/labels"]);

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        stackBehavior="push"
        onClose={handleClose}
        snapPoints={["65%"]}
      >
        <View style={{ padding: 15 }}>
          <View
            style={[
              labelPickerStyles.searchBox,
              {
                backgroundColor: theme[3],
              },
            ]}
          >
            <IconButton onPress={handleClose}>
              <Icon>arrow_back_ios_new</Icon>
            </IconButton>
            <TextField
              style={{
                backgroundColor: theme[3],
                paddingHorizontal: 15,
                paddingVertical: 7,
                borderRadius: 99,
                flex: 1,
              }}
              placeholder="Search..."
              autoFocus={Platform.OS !== "web"}
            />
            <CreateLabelModal mutate={mutate}>
              <IconButton style={{ marginRight: 10 }}>
                <Icon>add</Icon>
              </IconButton>
            </CreateLabelModal>
          </View>
          <View
            style={{
              height: "100%",
              justifyContent: "center",
            }}
          >
            {data ? (
              <BottomSheetFlatList
                data={data}
                contentContainerStyle={{ flex: 1 }}
                ListEmptyComponent={
                  <View
                    style={{
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      paddingBottom: 70,
                      paddingHorizontal: 20,
                      gap: 5,
                    }}
                  >
                    <Emoji emoji="1f62d" size={50} />
                    <Text heading style={{ fontSize: 35, marginTop: 10 }}>
                      No labels
                    </Text>
                    <Text style={{ opacity: 0.6, textAlign: "center" }}>
                      Labels are a great way to{"\n"} group things together
                    </Text>
                    <CreateLabelModal mutate={mutate}>
                      <Button>
                        <Icon>add</Icon>
                        <ButtonText>Create one</ButtonText>
                      </Button>
                    </CreateLabelModal>
                  </View>
                }
                renderItem={({ item }: any) => (
                  <Pressable
                    onPress={() => {
                      setLabel(item);
                      handleClose();
                    }}
                    style={({ pressed, hovered }: any) => [
                      labelPickerStyles.labelOption,
                      {
                        backgroundColor: theme[pressed ? 4 : hovered ? 3 : 1],
                      },
                    ]}
                  >
                    <View
                      style={[
                        labelPickerStyles.labelDot,
                        {
                          backgroundColor: colors[item.color][9],
                        },
                      ]}
                    />
                    <View>
                      <Text weight={700}>{item.name}</Text>
                      <Text style={labelPickerStyles.labelSubHeading}>
                        {item._count.entities} item
                        {item._count.entities !== 1 && "s"}
                      </Text>
                    </View>
                  </Pressable>
                )}
              />
            ) : error ? (
              <ErrorAlert />
            ) : (
              <ActivityIndicator />
            )}
          </View>
        </View>
      </BottomSheet>
    </>
  );
}

function CreateTaskLabelInput({ control }) {
  const colors = useLabelColors();

  return (
    <Controller
      control={control}
      name="label"
      defaultValue={false}
      render={({ field: { onChange, value } }) => (
        <LabelPicker label={value} setLabel={onChange}>
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
                backgroundColor: colors[value?.color]?.[3],
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
  showClose = false,
  children,
  defaultValues = {
    date: dayjs().utc(),
  },
}: any) {
  const { sessionToken } = useUser();
  const menuRef = useRef<BottomSheetModal>(null);
  const dateMenuRef = useRef<BottomSheetModal>(null);
  const orange = useColor("orange", useColorScheme() === "dark");
  const theme = useColorTheme();
  const ref = useRef<BottomSheetModal>(null);

  const [date, setDate] = useState<Dayjs | null>(
    defaultValues.date || undefined
  );

  const {
    control,
    handleSubmit,
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
            pinned: String(data.pinned),
            labelId: data.label?.id,
            due: date?.toISOString(),
            type: "TASK",
          }),
        }
      ).then((e) => console.log(e));
      handleClose();
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
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });
  const calendarTextStyles = { color: theme[11], fontFamily: "body_400" };

  return (
    <>
      {trigger}
      <BottomSheet
        onClose={handleClose}
        sheetRef={ref}
        snapPoints={["50%"]}
        maxWidth={500}
        footerComponent={() => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingHorizontal: 20,
              height: 60,
              shadowColor: theme[3],
              shadowOffset: { width: 0, height: -40 },
              shadowRadius: 40,
              shadowOpacity: 0.3,
            }}
          >
            <View
              className="flex-row items-center mt-auto py-2 h-full"
              style={{ backgroundColor: theme[1], borderColor: theme[5] }}
            >
              <Menu
                menuRef={menuRef}
                height={[365]}
                trigger={<Chip icon={<Icon>add</Icon>} />}
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
                    variant="filled"
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
              height={[440]}
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
                  onPress={() => onChange(!value)}
                  icon={
                    <Icon
                      style={{
                        ...(value && {
                          color: orange[11],
                          transform: [{ rotate: "-45deg" }],
                        }),
                      }}
                      filled={value}
                    >
                      push_pin
                    </Icon>
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
            <CreateTaskLabelInput control={control} />
          </View>
        )}
      >
        <View className="pt-2 flex-1">
          <View
            style={{
              gap: 10,
              flexDirection: "row",
              paddingHorizontal: 20,
            }}
          >
            {showClose && (
              <Chip
                icon={<Icon>arrow_back_ios_new</Icon>}
                onPress={handleClose}
              />
            )}
            <Chip
              style={{ marginLeft: "auto" }}
              icon={<Icon>north</Icon>}
              onPress={() => {
                if (Object.keys(errors).length > 0) {
                  Toast.show({
                    type: "error",
                    text1: "Type in a task name",
                  });
                }
                handleSubmit(onSubmit)();
              }}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  autoFocus={Platform.OS !== "web"}
                  ref={(e) => {
                    if (Platform.OS === "web" && e?.focus) {
                      setTimeout(() => {
                        e.focus();
                      }, 100);
                    }
                  }}
                  placeholder="Task name"
                  onBlur={onBlur}
                  onKeyPress={(e: any) => {
                    if (e.key === "/") {
                      // alert(1);
                      menuRef.current.present();
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
                  cursorColor={theme[7]}
                  selectionColor={theme[4]}
                  multiline
                  style={{
                    color: theme[11],
                    fontFamily: "body_400",
                    fontSize: 35,
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
