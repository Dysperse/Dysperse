import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import Icon from "@/ui/Icon";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import React, { memo } from "react";
import { Platform, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { RRule } from "rrule";

function TaskCheckbox({
  task,
  mutateList,
  isReadOnly,
  dateRange,
}: {
  task: any;
  mutateList: any;
  isReadOnly: boolean;
  dateRange: [Date, Date];
}) {
  const theme = useColorTheme();
  const { session } = useSession();

  const isActive = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isActive.value ? 0.9 : 1),
      },
    ],
  }));

  const isCompleted = task.recurrenceRule
    ? task.dateRange &&
      task.completionInstances.find((instance) =>
        dayjs(instance.iteration).isBetween(
          dateRange[0],
          dateRange[1],
          "day",
          "[]"
        )
      )
    : task.completionInstances.length > 0;

  const handlePress = async () => {
    let newArr = isCompleted ? [] : [...task.completionInstances, true];
    let iteration = null;

    if (task.recurrenceRule) {
      const rule = new RRule(task.recurrenceRule);
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
          ...(iteration && { iteration }),
        }),
      }
    );
  };

  return (
    <>
      <Pressable
        style={() => ({
          padding: 10,
          margin: -10,
          marginTop: -11,
        })}
        disabled={isReadOnly || (task.recurrenceRule && !dateRange)}
        onTouchStart={() => (isActive.value = 1)}
        onTouchEnd={() => (isActive.value = 0)}
        {...(Platform.OS === "web" && {
          onMouseDown: () => (isActive.value = 1),
          onMouseUp: () => (isActive.value = 0),
        })}
        onPress={handlePress}
      >
        <Animated.View
          style={[
            animatedStyle,
            {
              borderColor: theme[isCompleted ? 8 : 6],
              width: 25,
              height: 25,
              borderWidth: 1,
              borderRadius: 99,
              backgroundColor: isCompleted ? theme[8] : undefined,
              alignItems: "center",
            },
          ]}
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
        </Animated.View>
      </Pressable>
    </>
  );
}

export default memo(TaskCheckbox);
