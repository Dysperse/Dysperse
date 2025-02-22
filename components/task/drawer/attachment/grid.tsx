import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal, useBottomSheet } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Platform, View } from "react-native";
import Toast from "react-native-toast-message";
import { styles } from "../../create/styles";

const HotKeyTrigger = ({
  index,
  callback,
}: {
  index: number;
  callback: () => void;
}) => {
  useHotkeys(index.toString(), callback, {}, [index]);
  return null;
};

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
  const breakpoints = useResponsiveBreakpoints();
  const { forceClose } = useBottomSheet();

  const menuRows = [
    [
      { index: 1, icon: "location_on", text: "Location" },
      { index: 2, icon: "link", text: "Link" },
    ],
    [
      { index: 3, icon: "sticky_note_2", text: "Note" },
      { index: 4, icon: "camera_alt", text: "Image" },
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
      forceClose();
      Toast.show({
        type: "info",
        props: { loading: true },
        text1: "Uploading image...",
        swipeable: false,
        visibilityTime: 1e9,
      });
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
      Toast.hide();
      Toast.show({ type: "success", text1: "Image attached!" });
    } else {
      alert("You did not select any image.");
    }
  };

  return menuRows.map((row, rowIndex) => (
    <View key={rowIndex} style={styles.gridRow}>
      {row.map((item, itemIndex) => (
        <React.Fragment key={itemIndex}>
          <HotKeyTrigger
            callback={() => {
              if (Platform.OS === "web" && item.text === "Image") {
                pickImageAsync();
                return;
              }
              setView(item.text);
            }}
            index={item.index}
          />
          <Button
            onPress={() => {
              if (Platform.OS === "web" && item.text === "Image") {
                pickImageAsync();
                return;
              }
              setView(item.text);
            }}
            variant="filled"
            height={115}
            style={{
              alignItems: "flex-start",
              justifyContent: "flex-end",
              flexDirection: "column",
              padding: 15,
              paddingHorizontal: 15,
            }}
            containerStyle={{ flex: 1, borderRadius: 20 }}
          >
            <Avatar size={45} disabled>
              <Icon>{item.icon}</Icon>
            </Avatar>
            <Text
              style={[styles.attachmentCardText, { color: theme[11] }]}
              weight={900}
            >
              {item.text}
            </Text>
            {breakpoints.md && (
              <View
                style={{
                  width: 30,
                  height: 30,
                  alignItems: "center",
                  justifyContent: "center",
                  position: "absolute",
                  top: 10,
                  right: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    color: addHslAlpha(theme[11], 0.4),
                    fontFamily: "mono",
                  }}
                >
                  {item.index}
                </Text>
              </View>
            )}
          </Button>
        </React.Fragment>
      ))}
    </View>
  ));
}

