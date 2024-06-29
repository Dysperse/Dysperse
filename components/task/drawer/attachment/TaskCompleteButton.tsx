import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useBottomSheet } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import React from "react";
import Toast from "react-native-toast-message";
import { useTaskDrawerContext } from "../context";
import { normalizeRecurrenceRuleObject } from "../details";

export function TaskCompleteButton() {
  const theme = useColorTheme();
  const { sessionToken } = useUser();
  const { task, updateTask, mutateList, isReadOnly, dateRange } =
    useTaskDrawerContext();
  const green = useColor("green");

  const isCompleted = task.recurrenceRule
    ? dateRange &&
      task.completionInstances.find((instance) =>
        dayjs(instance.iteration).isBetween(
          dateRange[0],
          dateRange[1],
          "day",
          "[]"
        )
      )
    : task.completionInstances.length > 0;

  const { animatedIndex } = useBottomSheet();

  const handlePress = async () => {
    try {
      let newArr = isCompleted ? [] : [...task.completionInstances, true];
      updateTask("completionInstances", newArr, false);
      let iteration = null;

      if (task.recurrenceRule) {
        const rule = normalizeRecurrenceRuleObject(task.recurrenceRule);
        const instances = rule.between(dateRange[0], dateRange[1]);
        iteration = instances[0].toISOString();
        newArr = isCompleted
          ? task.completionInstances.filter(
              (instance: string) =>
                !dayjs(instance).isBetween(
                  dateRange[0],
                  dateRange[1],
                  "day",
                  "[]"
                )
            )
          : [...task.completionInstances, { iteration }];
      }

      await sendApiRequest(
        sessionToken,
        isCompleted ? "DELETE" : "POST",
        "space/entity/complete-task",
        {},
        {
          body: JSON.stringify({
            id: task.id,
            date: new Date().toISOString(),
            ...(iteration && { iteration }),
          }),
        }
      );

      if (animatedIndex.value === -1) {
        mutateList({
          ...task,
          completionInstances: newArr,
        });
      }
    } catch (e) {
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
          }}
          variant="outlined"
          borderColors={{
            default: isCompleted ? green[9] : theme[6],
            hovered: isCompleted ? green[10] : theme[7],
            pressed: isCompleted ? green[11] : theme[8],
          }}
          backgroundColors={{
            default: isCompleted ? green[9] : theme[2],
            hovered: isCompleted ? green[10] : theme[3],
            pressed: isCompleted ? green[11] : theme[4],
          }}
          size={50}
          onPress={handlePress}
        >
          <Icon
            filled={isCompleted}
            size={27}
            style={{
              color: isCompleted ? green[1] : theme[11],
            }}
          >
            done_outline
          </Icon>
        </IconButton>
      </>
    )
  );
}
