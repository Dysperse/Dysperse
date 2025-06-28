import { AttachStep } from "@/context/OnboardingProvider";
import IconButton from "@/ui/IconButton";
import { setStringAsync } from "expo-clipboard";
import { shareAsync } from "expo-sharing";
import React, { useCallback } from "react";
import { Platform } from "react-native";
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

  return isReadOnly ? null : (
    <AttachStep index={0}>
      <IconButton
        onPress={() => {
          updateTask({ published: true });
          handleCopy();
        }}
        size={45}
        icon="ios_share"
        iconStyle={{ marginTop: -3 }}
      />
      {/* <View>
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
      </View> */}
    </AttachStep>
  );
}

