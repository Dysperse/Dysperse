import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { getTaskCompletionStatus } from "@/helpers/getTaskCompletionStatus";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import React, { cloneElement, memo } from "react";
import { Platform, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";

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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isActive.value ? 0.9 : 1),
      },
    ],
  }));

  const isCompleted = getTaskCompletionStatus(task, task.recurrenceDay);

  const handlePress = async () => {
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

    Toast.show({
      type: "success",
      text1: isCompleted ? "Marked incomplete" : "Marked complete",
      props: {
        renderTrailingIcon: () => (
          <IconButton
            icon="undo"
            size={40}
            style={{
              marginRight: 5,
              marginLeft: -10,
            }}
            backgroundColors={{
              default: theme[5],
              hovered: theme[6],
              pressed: theme[7],
            }}
            onPress={() => {
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

              Toast.hide();
            }}
          />
        ),
      },
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
  };

  const disabled = isReadOnly || (task.recurrenceRule && !task.recurrenceDay);

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
        disabled={disabled}
        onTouchStart={() => (isActive.value = 1)}
        onTouchEnd={() => (isActive.value = 0)}
        {...(Platform.OS === "web" && {
          onMouseDown: () => (isActive.value = 1),
          onMouseUp: () => (isActive.value = 0),
        })}
        onPress={() => handlePress()}
      >
        <Animated.View
          style={[
            animatedStyle,
            {
              borderColor: theme[isCompleted ? 11 : 12],
              opacity: isCompleted ? 0.7 : 0.45,
              width: 25,
              height: 25,
              borderWidth: 1.5,
              borderRadius: 99,
              backgroundColor: isCompleted ? theme[11] : undefined,
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
