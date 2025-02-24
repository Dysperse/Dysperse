import { useBadgingService } from "@/context/BadgingProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { getTaskCompletionStatus } from "@/helpers/getTaskCompletionStatus";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
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
  const breakpoints = useResponsiveBreakpoints();

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
      <>
        <IconButton
          disabled={disabled}
          style={{
            borderWidth: 1,
            opacity: disabled ? undefined : 1,
            marginLeft: 5,
            width: "auto",
            borderRadius: 16,
            width: breakpoints.md ? 140 : 45,
          }}
          pressableStyle={{
            flexDirection: "row",
            gap: 10,
            paddingHorizontal: 10,
            paddingRight: breakpoints.md ? 14 : undefined,
          }}
          backgroundColors={{
            default: isCompleted ? green[9] : theme[3],
            hovered: isCompleted ? green[10] : theme[4],
            pressed: isCompleted ? green[11] : theme[5],
          }}
          size={45}
          onPress={handlePress}
        >
          <Icon
            filled={isCompleted}
            size={27}
            style={{
              color: isCompleted ? green[1] : theme[11],
            }}
            bold
          >
            check
          </Icon>
          {breakpoints.md && (
            <Text
              style={{
                color: isCompleted ? green[1] : theme[11],
              }}
            >
              {isCompleted ? "Complete!" : "Mark done"}
            </Text>
          )}
        </IconButton>
      </>
    )
  );
}

