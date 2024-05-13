import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
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
import { RRule } from "rrule";

function TaskCheckbox({
  task,
  mutateList,
  isReadOnly,
  dateRange,
  children,
}: {
  task: any;
  mutateList: any;
  isReadOnly: boolean;
  dateRange: [Date, Date];
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

  const handlePress = async (forceCompletion?: boolean) => {
    let newArr =
      isCompleted || !forceCompletion
        ? []
        : [...task.completionInstances, true];
    let iteration = null;

    if (task.recurrenceRule) {
      const rule = new RRule({
        ...task.recurrenceRule,
        dtstart: new Date(task.recurrenceRule.dtstart),
      });
      const instances = rule.between(dateRange[0], dateRange[1]);
      iteration = instances[0].toISOString();
      newArr =
        isCompleted || !forceCompletion
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
    const d = (e) => {
      e.preventDefault();
      if (e.ctrlKey && e.key === "z") {
        handlePress(isCompleted);
        Toast.show({
          type: "info",
          text1: "Changes undone",
        });
      }
    };

    Toast.show({
      type: "success",
      text1: isCompleted ? "Marked incomplete" : "Marked complete",
      onShow: () => {
        if (Platform.OS === "web") {
          // add ctrl+z to undo
          window.addEventListener("keydown", d);
        }
      },
      onHide: () => {
        if (Platform.OS === "web") {
          window.removeEventListener("keydown", d);
        }
      },
      props: {
        renderTrailingIcon: () => (
          <IconButton
            icon="undo"
            size={40}
            style={({ pressed, hovered }) => ({
              marginRight: 5,
              marginLeft: -10,
              backgroundColor: theme[pressed ? 7 : hovered ? 6 : 5],
            })}
            onPress={() => {
              handlePress(isCompleted);
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

  const disabled = isReadOnly || (task.recurrenceRule && !dateRange);
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
