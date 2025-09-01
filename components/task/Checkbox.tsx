import { useSession } from "@/context/AuthProvider";
import { useBadgingService } from "@/context/BadgingProvider";
import { sendApiRequest } from "@/helpers/api";
import { getTaskCompletionStatus } from "@/helpers/getTaskCompletionStatus";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import React, { cloneElement, memo } from "react";
import { Platform, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { toast } from "sonner-native";

function TaskCheckbox({
  task,
  mutateList,
  isReadOnly,
  children,
}: {
  task: any;
  mutateList: any;
  isReadOnly: boolean;
  children?: any;
}) {
  const theme = useColorTheme();
  const { session } = useSession();

  const isActive = useSharedValue(0);
  const badgingService = useBadgingService();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isActive.value ? 0.9 : 1),
      },
    ],
  }));

  const isCompleted = getTaskCompletionStatus(task, task.recurrenceDay);

  const handlePress = async () => {
    if (Platform.OS !== "web") impactAsync(ImpactFeedbackStyle.Heavy);
    let newArr = isCompleted ? [] : [...task.completionInstances, true];
    let iteration = null;
    if (task.recurrenceRule) {
      iteration = task.recurrenceDay;
      newArr = isCompleted
        ? task.completionInstances.filter(
            (instance) =>
              dayjs(instance.iteration).toISOString() !==
              dayjs(task.recurrenceDay).toISOString()
          )
        : [...task.completionInstances, { iteration }];
    }
    mutateList({
      ...task,
      completionInstances: newArr,
    });

    toast.success(isCompleted ? "Marked incomplete" : "Marked complete", {
      styles: {
        toastContainer: { height: 10 },
      },
      close: (
        <Button
          icon="undo"
          dense
          containerStyle={{
            position: "absolute",
            right: 10,
          }}
          text="Undo"
          backgroundColors={{
            default: theme[5],
            hovered: theme[6],
            pressed: theme[7],
          }}
          onPress={() => {
            impactAsync(ImpactFeedbackStyle.Heavy);
            let newArr = !isCompleted
              ? []
              : [...task.completionInstances, true];
            let iteration = null;

            if (task.recurrenceRule) {
              iteration = task.recurrenceDay;
              newArr = isCompleted
                ? task.completionInstances.filter(
                    (instance) =>
                      dayjs(instance.iteration).toISOString() !==
                      dayjs(task.recurrenceDay).toISOString()
                  )
                : [...task.completionInstances, { iteration }];
            }

            mutateList({
              ...task,
              completionInstances: newArr,
            });

            toast.dismiss();
          }}
        />
      ),
    });

    await sendApiRequest(
      session,
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
    badgingService.current.mutate();
  };

  const disabled =
    isReadOnly || (task.recurrenceRule && !task.recurrenceDay) || !session;

  const trigger = cloneElement(children || <Pressable />, {
    onPress: handlePress,
  });

  return children ? (
    trigger
  ) : (
    <>
      <Pressable
        style={() => ({
          padding: 10,
          margin: -10,
          opacity: disabled ? 0.5 : 1,
        })}
        onTouchStart={() => (isActive.value = 1)}
        onTouchEnd={() => (isActive.value = 0)}
        {...(Platform.OS === "web" && {
          onMouseDown: () => (isActive.value = 1),
          onMouseUp: () => (isActive.value = 0),
        })}
        onPress={() => {
          if (disabled) {
            if (task.recurrenceRule && !task.recurrenceDay)
              return toast.info("This task is recurring", {
                description: "Switch to a time-based view to mark as done",
              });
            return;
          }
          handlePress();
        }}
      >
        {({ pressed, hovered }) => (
          <Animated.View
            style={[
              animatedStyle,
              {
                borderColor: theme[isCompleted ? 11 : 12],
                opacity: isCompleted ? 0.7 : 0.45,
                width: 25,
                height: 25,
                borderWidth: isCompleted ? 1 : hovered ? 2 : 1,
                borderRadius: 99,
                backgroundColor: isCompleted
                  ? theme[11]
                  : addHslAlpha(theme[11], pressed ? 0.2 : hovered ? 0.1 : 0),
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
        )}
      </Pressable>
    </>
  );
}

export default memo(TaskCheckbox);

