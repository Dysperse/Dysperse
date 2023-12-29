import AutoSizeTextArea from "@/ui/AutoSizeTextArea";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useCallback } from "react";
import { View } from "react-native";
import { useLabelColors } from "../../labels/useLabelColors";
import { TaskDetails } from "./details";
import { useTaskDrawerContext } from "./context";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { LabelPicker } from "@/components/labels/picker";

export function TaskDrawerContent({ handleClose }) {
  const theme = useColorTheme();
  const labelColors = useLabelColors();
  const { task, updateTask } = useTaskDrawerContext();

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
    <BottomSheetScrollView stickyHeaderIndices={[0]}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme[2],
          paddingHorizontal: 20,
          height: 60,
          left: 0,
        }}
      >
        <View
          style={{
            paddingTop: 10,
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
          <IconButton
            style={{ borderWidth: 1, borderColor: theme[6] }}
            size={55}
          >
            <Icon size={27}>done_outline</Icon>
          </IconButton>
          <IconButton
            style={{ borderWidth: 1, borderColor: theme[6] }}
            size={55}
          >
            <Icon size={27}>delete</Icon>
          </IconButton>
          <IconButton
            style={{ borderWidth: 1, borderColor: theme[6] }}
            size={55}
          >
            <Icon size={27}>edit</Icon>
          </IconButton>
        </View>
      </View>
      <View style={{ paddingBottom: 20, paddingHorizontal: 12 }}>
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
            label=""
            setLabel={() => {}}
            onClose={() => {}}
            autoFocus={false}
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
                  backgroundColor: labelColors[task.label.color][4],
                },
              })}
            />
          </LabelPicker>
        </View>
        <AutoSizeTextArea
          inputDefaultValue={task.name.trim()}
          style={{
            fontFamily: "heading",
            color: theme[12],
            paddingHorizontal: 20,
            marginVertical: 20,
            textAlign: "center",
            lineHeight: 53,
          }}
          fontSize={50}
        />
        <TaskDetails />
      </View>
    </BottomSheetScrollView>
  );
}
