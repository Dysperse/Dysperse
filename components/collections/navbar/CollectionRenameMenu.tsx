import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { Menu } from "@/ui/Menu";
import { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ReactElement, memo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { useCollectionContext } from "../context";

export const CollectionRenameMenu = memo(function CollectionRenameMenu({
  children,
}: {
  children: ReactElement;
}) {
  const { session } = useSession();
  const { data, mutate } = useCollectionContext();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: data.name,
      emoji: data.emoji,
    },
  });
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<BottomSheetModal>(null);

  const handleSave = async (newData) => {
    try {
      setLoading(true);
      await sendApiRequest(
        session,
        "PUT",
        "space/collections",
        {},
        {
          body: JSON.stringify({ ...newData, id: data.id }),
        }
      );
      await mutate();
      Toast.show({ type: "success", text1: "Saved!" });
    } catch (e) {
      Toast.show({ type: "error", text1: "Something went wrong" });
    } finally {
      setLoading(false);
      menuRef.current?.close();
    }
  };

  return (
    <Menu
      height={[207]}
      menuRef={menuRef}
      trigger={
        <MenuItem>
          <Icon>edit</Icon>
          <Text variant="menuItem" weight={300}>
            Name & icon
          </Text>
        </MenuItem>
      }
    >
      <View
        style={{
          padding: 20,
          paddingVertical: 0,
          gap: 20,
          flexDirection: "row",
        }}
      >
        <Controller
          name="emoji"
          rules={{ required: true }}
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <EmojiPicker emoji={value} setEmoji={onChange}>
              <IconButton
                variant="outlined"
                style={{ borderStyle: "dashed", borderWidth: 2 }}
                size={70}
              >
                <Emoji emoji={value} size={40} />
              </IconButton>
            </EmojiPicker>
          )}
        />
        <Controller
          name="name"
          rules={{ required: true }}
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              placeholder="Collection name"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              variant="filled+outlined"
              style={{
                paddingHorizontal: 20,
                paddingVertical: 15,
                fontSize: 20,
                flex: 1,
                width: "100%",
                borderColor: errors.name ? "red" : undefined,
              }}
            />
          )}
        />
      </View>
      <View style={{ padding: 20, paddingTop: 0 }}>
        <Button
          onPress={handleSubmit(handleSave, () =>
            Toast.show({ type: "error", text1: "Please type in a name" })
          )}
          variant="filled"
          isLoading={loading}
          style={{ height: 60, marginTop: 20 }}
        >
          <ButtonText style={{ fontSize: 20 }} weight={800}>
            Save
          </ButtonText>
        </Button>
      </View>
    </Menu>
  );
});
