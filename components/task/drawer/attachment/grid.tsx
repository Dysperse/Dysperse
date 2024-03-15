import { Avatar } from "@/ui/Avatar";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Platform, Pressable, View } from "react-native";
import { styles } from "../../create/styles";

export function AttachmentGrid({
  task,
  updateTask,
  setView,
  menuRef,
}: {
  task: any;
  updateTask: any;
  setView: any;
  menuRef: React.MutableRefObject<BottomSheetModal>;
}) {
  const theme = useColorTheme();

  const taskMenuCardStyle = ({ pressed, hovered }: any) => [
    styles.attachmentCard,
    { backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3] },
  ];

  const menuRows = [
    [
      { icon: "location_on", text: "Location" },
      { icon: "link", text: "Link" },
    ],
    [
      { icon: "sticky_note_2", text: "Note" },
      { icon: "camera_alt", text: "Image" },
    ],
  ];

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      presentationStyle: ImagePicker.UIImagePickerPresentationStyle.POPOVER,
    });

    if (!result.canceled) {
      // convert to File
      const blob = await fetch(result.assets[0].uri).then((r) => r.blob());
      const file = new File([blob], result.assets[0].fileName, {
        type: blob.type,
      });
      const form = new FormData();
      form.append("image", file);

      const res = await fetch(
        "https://api.imgbb.com/1/upload?key=9fb5ded732b6b50da7aca563dbe66dec",
        {
          method: "POST",
          body: form,
        }
      ).then((res) => res.json());
      updateTask("attachments", [
        ...(task?.attachments || []),
        { type: "IMAGE", data: res.data.display_url },
      ]);
      setTimeout(() => {
        menuRef.current.forceClose();
      }, 0);
    } else {
      alert("You did not select any image.");
    }
  };

  return menuRows.map((row, rowIndex) => (
    <View key={rowIndex} style={styles.gridRow}>
      {row.map((item, itemIndex) => (
        <Pressable
          key={itemIndex}
          onPress={() => {
            if (Platform.OS === "web" && item.text === "Image") {
              pickImageAsync();
              return;
            }
            setView(item.text);
          }}
          style={taskMenuCardStyle}
        >
          <Avatar size={45} disabled>
            <Icon>{item.icon}</Icon>
          </Avatar>
          <Text style={styles.attachmentCardText}>{item.text}</Text>
        </Pressable>
      ))}
    </View>
  ));
}
