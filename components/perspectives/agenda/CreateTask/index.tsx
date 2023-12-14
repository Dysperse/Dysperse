import AutoSizeTextArea from "@/ui/AutoSizeTextArea";
import { BottomSheetBackHandler } from "@/ui/BottomSheet/BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "@/ui/BottomSheet/BottomSheetBackdropComponent";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { cloneElement, useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, Pressable, View } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { AutoGrowingTextInput } from "react-native-autogrow-textinput";

export default function CreateTask({
  showClose = false,
  children,
  defaultValues = {
    date: dayjs().utc(),
  },
}) {
  const ref = useRef<BottomSheetModal>(null);

  const [date, setDate] = useState(defaultValues.date);

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
  const onSubmit = (data) => console.log(data);

  // callbacks
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  return (
    <>
      {trigger}
      <BottomSheetModal
        ref={ref}
        snapPoints={["50%"]}
        backdropComponent={BottomSheetBackdropComponent}
        containerStyle={{
          maxWidth: 500,
          margin: "auto",
        }}
      >
        <BottomSheetBackHandler handleClose={handleClose} />
        <View className="pt-2 flex-1">
          <View className="flex-row mb-4 px-5" style={{ gap: 10 }}>
            {showClose && (
              <Chip
                icon={<Icon>arrow_back_ios_new</Icon>}
                onPress={handleClose}
              />
            )}
            <Chip outlined={showClose} icon={<Icon>priority_high</Icon>} />
            <Chip outlined={showClose} icon={<Icon>label</Icon>} />
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
                <BottomSheetTextInput
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
                  placeholderTextColor="#aaa"
                  multiline
                  style={{
                    fontFamily: "body_400",
                    fontSize: 35,
                    minHeight: "100%",
                    flex: 1,
                    paddingHorizontal: 20,
                    paddingBottom: 80,
                    ...(Platform.OS === "web" &&
                      ({ outlineStyle: "none" } as any)),
                  }}
                />
              )}
              name="firstName"
            />
          </View>
        </View>
        <View
          className="px-5"
          style={{
            shadowColor: "#eee",
            shadowRadius: 20,
            shadowOpacity: 1,
          }}
        >
          <View className="flex-row items-center mt-auto border-t py-2 border-gray-200 bg-white">
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
              onPress={onSubmit}
              className="bg-gray-300 rounded-full ml-auto w-14 items-center justify-center h-9 active:opacity-60"
            >
              <Icon style={{ marginTop: -4 }}>add</Icon>
            </Pressable>
          </View>
        </View>
      </BottomSheetModal>
    </>
  );
}
