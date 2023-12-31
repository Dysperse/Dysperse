import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import Icon from "@/ui/Icon";
import { useColorTheme } from "@/ui/color/theme-provider";
import React from "react";
import { Pressable, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

export function TaskCheckbox({
  task,
  mutateList,
}: {
  task: any;
  mutateList: any;
}) {
  const theme = useColorTheme();
  const { session } = useSession();

  const isCompleted = task.completionInstances.length > 0;

  const handlePress = async () => {
    const newArr = isCompleted ? [] : [...task.completionInstances, true];
    mutateList({
      ...task,
      completionInstances: newArr,
    });
    await sendApiRequest(
      session,
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
  };

  return (
    <Pressable
      style={({ pressed, hovered }) => ({
        padding: 10,
        margin: -10,
        opacity: pressed ? 0.5 : hovered ? 0.6 : 1,
      })}
      onPress={handlePress}
    >
      <View
        style={{
          borderColor: theme[isCompleted ? 8 : 6],
          width: 25,
          height: 25,
          borderRadius: 99,
          borderWidth: 2,
          backgroundColor: isCompleted ? theme[8] : undefined,
          alignItems: "center",
        }}
      >
        {isCompleted && (
          <Icon
            bold
            size={20}
            style={{
              lineHeight: 24.5,
              color: theme[1],
            }}
          >
            check
          </Icon>
        )}
      </View>
    </Pressable>
  );
}
