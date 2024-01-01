import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { TaskStream } from "./audit-log";
import { useTaskDrawerContext } from "./context";
import DateTimePicker from "react-native-ui-datepicker";
import { Menu } from "@/ui/Menu";
import { Button, ButtonText } from "@/ui/Button";
import IconButton from "@/ui/IconButton";
import { Portal } from "@gorhom/portal";
import Collapsible from "react-native-collapsible";
import Text from "@/ui/Text";
import { TouchableOpacity } from "@gorhom/bottom-sheet";

function DatePickerModal({ date, onDateSelect, children, menuRef }) {
  const theme = useColorTheme();
  const calendarTextStyles = { color: theme[11], fontFamily: "body_400" };

  return (
    <Menu menuRef={menuRef} height={[440 + 23.5]} trigger={children}>
      <DateTimePicker
        value={date}
        selectedItemColor={theme[9]}
        todayContainerStyle={{ borderColor: theme[4] }}
        calendarTextStyle={calendarTextStyles}
        headerTextStyle={calendarTextStyles}
        todayTextStyle={calendarTextStyles}
        selectedTextStyle={calendarTextStyles}
        weekDaysTextStyle={calendarTextStyles}
        timePickerTextStyle={calendarTextStyles}
        buttonNextIcon={<Icon>arrow_forward_ios</Icon>}
        buttonPrevIcon={<Icon>arrow_back_ios_new</Icon>}
        weekDaysContainerStyle={{ borderColor: theme[4] }}
        onValueChange={(date) => onDateSelect(dayjs(date))}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 10,
          marginTop: 10,
          paddingVertical: 5,
          borderTopWidth: 2,
          borderTopColor: theme[4],
        }}
      >
        <Button onPress={() => menuRef.current?.forceClose()}>
          <Icon>close</Icon>
          <ButtonText>Cancel</ButtonText>
        </Button>
        <Button onPress={() => menuRef.current?.forceClose()} variant="filled">
          <ButtonText>Done</ButtonText>
          <Icon>check</Icon>
        </Button>
      </View>
    </Menu>
  );
}

function TaskDateCard() {
  const { task } = useTaskDrawerContext();
  const theme = useColorTheme();
  const dateMenuRef = useRef();

  const [open, setOpen] = useState(false);

  return (
    <View style={{ backgroundColor: theme[open ? 4 : 3], borderRadius: 20 }}>
      <ListItemButton
        style={{ backgroundColor: "transparent", zIndex: 999 }}
        onPress={() => setOpen((s) => !s)}
      >
        <Icon>calendar_today</Icon>
        <ListItemText
          primary={dayjs(task.due).format("MMM Do, YYYY")}
          secondary="Does not repeat"
        />
      </ListItemButton>
      <Collapsible collapsed={!open}>
        <View
          style={{
            flexDirection: "row",
            paddingVertical: 10,
          }}
        >
          <Pressable style={{ gap: 5, flex: 1, alignItems: "center" }}>
            <DatePickerModal
              date={task.due}
              onDateSelect={(e) => console.log(e)}
              menuRef={dateMenuRef}
            >
              <IconButton
                style={{ borderWidth: 1, borderColor: theme[6] }}
                size={50}
              >
                <Icon>edit</Icon>
              </IconButton>
            </DatePickerModal>
            <Text>Edit</Text>
          </Pressable>
          <Pressable style={{ gap: 5, flex: 1, alignItems: "center" }}>
            <IconButton
              style={{ borderWidth: 1, borderColor: theme[6] }}
              size={50}
            >
              <Icon>autorenew</Icon>
            </IconButton>
            <Text>Repeat</Text>
          </Pressable>
          <Pressable style={{ gap: 5, flex: 1, alignItems: "center" }}>
            <IconButton
              style={{ borderWidth: 1, borderColor: theme[6] }}
              size={50}
            >
              <Icon>close</Icon>
            </IconButton>
            <Text>Remove</Text>
          </Pressable>
        </View>
      </Collapsible>
    </View>
  );
}

export function TaskDetails() {
  const theme = useColorTheme();
  const { task } = useTaskDrawerContext();

  return (
    <View style={{ gap: 10 }}>
      <TaskDateCard />
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
