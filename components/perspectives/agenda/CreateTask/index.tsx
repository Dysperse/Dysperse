import { BottomSheetBackHandler } from "@/ui/BottomSheet/BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "@/ui/BottomSheet/BottomSheetBackdropComponent";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { cloneElement, useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View, TextInput, Pressable, Platform } from "react-native";

export default function CreateTask({ children, defaultValues = {} }) {
  const ref = useRef<BottomSheetModal>(null);
  const nameRef = useRef<TextInput>();

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
  const handleOpen = useCallback(() => {
    ref.current?.present();
  }, []);
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
        <View className="px-6 py-5 h-full">
          <View className="flex-row" style={{ gap: 10 }}>
            <Chip icon={<Icon>priority_high</Icon>} />
            <Chip icon={<Icon>label</Icon>} />
          </View>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                autoFocus
                ref={nameRef as any}
                placeholder="Task name"
                onBlur={onBlur}
                onChangeText={(e) => onChange(e.replaceAll("\n", ""))}
                value={value}
                className="outline-none"
                placeholderTextColor="#aaa"
                multiline
                style={{
                  fontFamily: "body_400",
                  minHeight: 80,
                  fontSize: 40,
                  ...(Platform.OS === "web" &&
                    ({ outlineStyle: "none" } as any)),
                }}
              />
            )}
            name="firstName"
          />
          <View className="flex-row -ml-2 items-center mt-auto border-t pt-3 border-gray-200">
            <IconButton>
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
              className="bg-gray-300 rounded-full ml-auto w-14 items-center justify-center h-9"
            >
              <Icon style={{ marginTop: -4 }}>add</Icon>
            </Pressable>
          </View>
        </View>
      </BottomSheetModal>
    </>
  );
}
