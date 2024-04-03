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
import { RRule } from "rrule";
import { useTaskDrawerContext } from "../context";

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
        const rule = new RRule({
          ...task.recurrenceRule,
          dtstart: new Date(task.recurrenceRule.dtstart),
        });
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
    <>
      <IconButton
        disabled={disabled}
        style={({ pressed, hovered }) => ({
          borderWidth: 1,
          opacity: disabled ? undefined : 1,
          borderColor: isCompleted
            ? green[pressed ? 11 : hovered ? 10 : 9]
            : theme[pressed ? 8 : hovered ? 7 : 6],
          backgroundColor: isCompleted
            ? green[pressed ? 11 : hovered ? 10 : 9]
            : theme[pressed ? 4 : hovered ? 3 : 2],
        })}
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
  );
}
