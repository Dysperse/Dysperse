import { orange } from "@/themes";
import BottomSheet from "@/ui/BottomSheet";
import { BottomSheetBackHandler } from "@/ui/BottomSheet/BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "@/ui/BottomSheet/BottomSheetBackdropComponent";
import { Button } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import dayjs, { Dayjs } from "dayjs";
import { cloneElement, useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, Pressable, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";

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
    console.log(data);
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
              shadowColor: "#eee",
              shadowRadius: 20,
              shadowOpacity: 1,
            }}
          >
            <View
              className="flex-row items-center mt-auto border-t py-2 h-full"
              style={{ backgroundColor: theme[1], borderColor: theme[5] }}
            >
              <IconButton style={{ marginLeft: -5 }}>
                <Icon>location_on</Icon>
              </IconButton>
              <IconButton>
                <Icon>sticky_note_2</Icon>
              </IconButton>
              <IconButton>
                <Icon>attach_file</Icon>
              </IconButton>
              <Pressable
                onPress={handleSubmit(onSubmit)}
                className="rounded-full ml-auto w-14 items-center justify-center h-9 active:opacity-60"
                style={{ backgroundColor: theme[3] }}
              >
                <Icon style={{ marginTop: -4 }}>add</Icon>
              </Pressable>
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
              icon={<Icon>priority_high</Icon>}
              style={{
                ...(pinned && {
                  backgroundColor: orange["orange4"],
                  borderColor: orange["orange4"],
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
