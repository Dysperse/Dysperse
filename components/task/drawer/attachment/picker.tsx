import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import React, { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export function TaskAttachmentPicker({
  placeholder,
  updateTask,
  onAttachmentCreate,
  task,
  handleParentClose,
  footer = null,
  multiline,
  type,
}: {
  placeholder: string;
  updateTask?: any;
  onAttachmentCreate: (newData) => void;
  task: any;
  handleParentClose: any;
  footer?: JSX.Element;
  multiline?: boolean;
  type: string;
}) {
  const theme = useColorTheme();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      data: type == "NOTE" ? task?.note ?? "" : "",
    },
  });

  const onSubmit = useCallback(
    async (values) => {
      try {
        await updateTask(
          type === "NOTE" ? "note" : "attachments",
          type === "NOTE"
            ? values.data
            : [...task.attachments, { type, data: values.data }]
        );
        setIsLoading(false);
      } catch {
        Toast.show({
          type: "error",
          text1: "Something went wrong. Please try again later",
        });
      } finally {
        handleParentClose();
        setIsLoading(false);
      }
    },
    [updateTask, handleParentClose, type, task]
  );

  return (
    <View style={{ padding: 20, gap: 20, flex: 1 }}>
      <Controller
        control={control}
        rules={{
          required: true,
          pattern:
            type === "LINK"
              ? // eslint-disable-next-line no-useless-escape
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
              : undefined,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            bottomSheet
            placeholder={placeholder}
            variant="filled+outlined"
            style={{
              paddingHorizontal: 25,
              paddingVertical: 15,
              fontSize: 20,
              borderRadius: 30,
              ...(multiline && {
                flex: 1,
              }),
            }}
            multiline={multiline}
            autoFocus
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
          />
        )}
        name="data"
      />
      {footer}
      <Button
        onPress={handleSubmit(onSubmit, () => {
          Toast.show({
            type: "error",
            text1: "Please enter a " + type.toLowerCase(),
          });
        })}
        isLoading={isLoading}
        style={({ pressed, hovered }: any) => ({
          backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
          width: "100%",
          height: 60,
          marginBottom: -20,
        })}
      >
        <ButtonText style={{ fontSize: 20 }}>Done</ButtonText>
        <Icon>check</Icon>
      </Button>
    </View>
  );
}
