import { AttachStep } from "@/context/OnboardingProvider";
import { Button } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { setStringAsync } from "expo-clipboard";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { shareAsync } from "expo-sharing";
import React, { useCallback } from "react";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";
import { useTaskDrawerContext } from "./context";

export function TaskShareButton() {
  const theme = useColorTheme();
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
    <AttachStep index={0} style={{ flex: 1 }}>
      <Button
        large
        bold
        onPress={() => {
          impactAsync(ImpactFeedbackStyle.Heavy);
          updateTask({ published: true });
          handleCopy();
        }}
        icon="ios_share"
        variant="filled"
        backgroundColors={{
          default: addHslAlpha(theme[11], 0.1),
          hovered: addHslAlpha(theme[11], 0.2),
          pressed: addHslAlpha(theme[11], 0.3),
        }}
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

