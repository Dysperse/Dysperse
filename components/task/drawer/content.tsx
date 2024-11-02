import LabelPicker from "@/components/labels/picker";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import AutoSizeTextArea from "@/ui/AutoSizeTextArea";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { useLabelColors } from "../../labels/useLabelColors";
import { TaskShareButton } from "./TaskShareButton";
import { TaskCompleteButton } from "./attachment/TaskCompleteButton";
import { useTaskDrawerContext } from "./context";
import { TaskDetails } from "./details";

function TaskNameInput({ bottomSheet }) {
  const breakpoints = useResponsiveBreakpoints();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();
  const theme = useColorTheme();
  const [name, setName] = useState(task.name);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <>
      <AutoSizeTextArea
        bottomSheet={bottomSheet}
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
          if (e.nativeEvent.key === "Enter" || e.nativeEvent.key === "Escape") {
            e.preventDefault();
            e.target.blur();
          }
        }}
        disabled={isReadOnly}
        onFocus={() => setIsFocused(true)}
        style={[
          {
            fontFamily: "serifText800",
            color: theme[12],
            padding: 20,
            paddingVertical: 10,
            marginBottom: 5,
            textAlign: "center",
            borderRadius: 20,
            borderWidth: 2,
            shadowRadius: 0,
            borderColor: "transparent",
          },
          isFocused && {
            backgroundColor: addHslAlpha(theme[8], 0.1),
            borderColor: addHslAlpha(theme[8], 0.5),
          },
        ]}
        fontSize={breakpoints.md ? 40 : 30}
      />
    </>
  );
}

export function TaskDrawerContent({
  handleClose,
  forceClose,
}: {
  handleClose: () => void;
  forceClose?: (config?: any) => void;
}) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const labelColors = useLabelColors();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();
  const { id: collectionId } = useGlobalSearchParams();
  const rotate = useSharedValue(task.pinned ? -35 : 0);

  const SafeScrollView = forceClose ? BottomSheetScrollView : ScrollView;

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

  const handleDelete = useCallback(
    async (d) => {
      try {
        const t = typeof d === "boolean" ? d : !task.trash;
        updateTask("trash", t);
        Toast.show({
          type: "success",
          text1: t ? "Task deleted!" : "Task restored!",

          props: {
            renderTrailingIcon: !t
              ? null
              : () => (
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
                    onPress={() => handleDelete(false)}
                  />
                ),
          },
        });
      } catch (e) {
        Toast.show({
          type: "error",
          text1: "Something went wrong. Please try again later",
        });
      }
    },
    [updateTask, task]
  );

  useHotkeys(["delete", "backspace"], () => handleDelete(true));

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
          {forceClose && (
            <IconButton
              onPress={() => {
                handleClose();
                forceClose(
                  breakpoints.md
                    ? undefined
                    : { overshootClamping: true, stiffness: 400 }
                );
              }}
              variant="outlined"
              size={50}
              icon="close"
            />
          )}
          <View style={{ flex: 1 }} />
          {!isReadOnly && (
            <IconButton
              variant="outlined"
              size={50}
              onPress={handleDelete}
              icon={task.trash ? "restore_from_trash" : "delete"}
            />
          )}
          <TaskShareButton />
          {!isReadOnly && <TaskCompleteButton />}
        </View>
      </View>
      <LinearGradient
        colors={[theme[2], "transparent"]}
        style={{ height: 40, width: "100%", marginBottom: -40, zIndex: 1 }}
      />
      <SafeScrollView showsHorizontalScrollIndicator={false}>
        <View style={{ paddingBottom: 30, paddingHorizontal: 20 }}>
          <View
            style={{
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
            {task && !task.parentTaskId && (
              <LabelPicker
                label={task.label}
                setLabel={(e) => {
                  updateTask("labelId", (e as any).id);
                  updateTask("label", e, false);
                }}
                onClose={() => {}}
                defaultCollection={collectionId as any}
                // disabled={Boolean(task.label?.integrationParams)}
              >
                <Chip
                  disabled={isReadOnly}
                  icon={
                    task?.collection?.emoji ? (
                      <Emoji emoji={task?.collection?.emoji} />
                    ) : (
                      <Icon>new_label</Icon>
                    )
                  }
                  label={task?.collection?.name || "Add label"}
                  style={{
                    borderWidth: 1,
                    borderColor: theme[6],
                  }}
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
                      backgroundColor: addHslAlpha(
                        labelColors[task.label.color][11],
                        0.15
                      ),
                    },
                  })}
                />
              </LabelPicker>
            )}
          </View>
          <TaskNameInput bottomSheet={Boolean(forceClose)} />
          <TaskDetails />
        </View>
      </SafeScrollView>
    </>
  );
}

