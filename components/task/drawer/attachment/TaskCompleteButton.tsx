import { useBadgingService } from "@/context/BadgingProvider";
import { AttachStep } from "@/context/OnboardingProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { getTaskCompletionStatus } from "@/helpers/getTaskCompletionStatus";
import { Button } from "@/ui/Button";
import { addHslAlpha, useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useBottomSheet } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import React from "react";
import Toast from "react-native-toast-message";
import { useTaskDrawerContext } from "../context";

export function TaskCompleteButton() {
  const theme = useColorTheme();
  const { sessionToken } = useUser();
  const { task, updateTask, mutateList, isReadOnly, dateRange } =
    useTaskDrawerContext();
  const green = useColor("green");
  const { animatedIndex } = useBottomSheet();

  const isCompleted = getTaskCompletionStatus(task, dateRange);
  const badgingService = useBadgingService();

  const handlePress = async () => {
    try {
      impactAsync(ImpactFeedbackStyle.Heavy);
      if (task.recurrenceRule && !dateRange) return;
      let newArr = isCompleted ? [] : [...task.completionInstances, true];

      if (task.recurrenceRule) {
        newArr = isCompleted
          ? task.completionInstances.filter(
              (instance) =>
                dayjs(instance.iteration).toISOString() !==
                dayjs(dateRange).toISOString()
            )
          : [
              ...task.completionInstances,
              {
                completedAt: dayjs().toISOString(),
                iteration: dateRange,
                taskId: task.id,
              },
            ];
      }
      updateTask({ completionInstances: newArr }, false);

      sendApiRequest(
        sessionToken,
        isCompleted ? "DELETE" : "POST",
        "space/entity/complete-task",
        {},
        {
          body: JSON.stringify({
            id: task.id,
            date: dayjs().toISOString(),
            ...(task.recurrenceRule && { iteration: dateRange }),
          }),
        }
      ).then(() => {
        badgingService.mutate();
      });

      if (animatedIndex.value === -1) {
        mutateList({
          ...task,
          completionInstances: newArr,
        });
      }
    } catch (e) {
      console.error(e);
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later.",
      });
    }
  };

  const disabled = isReadOnly || (task.recurrenceRule && !dateRange);

  return (
    !isReadOnly && (
      <AttachStep index={1}>
        <Button
          large
          onPress={handlePress}
          bold
          text={isCompleted ? "Complete!" : "Mark done"}
          icon="check"
          variant="filled"
          iconPosition="end"
          containerStyle={{
            flexShrink: 0,
            width: 170,
            opacity: disabled ? undefined : 1,
          }}
          textStyle={{
            color: isCompleted ? green[4] : theme[11],
          }}
          iconStyle={{
            color: isCompleted ? green[4] : theme[11],
            marginRight: -5,
          }}
          backgroundColors={{
            default: isCompleted ? green[9] : addHslAlpha(theme[11], 0.1),
            hovered: isCompleted ? green[10] : addHslAlpha(theme[11], 0.2),
            pressed: isCompleted ? green[11] : addHslAlpha(theme[11], 0.3),
          }}
        />
      </AttachStep>
    )
  );
}

