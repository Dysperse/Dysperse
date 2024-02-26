import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import Text from "@/ui/Text";
import { addHslAlpha, useColor } from "@/ui/color";
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
  showRelativeTime,
}: {
  task: any;
  onTaskUpdate: (newData) => void;
  openColumnMenu: () => void;
  showLabel?: boolean;
  showRelativeTime?: boolean;
}) {
  const theme = useColorTheme();
  const orange = useColor("orange", useColorScheme() === "dark");

  const breakpoints = useResponsiveBreakpoints();
  const isCompleted = task.completionInstances.length > 0;

  return (
    <TaskDrawer id={task.id} mutateList={onTaskUpdate}>
      <ListItemButton
        onLongPress={openColumnMenu}
        style={({ pressed, hovered }) => ({
          flexShrink: 0,
          paddingTop: breakpoints.md ? 13 : 18,
          paddingLeft: breakpoints.md ? 13 : 18,
          paddingRight: breakpoints.md ? 13 : 18,
          paddingBottom: breakpoints.md ? 8 : 18,
          borderRadius: 25,
          ...(!breakpoints.md && {
            borderWidth: 1,
            borderColor: theme[4],
            marginTop: breakpoints.md ? 0 : 5,
            marginBottom: 8,
          }),
          backgroundColor: pressed
            ? addHslAlpha(theme[4], 0.7)
            : hovered
            ? addHslAlpha(theme[3], 0.7)
            : undefined,
          alignItems: "flex-start",
        })}
      >
        <TaskCheckbox task={task} mutateList={onTaskUpdate} />
        <View style={{ gap: 5, flex: 1 }}>
          <Text
            weight={300}
            // numberOfLines={noChips ?  : 1}
            style={{
              opacity: 0.8,
              ...(isCompleted && {
                opacity: 0.6,
                textDecorationLine: "line-through",
              }),
            }}
          >
            {task.name}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
            {showRelativeTime && (
              <Chip
                disabled
                dense
                label={dayjs(task.due).fromNow()}
                icon={<Icon>access_time</Icon>}
              />
            )}
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
                icon={<Emoji size={17} emoji={task.label.emoji} />}
                style={{
                  paddingHorizontal: 10,
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
