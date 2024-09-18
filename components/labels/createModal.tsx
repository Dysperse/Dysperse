import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Modal from "@/ui/Modal";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, {
  ReactElement,
  cloneElement,
  useCallback,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { useLabelColors } from "./useLabelColors";

export function CreateLabelModal({
  children,
  mutate,
  onClose = () => null,
  onCreate = () => null,
  sheetRef = null,
}: {
  children: ReactElement;
  mutate: any;
  onClose?: () => void;
  onCreate?: (newLabel: any) => void;
  sheetRef?: React.RefObject<BottomSheetModal>;
}) {
  const theme = useColorTheme();
  const _ref = useRef<BottomSheetModal>(null);
  const { sessionToken } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const ref = sheetRef || _ref;

  const handleOpen = useCallback(() => {
    Keyboard.dismiss();
    ref.current?.present();
  }, []);
  const handleClose = useCallback(() => {
    ref.current?.close?.();
    onClose();
  }, [onClose]);
  const trigger = cloneElement(children, { onPress: handleOpen });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
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
      const data = await sendApiRequest(
        sessionToken,
        "POST",
        "space/labels",
        {},
        {
          body: JSON.stringify(e),
        }
      );
      onCreate?.(data);
      Toast.show({
        type: "success",
        text1: "Created label!",
      });
      await mutate(data);
      setIsLoading(false);
      reset();
      setTimeout(() => {
        handleClose();
      }, 500);
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
      <Modal sheetRef={ref} maxWidth={460} height={500} animation="SCALE">
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 15,
            gap: 20,
          }}
        >
          <IconButton
            variant="outlined"
            size={55}
            onPress={() => ref.current.close()}
          >
            <Icon>close</Icon>
          </IconButton>
          <Text weight={700} style={{ fontSize: 23, flex: 1 }}>
            Create label
          </Text>
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
                  <EmojiPicker setEmoji={onChange}>
                    <IconButton variant="filled">
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
                    bottomSheet
                    placeholder="Label name"
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
                          borderColor: colors[color][color === value ? 7 : 9],
                        })}
                      />
                    ))}
                  </View>
                )}
                name="color"
              />
            </View>
            <Button
              onPress={() => {
                Keyboard.dismiss();
                if (Object.keys(errors).length > 0) {
                  return Toast.show({
                    type: "error",
                    text1: "Type in a label name",
                  });
                }
                handleSubmit(onSubmit)();
              }}
              height={60}
              variant="filled"
              isLoading={isLoading}
              bold
              large
              iconPosition="end"
              text="Done"
              icon="done"
            />
          </View>
        </ScrollView>
      </Modal>
    </>
  );
}

