import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import React from "react";
import { View } from "react-native";
import { TaskStream } from "./audit-log";
import { useTaskDrawerContext } from "./context";

export function TaskDetails() {
  const theme = useColorTheme();
  const { task } = useTaskDrawerContext();

  return (
    <View style={{ gap: 10 }}>
      <ListItemButton style={{ backgroundColor: theme[3] }}>
        <Icon>calendar_today</Icon>
        <ListItemText
          primary={dayjs(task.due).format("MMM Do, YYYY")}
          secondary="Does not repeat"
        />
      </ListItemButton>
      {!task.dateOnly && (
        <ListItemButton style={{ backgroundColor: theme[3] }}>
          <Icon>access_time</Icon>
          <ListItemText primary={dayjs(task.due).format("h:mm A")} />
        </ListItemButton>
      )}
      {task.due && (
        <ListItemButton style={{ backgroundColor: theme[3] }}>
          <Icon>notifications</Icon>
          <ListItemText
            primary={`${task.notifications.length} notification${
              task.notifications.length == 1 ? "" : "s"
            }`}
          />
        </ListItemButton>
      )}
      <TaskStream>
        <ListItemButton style={{ backgroundColor: theme[3] }}>
          <Icon>timeline</Icon>
          <ListItemText
            primary="History"
            secondary={`Last edit ${dayjs(
              task.history[0]?.timestamp
            ).fromNow()}`}
          />
        </ListItemButton>
      </TaskStream>
    </View>
  );
}
