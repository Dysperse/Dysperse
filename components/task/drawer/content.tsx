import LabelPicker from "@/components/labels/picker";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import AutoSizeTextArea from "@/ui/AutoSizeTextArea";
import { Avatar } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { setStringAsync } from "expo-clipboard";
import React, { useCallback, useRef, useState } from "react";
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

function TaskShareButton() {
  const theme = useColorTheme();
  const { isReadOnly, task, updateTask } = useTaskDrawerContext();
  const menuRef = useRef<BottomSheetModal>(null);

  const handleClose = useCallback(() => menuRef.current?.close(), []);
  const handleOpen = useCallback(() => menuRef.current?.present(), []);
  const link = `https://dys.us.to/${task.shortId || task.id}`;

  const handleCopy = useCallback(async () => {
    setStringAsync(link);
    Toast.show({
      type: "success",
      text1: "Copied link to clipboard!",
    });
  }, [link]);

  const handleShare = useCallback(async () => {
    try {
      updateTask("published", !task.published);
      if (!task.published) handleCopy();
      else Toast.show({ type: "success", text1: "Task sharing disabled" });

      setTimeout(() => {
        setTimeout(handleClose, 200);
      }, 0);
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later.",
      });
    }
  }, [task, updateTask, handleClose, handleCopy]);

  return isReadOnly ? null : (
    <>
      <IconButton
        style={{ borderWidth: 1, borderColor: theme[6] }}
        size={50}
        icon="ios_share"
        onPress={handleOpen}
      />
      <BottomSheet
        onClose={handleClose}
        snapPoints={[180]}
        sheetRef={menuRef}
        maxWidth={400}
      >
        <View style={{ padding: 10 }}>
          <ListItemButton onPress={handleShare}>
            <Avatar size={40} icon="ios_share" disabled />
            <ListItemText
              primary={`Sharing ${task.published ? "enabled" : "disabled"}`}
              secondary={
                task.published
                  ? "Anyone with the link can view this task"
                  : "Only you can view this task"
              }
            />
            <Icon
              size={35}
              style={{ marginRight: 10, opacity: task.published ? 1 : 0.7 }}
            >
              {task.published ? "toggle_on" : "toggle_off"}
            </Icon>
          </ListItemButton>
          <ListItemButton onPress={() => handleCopy()}>
            <Avatar size={40} icon="link" disabled />
            <ListItemText primary="Copy link" />
          </ListItemButton>
        </View>
      </BottomSheet>
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
      <BottomSheetScrollView
        style={{ maxHeight: breakpoints.md ? undefined : 500 }}
      >
        <View style={{ paddingBottom: 100, paddingHorizontal: 20 }}>
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
