import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, View } from "react-native";
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
      data: type == "NOTE" ? task.note ?? "" : "",
    },
  });

  const { session } = useSession();

  const onSubmit = useCallback(
    async (values) => {
      try {
        if (type === "NOTE") {
          await updateTask("note", values.data);
          setIsLoading(false);
          return;
        }
        if (typeof onAttachmentCreate === "function") {
          onAttachmentCreate(values.location);
          return;
        }
        Keyboard.dismiss();
        setIsLoading(true);
        const d = await sendApiRequest(
          session,
          "POST",
          "space/entity/attachments",
          {},
          {
            body: JSON.stringify({
              id: task.id,
              type,
              data: values.data,
            }),
          }
        );
        updateTask("attachments", [...task.attachments, d], false);
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
    [session, task, updateTask, onAttachmentCreate, handleParentClose, type]
  );

  useEffect(() => {
    if (errors.data) {
      Toast.show({
        type: "error",
        text1: "Please enter a " + type.toLowerCase(),
      });
    }
  }, [errors.data, type]);

  return (
    <View style={{ padding: 20, gap: 20, flex: 1 }}>
      <Controller
        control={control}
        rules={{ required: true }}
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
        onPress={handleSubmit(onSubmit)}
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
