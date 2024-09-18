import { useLabelColors } from "@/components/labels/useLabelColors";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import IconButton from "@/ui/IconButton";
import Modal from "@/ui/Modal";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ReactElement, cloneElement, memo, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { InteractionManager, Pressable, View } from "react-native";
import Toast from "react-native-toast-message";

export const LabelEditModal = memo(function LabelEditModal({
  label,
  trigger,
  onLabelUpdate,
}: {
  label: any;
  trigger: ReactElement;
  onLabelUpdate: any;
}) {
  const menuRef = useRef<BottomSheetModal>(null);
  const colors = useLabelColors();
  const { session } = useSession();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      emoji: label.emoji,
      name: label.name,
      color: label.color,
    },
  });

  const onSubmit = async (updatedLabel) => {
    try {
      onLabelUpdate({ ...updatedLabel, id: label.id });
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => menuRef.current?.close(), 0);
      });
      await sendApiRequest(
        session,
        "PUT",
        "space/labels",
        {},
        { body: JSON.stringify({ ...updatedLabel, id: label.id }) }
      );
      Toast.show({ type: "success", text1: "Saved!" });
    } catch {
      Toast.show({ type: "error" });
    }
  };

  const _trigger = cloneElement(trigger, {
    onPress: () => {
      menuRef.current?.present();
      setTimeout(() => {
        nameRef.current?.focus({ preventScroll: true });
      }, 100);
    },
  });

  const nameRef = useRef(null);

  return (
    <>
      {_trigger}
      <Modal
        animation="SLIDE"
        onClose={() => menuRef.current.close()}
        sheetRef={menuRef}
        maxWidth={400}
      >
        <View
          style={{
            padding: 15,
            paddingVertical: 25,
            gap: 20,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Controller
            render={({ field: { onChange, value } }) => (
              <EmojiPicker setEmoji={onChange}>
                <IconButton
                  variant="outlined"
                  size={90}
                  style={{ borderWidth: 2, borderStyle: "dashed" }}
                >
                  <Emoji emoji={value || "1f4ad"} size={50} />
                </IconButton>
              </EmojiPicker>
            )}
            name="emoji"
            control={control}
          />
          <View style={{ width: "100%", gap: 5 }}>
            <Text variant="eyebrow">Name</Text>
            <Controller
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  variant="filled+outlined"
                  style={{
                    height: 60,
                    fontSize: 20,
                    borderRadius: 99,
                    textAlign: "center",
                    width: "100%",
                  }}
                  placeholder="Label name"
                  inputRef={nameRef}
                  onBlur={onBlur}
                  weight={900}
                  onChangeText={onChange}
                  value={value}
                  bottomSheet
                />
              )}
              name="name"
              control={control}
            />
          </View>
          <View style={{ width: "100%", gap: 10 }}>
            <Text variant="eyebrow">Color</Text>
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 10,
                    width: "100%",
                  }}
                >
                  {Object.keys(colors).map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => onChange(color)}
                      style={() => ({
                        flex: 1,
                        aspectRatio: 1,
                        borderRadius: 999,
                        backgroundColor: colors[color][6],
                        borderWidth: 3,
                        borderColor: colors[color][color === value ? 11 : 6],
                      })}
                    />
                  ))}
                </View>
              )}
              name="color"
            />
          </View>
          <Button
            height={60}
            onPress={handleSubmit(onSubmit, (err) =>
              Toast.show({ type: "error", text1: "Please type a name" })
            )}
            text="Done"
            icon="check"
            iconPosition="end"
            variant="filled"
            bold
            large
            containerStyle={{ width: "100%" }}
          />
        </View>
      </Modal>
    </>
  );
});
