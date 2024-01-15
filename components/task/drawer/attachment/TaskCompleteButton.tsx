import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useBottomSheet } from "@gorhom/bottom-sheet";
import React, { useState } from "react";
import { useColorScheme } from "react-native";
import Toast from "react-native-toast-message";
import { useTaskDrawerContext } from "../context";

export function TaskCompleteButton() {
  const theme = useColorTheme();
  const { sessionToken } = useUser();
  const { task, updateTask, mutateList } = useTaskDrawerContext();
  const green = useColor("green", useColorScheme() == "dark");
  const isCompleted = task.completionInstances.length > 0;
  const [isLoading, setIsLoading] = useState(false);
  const { animatedIndex } = useBottomSheet();

  const handlePress = async () => {
    try {
      const newArr = isCompleted ? [] : [...task.completionInstances, true];
      updateTask("completionInstances", newArr, false);
      await sendApiRequest(
        sessionToken,
        isCompleted ? "DELETE" : "POST",
        "space/entity/complete-task",
        {},
        {
          body: JSON.stringify({
            id: task.id,
            recurring: false,
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

  return (
    <>
      <IconButton
        style={({ pressed, hovered }) => ({
          borderWidth: 1,
          borderColor: isCompleted
            ? green[pressed ? 8 : hovered ? 7 : 6]
            : theme[pressed ? 8 : hovered ? 7 : 6],
          backgroundColor: isCompleted
            ? green[pressed ? 6 : hovered ? 5 : 4]
            : theme[pressed ? 4 : hovered ? 3 : 2],
        })}
        size={55}
        onPress={handlePress}
      >
        {isLoading ? (
          <Spinner color={isCompleted ? green[11] : theme[11]} />
        ) : (
          <Icon
            size={27}
            style={{
              color: isCompleted ? green[11] : theme[11],
            }}
          >
            done_outline
          </Icon>
        )}
      </IconButton>
    </>
  );
}
