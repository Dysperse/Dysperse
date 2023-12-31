import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import React from "react";
import { View, useColorScheme } from "react-native";
import { TaskCheckbox } from "./Checkbox";
import { TaskDrawer } from "./drawer";

export function Task({
  task,
  onTaskUpdate,
}: {
  task: any;
  onTaskUpdate: (newData) => void;
}) {
  const theme = useColorTheme();
  const orange = useColor("orange", useColorScheme() === "dark");

  return (
    <TaskDrawer id={task.id} mutateList={onTaskUpdate}>
      <ListItemButton
        onLongPress={() => {
          console.log("long press");
        }}
        style={({ pressed }) => ({
          flexShrink: 0,
          paddingHorizontal: 15,
          paddingVertical: 15,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: theme[pressed ? 5 : 4],
          alignItems: "flex-start",
        })}
      >
        <TaskCheckbox completed={task?.completionInstances?.length > 0} />
        <View style={{ gap: 5, paddingTop: 1, flex: 1 }}>
          <Text numberOfLines={1}>{task.name}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
            {task.pinned && (
              <Chip
                dense
                disabled
                label="Important"
                icon={
                  <Icon size={22} style={{ color: orange[11] }}>
                    priority_high
                  </Icon>
                }
                style={{ backgroundColor: orange[3] }}
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
}
