import LabelPicker from "@/components/labels/picker";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import AutoSizeTextArea from "@/ui/AutoSizeTextArea";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useCallback, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { useLabelColors } from "../../labels/useLabelColors";
import { TaskCompleteButton } from "./attachment/TaskCompleteButton";
import { TaskAttachmentButton } from "./attachment/button";
import { useTaskDrawerContext } from "./context";
import { TaskDetails } from "./details";

function TaskNameInput() {
  const { task, updateTask } = useTaskDrawerContext();
  const theme = useColorTheme();
  const [name, setName] = useState(task.name);

  return (
    <AutoSizeTextArea
      onBlur={(e) => {
        if (name === task.name) return;
        updateTask("name", name);
      }}
      onChangeText={(text) => setName(text.replaceAll("\n", ""))}
      value={name}
      style={{
        fontFamily: "body_200",
        color: theme[12],
        paddingHorizontal: 20,
        marginVertical: 20,
        textAlign: "center",
      }}
      fontSize={50}
    />
  );
}

export function TaskDrawerContent({ handleClose }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const labelColors = useLabelColors();
  const { task, updateTask, mutateList } = useTaskDrawerContext();

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
      updateTask("trash", true);
      handleClose();
      mutateList({ ...task, trash: true });
      Toast.show({
        type: "success",
        text1: "Task deleted!",
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later",
      });
    }
  }, [handleClose, updateTask, mutateList, task]);

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
          paddingBottom: 10,
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
            size={55}
          >
            <Icon size={28}>close</Icon>
          </IconButton>
          <View style={{ flex: 1 }} />
          <TaskCompleteButton />
          <IconButton
            style={{ borderWidth: 1, borderColor: theme[6] }}
            size={55}
            onPress={handleDelete}
          >
            <Icon size={27}>delete</Icon>
          </IconButton>
          <TaskAttachmentButton />
        </View>
      </View>
      <BottomSheetScrollView>
        <View style={{ paddingBottom: 20, paddingHorizontal: 20 }}>
          <View
            style={{
              paddingHorizontal: 10,
              gap: 10,
              marginTop: 30,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Chip
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
            <LabelPicker
              label={task.labelId}
              setLabel={(e) => {
                updateTask("labelId", e.id);
                updateTask("label", e, false);
              }}
              onClose={() => {}}
              autoFocus={false}
              disabled={Boolean(task.label?.integrationParams)}
            >
              <Chip
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
                    <Text style={{ color: labelColors[task.label.color][11] }}>
                      {task.label.name}
                    </Text>
                  ),
                  style: {
                    backgroundColor: labelColors[task.label.color][5],
                  },
                })}
              />
            </LabelPicker>
          </View>
          <TaskNameInput />
          <TaskDetails />
        </View>
      </BottomSheetScrollView>
    </>
  );
}
