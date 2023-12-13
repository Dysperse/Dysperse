import { BottomSheetBackHandler } from "@/ui/BottomSheet/BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "@/ui/BottomSheet/BottomSheetBackdropComponent";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { BottomSheetModal, BottomSheetTextInput } from "@gorhom/bottom-sheet";
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
        snapPoints={[135]}
        enablePanDownToClose
        keyboardBlurBehavior="restore"
        backdropComponent={BottomSheetBackdropComponent}
        containerStyle={{
          maxWidth: 500,
          margin: "auto",
        }}
      >
        <BottomSheetBackHandler handleClose={handleClose} />
        <View className="px-5 py-4">
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <BottomSheetTextInput
                ref={nameRef as any}
                placeholder="Task name"
                onBlur={onBlur}
                autoFocus
                onChangeText={onChange}
                value={value}
                className="outline-none"
                placeholderTextColor="#aaa"
                style={{
                  fontFamily: "body_400",
                  fontSize: 20,
                  ...(Platform.OS === "web" &&
                    ({ outlineStyle: "none" } as any)),
                }}
              />
            )}
            name="firstName"
          />
          <View className="flex-row -ml-2 mt-2 items-center">
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
