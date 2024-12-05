import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Modal from "@/ui/Modal";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { setStringAsync } from "expo-clipboard";
import React, { useCallback, useRef } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { useTaskDrawerContext } from "./context";

export function TaskShareButton() {
  const { isReadOnly, task, updateTask } = useTaskDrawerContext();
  const menuRef = useRef<BottomSheetModal>(null);

  const handleOpen = useCallback(() => menuRef.current?.present(), []);
  const link = `https://dys.us.to/${task.shortId || task.id}`;

  const handleCopy = useCallback(async () => {
    setStringAsync(link);
    Toast.show({
      type: "success",
      text1: "Copied link to clipboard!",
    });
  }, [link]);

  const handleShare = useCallback(async () => {
    try {
      updateTask("published", !task.published);
      if (!task.published) handleCopy();
      else Toast.show({ type: "success", text1: "Task sharing disabled" });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later.",
      });
    }
  }, [task, updateTask, handleCopy]);

  return isReadOnly ? null : (
    <>
      <MenuPopover
        trigger={<IconButton size={45} icon="ios_share" onPress={handleOpen} />}
        containerStyle={{ width: 180 }}
        options={[
          {
            icon: `toggle_${task.published ? "on" : "off"}`,
            text: `Sharing ${task.published ? "enabled" : "disabled"}`,
            callback: handleShare,
          },
          {
            icon: "content_copy",
            text: "Copy link",
            callback: handleCopy,
          },
        ]}
      />
      <Modal
        animation="SCALE"
        maxWidth={420}
        snapPoints={[250]}
        sheetRef={menuRef}
      >
        <View style={{ padding: 20 }}></View>
      </Modal>
    </>
  );
}
