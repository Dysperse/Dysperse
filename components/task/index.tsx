import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import React, { memo } from "react";
import { View, useColorScheme } from "react-native";
import TaskCheckbox from "./Checkbox";
import { TaskDrawer } from "./drawer";

const Task = memo(function Task({
  task,
  onTaskUpdate,
  openColumnMenu,
  showLabel,
}: {
  task: any;
  onTaskUpdate: (newData) => void;
  openColumnMenu: () => void;
  showLabel?: boolean;
}) {
  const theme = useColorTheme();
  const orange = useColor("orange", useColorScheme() === "dark");

  const noChips = !task.pinned && task.dateOnly;
  const isCompleted = task.completionInstances.length > 0;

  return (
    <TaskDrawer id={task.id} mutateList={onTaskUpdate}>
      <ListItemButton
        onLongPress={openColumnMenu}
        style={({ pressed, hovered }) => ({
          flexShrink: 0,
          paddingHorizontal: 15,
          paddingVertical: 15,
          paddingBottom: 10,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme[pressed ? 6 : 5],
          backgroundColor: theme[pressed ? 1 : hovered ? 3 : 2],
          alignItems: "flex-start",
        })}
      >
        <TaskCheckbox task={task} mutateList={onTaskUpdate} />
        <View style={{ gap: 5, flex: 1 }}>
          <Text
            weight={300}
            numberOfLines={noChips ? undefined : 1}
            style={{
              fontSize: 16,
              ...(isCompleted && {
                opacity: 0.6,
                textDecorationLine: "line-through",
              }),
            }}
          >
            {task.name}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
            {showLabel && task.label && (
              <Chip
                disabled
                dense
                label={
                  task.label.name.length > 10
                    ? `${task.label.name.slice(0, 10)}...`
                    : `${task.label.name}`
                }
                colorTheme={task.label.color}
                icon={<Emoji size={22} emoji={task.label.emoji} />}
                style={{
                  paddingHorizontal: 5,
                }}
              />
            )}
            {task.pinned && (
              <Chip
                dense
                disabled
                label="Urgent"
                icon={
                  <Icon size={22} style={{ color: orange[11] }}>
                    priority_high
                  </Icon>
                }
                style={{ backgroundColor: orange[6] }}
                color={orange[11]}
              />
            )}
            {!task.dateOnly && (
              <Chip
                dense
                label={dayjs(task.due).format("h:mm A")}
                icon={<Icon size={22}>calendar_today</Icon>}
              />
            )}
          </View>
        </View>
      </ListItemButton>
    </TaskDrawer>
  );
});

export default Task;
