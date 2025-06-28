import { useLabelColors } from "@/components/labels/useLabelColors";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import Icon from "@/ui/Icon";
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
  header,
}: {
  label: any;
  trigger: ReactElement;
  onLabelUpdate: any;
  header?: string;
}) {
  const theme = useColorTheme();
  const menuRef = useRef<BottomSheetModal>(null);
  const colors = useLabelColors();
  const { session } = useSession();
  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      emoji: label.emoji,
      name: label.name,
      color: label.color,
    },
  });
  const color = watch("color");

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

  const handleButtonClick = handleSubmit(onSubmit, () =>
    Toast.show({ type: "error", text1: "Please type a name" })
  );

  return (
    <>
      {_trigger}
      <Modal
        animation="SLIDE"
        onClose={() => menuRef.current?.close?.()}
        sheetRef={menuRef}
        maxWidth={400}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 20,
            gap: 20,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              flex: 1,
              paddingLeft: 10,
              fontFamily: "serifText700",
            }}
          >
            {header || "Create label"}
          </Text>
          <IconButton variant="filled" onPress={() => menuRef.current.close()}>
            <Icon>close</Icon>
          </IconButton>
        </View>
        <View
          style={{
            gap: 10,
            paddingBottom: 20,
            paddingHorizontal: 30,
          }}
        >
          <View
            style={{
              alignItems: "center",
              gap: 10,
              flexDirection: "row",
            }}
          >
            <Controller
              render={({ field: { onChange, value } }) => (
                <EmojiPicker
                  onClose={() => nameRef.current.focus()}
                  setEmoji={onChange}
                >
                  <IconButton
                    variant="outlined"
                    size={70}
                    style={{
                      borderStyle: "dashed",
                      borderWidth: 2,
                    }}
                    borderColors={{
                      default: colors[color][7],
                      hovered: colors[color][8],
                      pressed: colors[color][9],
                    }}
                    backgroundColors={{
                      default: colors[color][4],
                      hovered: colors[color][5],
                      pressed: colors[color][6],
                    }}
                  >
                    <Emoji emoji={value || "1f4ad"} size={40} />
                  </IconButton>
                </EmojiPicker>
              )}
              name="emoji"
              control={control}
            />

            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flexWrap: "wrap",
                    flex: 1,
                  }}
                >
                  {Object.keys(colors).map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => onChange(color)}
                      style={() => ({
                        borderRadius: 15,
                        backgroundColor: colors[color][6],
                        borderWidth: 2,
                        height: 35,
                        width: `${100 / 5}%`,
                        borderColor: theme[2],
                        alignItems: "center",
                        justifyContent: "center",
                      })}
                    >
                      {value === color && (
                        <Icon
                          style={{
                            color: colors[color][11],
                          }}
                          bold
                        >
                          done_outline
                        </Icon>
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
              name="color"
            />
          </View>

          <Controller
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                variant="filled+outlined"
                style={{
                  height: 60,
                  fontSize: 20,
                  textAlign: "center",
                  paddingHorizontal: 25,
                  borderRadius: 99,
                  marginTop: 10,
                }}
                onKeyPress={(e: any) => {
                  if (e.key === "Escape") menuRef.current?.close?.();
                }}
                placeholder="Label name"
                inputRef={nameRef}
                onBlur={onBlur}
                weight={900}
                onChangeText={onChange}
                value={value}
                onSubmitEditing={handleButtonClick}
              />
            )}
            name="name"
            control={control}
          />

          <Button
            height={60}
            onPress={handleButtonClick}
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

