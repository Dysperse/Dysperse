import LabelPicker from "@/components/labels/picker";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import AutoSizeTextArea from "@/ui/AutoSizeTextArea";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { useLabelColors } from "../../labels/useLabelColors";
import { TaskShareButton } from "./TaskShareButton";
import { TaskCompleteButton } from "./attachment/TaskCompleteButton";
import { TaskAttachmentButton } from "./attachment/button";
import { useTaskDrawerContext } from "./context";
import { TaskDetails } from "./details";

function TaskNameInput() {
  const breakpoints = useResponsiveBreakpoints();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();
  const theme = useColorTheme();
  const [name, setName] = useState(task.name);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <>
      <AutoSizeTextArea
        onBlur={() => {
          setIsFocused(false);
          if (name === task.name) return;
          setName(name.replaceAll("\n", ""));
          updateTask("name", name.replaceAll("\n", ""));
        }}
        onChangeText={(text) => setName(text)}
        enterKeyHint="done"
        textAlign="center"
        value={name}
        onKeyPress={(e) => {
          if (e.nativeEvent.key === "Enter") {
            e.preventDefault();
            e.target.blur();
          }
        }}
        disabled={isReadOnly}
        onFocus={() => setIsFocused(true)}
        style={[
          {
            fontFamily: "body_800",
            color: theme[12],
            padding: 20,
            paddingVertical: 10,
            marginTop: 10,
            textAlign: "center",
            borderRadius: 20,
            borderWidth: 2,
            shadowRadius: 0,
            borderColor: "transparent",
          },
          isFocused && {
            backgroundColor: theme[3],
            borderColor: theme[6],
          },
        ]}
        fontSize={breakpoints.md ? 40 : 30}
      />
    </>
  );
}

export function TaskDrawerContent({ handleClose }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const labelColors = useLabelColors();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();
  const menuRef = useRef<BottomSheetModal>(null);

  const rotate = useSharedValue(task.pinned ? -35 : 0);

  const handlePriorityChange = useCallback(() => {
    rotate.value = withSpring(!task.pinned ? -35 : 0, {
      mass: 1,
      damping: 10,
      stiffness: 200,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 2,
    });
    updateTask("pinned", !task.pinned);
  }, [task.pinned, updateTask, rotate]);

  const handleDelete = useCallback(async () => {
    try {
      const t = !task.trash;
      updateTask("trash", t);
      Toast.show({
        type: "success",
        text1: t ? "Task deleted!" : "Task restored!",
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later",
      });
    }
  }, [updateTask, task]);

  // Rotate the pin icon by 45 degrees if the task is pinned using react-native-reanimated
  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotate.value}deg`,
        },
      ],
    };
  });

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme[2],
          paddingHorizontal: 20,
          left: 0,
        }}
      >
        <View
          style={{
            paddingTop: breakpoints.md ? 20 : 10,
            flexDirection: "row",
            gap: 10,
            width: "100%",
          }}
        >
          <IconButton
            onPress={handleClose}
            style={{ borderWidth: 1, borderColor: theme[6] }}
            size={50}
            icon="close"
          />
          <View style={{ flex: 1 }} />
          <TaskShareButton />
          <TaskCompleteButton />
          {!isReadOnly && (
            <IconButton
              style={{ borderWidth: 1, borderColor: theme[6] }}
              size={50}
              onPress={handleDelete}
              icon={task.trash ? "restore_from_trash" : "delete"}
            />
          )}
          {!isReadOnly && (
            <TaskAttachmentButton
              menuRef={menuRef}
              task={task}
              updateTask={updateTask}
            />
          )}
        </View>
      </View>
      <LinearGradient
        colors={[theme[2], "transparent"]}
        style={{ height: 40, width: "100%", marginBottom: -40, zIndex: 1 }}
      />
      <BottomSheetScrollView>
        <View style={{ paddingBottom: 50, paddingHorizontal: 20 }}>
          <View
            style={{
              paddingHorizontal: 10,
              gap: 10,
              marginTop: 50,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Chip
              disabled={isReadOnly}
              onPress={handlePriorityChange}
              icon={
                <Animated.View style={rotateStyle}>
                  <Icon
                    filled={task.pinned}
                    style={{
                      ...(task.pinned ? { color: labelColors.orange[3] } : {}),
                    }}
                  >
                    push_pin
                  </Icon>
                </Animated.View>
              }
              style={{
                backgroundColor: task.pinned
                  ? labelColors.orange[11]
                  : "transparent",
                borderWidth: 1,
                borderColor: task.pinned ? labelColors.orange[3] : theme[6],
              }}
            />
            {task && (
              <LabelPicker
                label={task.labelId}
                setLabel={(e) => {
                  updateTask("labelId", (e as any).id);
                  updateTask("label", e, false);
                }}
                onClose={() => {}}
                autoFocus
                disabled={Boolean(task.label?.integrationParams)}
              >
                <Chip
                  disabled={isReadOnly}
                  icon={<Icon>new_label</Icon>}
                  label="Add label"
                  style={({ pressed }) => ({
                    backgroundColor: theme[pressed ? 4 : 2],
                    borderWidth: 1,
                    borderColor: theme[6],
                  })}
                  {...(task.label && {
                    icon: <Emoji emoji={task.label.emoji} />,
                    label: (
                      <Text
                        style={{ color: labelColors[task.label.color][11] }}
                      >
                        {task.label.name}
                      </Text>
                    ),
                    style: {
                      backgroundColor: labelColors[task.label.color][5],
                    },
                  })}
                />
              </LabelPicker>
            )}
          </View>
          <TaskNameInput />
          <TaskDetails />
        </View>
      </BottomSheetScrollView>
    </>
  );
}
