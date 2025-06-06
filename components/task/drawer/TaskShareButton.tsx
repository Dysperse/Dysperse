import { AttachStep } from "@/context/OnboardingProvider";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import { setStringAsync } from "expo-clipboard";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { shareAsync } from "expo-sharing";
import React, { useCallback } from "react";
import { Platform, View } from "react-native";
import Toast from "react-native-toast-message";
import { useTaskDrawerContext } from "./context";

export function TaskShareButton() {
  const { isReadOnly, task, updateTask } = useTaskDrawerContext();

  const link = `https://dys.us.to/${task.shortId || task.id}`;

  const handleCopy = useCallback(async () => {
    setStringAsync(link);
    shareAsync(link, { dialogTitle: "Dysperse" });
    if (Platform.OS === "web")
      Toast.show({
        type: "success",
        text1: "Copied link to clipboard!",
      });
  }, [link]);

  const handleShare = useCallback(async () => {
    try {
      updateTask({ published: !task.published });
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
    <AttachStep index={0}>
      <View>
        <MenuPopover
          trigger={
            <IconButton
              onLongPress={() => {
                impactAsync(ImpactFeedbackStyle.Heavy);
                updateTask({ published: true });
                handleCopy();
              }}
              size={45}
              icon="ios_share"
              iconStyle={{ marginTop: -3 }}
            />
          }
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
      </View>
    </AttachStep>
  );
}

