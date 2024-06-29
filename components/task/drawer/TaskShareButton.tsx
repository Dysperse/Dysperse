import { Avatar } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { setStringAsync } from "expo-clipboard";
import React, { useCallback, useRef } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { useTaskDrawerContext } from "./context";

export function TaskShareButton() {
  const theme = useColorTheme();
  const { isReadOnly, task, updateTask } = useTaskDrawerContext();
  const menuRef = useRef<BottomSheetModal>(null);

  const handleClose = useCallback(() => menuRef.current?.close(), []);
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

      setTimeout(() => {
        setTimeout(handleClose, 200);
      }, 0);
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later.",
      });
    }
  }, [task, updateTask, handleClose, handleCopy]);

  return isReadOnly ? null : (
    <>
      <IconButton
        variant="outlined"
        size={50}
        icon="ios_share"
        onPress={handleOpen}
      />
      <BottomSheet
        onClose={handleClose}
        snapPoints={[250]}
        sheetRef={menuRef}
        maxWidth={400}
      >
        <View style={{ padding: 10 }}>
          <Text
            style={{ fontSize: 30, marginBottom: 10, marginLeft: 10 }}
            weight={900}
          >
            Publish
          </Text>
          <ListItemButton onPress={handleShare}>
            <Avatar size={40} icon="ios_share" disabled />
            <ListItemText
              primary={`Sharing ${task.published ? "enabled" : "disabled"}`}
              secondary={
                task.published
                  ? "Anyone with the link can view this task"
                  : "Only you can view this task"
              }
            />
            <Icon
              size={35}
              style={{ marginRight: 10, opacity: task.published ? 1 : 0.7 }}
            >
              {task.published ? "toggle_on" : "toggle_off"}
            </Icon>
          </ListItemButton>
          <ListItemButton onPress={() => handleCopy()}>
            <Avatar size={40} icon="link" disabled />
            <ListItemText primary="Copy link" />
          </ListItemButton>
        </View>
      </BottomSheet>
    </>
  );
}
