import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { setStringAsync } from "expo-clipboard";
import React, { useCallback, useRef } from "react";
import Toast from "react-native-toast-message";
import { useTaskDrawerContext } from "./context";

export function TaskShareButton() {
  const { isReadOnly, task, updateTask } = useTaskDrawerContext();
  const menuRef = useRef<BottomSheetModal>(null);

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
        trigger={<IconButton size={45} icon="ios_share" />}
        containerStyle={{ width: 200 }}
        options={[
          {
            icon: `toggle_${task.published ? "on" : "off"}`,
            text: `Sharing ${task.published ? "enabled" : "disabled"}`,
            callback: handleShare,
          },
          task.published && {
            icon: "content_copy",
            text: "Copy link",
            callback: handleCopy,
          },
        ]}
      />
    </>
  );
}

