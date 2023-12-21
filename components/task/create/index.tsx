import { Avatar } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { Menu } from "@/ui/Menu";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import dayjs, { Dayjs } from "dayjs";
import React, { cloneElement, useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import Toast from "react-native-toast-message";

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
});

function ColorPicker({ children, color, setColor }) {
  const ref = useRef<BottomSheetModal>(null);
  // callbacks
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });
  const theme = useColorTheme();

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        onClose={handleClose}
        snapPoints={["80%"]}
        containerStyle={{
          maxWidth: 500,
          margin: "auto",
        }}
        footerComponent={() => (
          <View className="flex-row justify-end p-4 pt-0">
            <Button variant="filled">
              <Text>Done</Text>
            </Button>
          </View>
        )}
      >
        <View className="p-4">
          <TextInput
            placeholderTextColor="#aaa"
            autoFocus={Platform.OS !== "web"}
            className="p-2 px-4 bg-gray-200 rounded-2xl"
            style={{
              backgroundColor: theme[4],
            }}
            placeholder="Search..."
          />
        </View>
      </BottomSheet>
    </>
  );
}

export default function CreateTask({
  showClose = false,
  children,
  defaultValues = {
    date: dayjs().utc(),
  },
}) {
  const menuRef = useRef<BottomSheetModal>(null);
  const orange = useColor("orange", useColorScheme() === "dark");
  const theme = useColorTheme();
  const ref = useRef<BottomSheetModal>(null);

  const [date, setDate] = useState<Dayjs>(defaultValues.date);
  const [pinned, setPinned] = useState<boolean>(false);
  const [color, setColor] = useState("gray");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });
  const onSubmit = (data) => {
    Toast.show({
      type: "success",
      text1: "Hello",
      text2: JSON.stringify(data),
    });
  };

  // callbacks
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  const handlePriorityChange = useCallback(() => {
    setPinned((p) => !p);
  }, []);

  return (
    <>
      {trigger}
      <BottomSheet
        onClose={handleClose}
        sheetRef={ref}
        snapPoints={["50%"]}
        containerStyle={{
          maxWidth: 500,
          margin: "auto",
        }}
        footerComponent={() => (
          <View
            className="px-5"
            style={{
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
                height={[200]}
                trigger={
                  <IconButton
                    variant="filled"
                    style={{
                      width: 40,
                      height: 40,
                    }}
                  >
                    <Icon size={30}>add</Icon>
                  </IconButton>
                }
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 20,
                    marginTop: 20,
                    paddingHorizontal: 20,
                  }}
                >
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
                      <Icon>cloud</Icon>
                    </Avatar>
                    <Text style={styles.attachmentCardText}>Image</Text>
                  </Pressable>
                </View>
              </Menu>
            </View>
          </View>
        )}
      >
        <View className="pt-2 flex-1">
          <View className="flex-row mb-4 px-5" style={{ gap: 10 }}>
            {showClose && (
              <Chip
                icon={<Icon>arrow_back_ios_new</Icon>}
                onPress={handleClose}
              />
            )}
            <Chip
              outlined={showClose}
              onPress={handlePriorityChange}
              icon={
                <Icon
                  style={{
                    ...(pinned && { color: orange[11] }),
                  }}
                >
                  priority_high
                </Icon>
              }
              style={{
                ...(pinned && {
                  backgroundColor: orange[4],
                  borderColor: orange[4],
                }),
              }}
            />
            <ColorPicker color={color} setColor={setColor}>
              <Chip outlined={showClose} icon={<Icon>label</Icon>} />
            </ColorPicker>
            <Chip
              outlined={showClose}
              icon={<Icon>calendar_today</Icon>}
              label={date.format("MMM Do")}
            />
            <Chip
              icon={<Icon>north</Icon>}
              style={{ marginLeft: "auto" }}
              onPress={() => {
                handleSubmit(onSubmit)();
                if (errors) {
                  Toast.show({
                    type: "error",
                    text1: "Type in a task name",
                  });
                }
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
              name="firstName"
            />
          </View>
        </View>
      </BottomSheet>
    </>
  );
}
