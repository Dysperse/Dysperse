import { useBadgingService } from "@/context/BadgingProvider";
import { AttachStep } from "@/context/OnboardingProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { getTaskCompletionStatus } from "@/helpers/getTaskCompletionStatus";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { addHslAlpha, useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useBottomSheet } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import React from "react";
import { View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import Toast from "react-native-toast-message";
import { useTaskDrawerContext } from "../context";

export function TaskCompleteButton() {
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const { sessionToken } = useUser();
  const { task, updateTask, mutateList, isReadOnly, dateRange } =
    useTaskDrawerContext();
  const green = useColor("green");
  const { animatedIndex } = useBottomSheet();
  const [showConfetti, setShowConfetti] = React.useState(false);

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

      if (!isCompleted) setShowConfetti(true);

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
        <AttachStep
          index={1}
          style={{ minWidth: 120, flex: breakpoints.md ? 2 : undefined }}
        >
          <Button
            bold
            large
            onPress={handlePress}
            icon={isCompleted ? "celebration" : "east"}
            text={isCompleted ? "Done!" : "Finish"}
            variant="filled"
            iconPosition="end"
            containerStyle={{
              opacity: disabled ? undefined : 1,
            }}
            iconStyle={{ color: isCompleted ? green[11] : theme[11] }}
            textStyle={{ color: isCompleted ? green[11] : theme[11] }}
            backgroundColors={{
              default: isCompleted
                ? addHslAlpha(green[11], 0.2)
                : addHslAlpha(theme[11], 0.1),
              hovered: isCompleted
                ? addHslAlpha(green[11], 0.3)
                : addHslAlpha(theme[11], 0.2),
              pressed: isCompleted
                ? addHslAlpha(green[11], 0.4)
                : addHslAlpha(theme[11], 0.3),
            }}
          />
        </AttachStep>
        {showConfetti && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 150,
              height: 150,
              pointerEvents: "none",
            }}
          >
            <ConfettiCannon
              count={25}
              origin={{ x: 50, y: 30 }}
              fallSpeed={800}
              colors={[
                green[11],
                green[10],
                green[9],
                green[8],
                green[7],
                green[6],
              ]}
              explosionSpeed={1000}
              fadeOut
            />
          </View>
        )}
      </>
    )
  );
}

