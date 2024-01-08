import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import { Menu } from "@/ui/Menu";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import DateTimePicker from "react-native-ui-datepicker";
import { TaskStream } from "./audit-log";
import { useTaskDrawerContext } from "./context";

const drawerStyles = StyleSheet.create({
  collapsibleMenuItem: { gap: 5, flex: 1, alignItems: "center" },
});

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

function TaskAttachmentCategory({ category, attachments }) {
  const theme = useColorTheme();
  const { task } = useTaskDrawerContext();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const icon = category === "LOCATION" ? "location_on" : "image";

  return (
    <View style={{ backgroundColor: theme[open ? 4 : 3], borderRadius: 20 }}>
      <ListItemButton
        style={{
          backgroundColor: "transparent",
          alignItems: attachments.length == 1 ? "center" : "flex-start",
        }}
      >
        <Icon>{icon}</Icon>
        <ListItemText
          primary={
            attachments.length == 1
              ? undefined
              : attachments.length + " " + category.toLowerCase() + "s"
          }
          secondaryProps={{
            style: {},
          }}
          secondary={
            <View
              style={{
                width: "100%",
                marginBottom: -10,
                ...(attachments.length == 1 && { marginTop: -10 }),
              }}
            >
              {attachments.map((attachment, index) => (
                <View
                  key={attachment.id}
                  style={{
                    paddingVertical: 5,
                    gap: 10,
                    borderBottomWidth:
                      attachments.length == 1 ||
                      index === attachments.length - 1
                        ? 0
                        : 1,
                    flexDirection: "row",
                    alignItems: "center",
                    borderBottomColor: theme[7],
                  }}
                >
                  <TextField
                    bottomSheet
                    style={{
                      borderWidth: 1,
                      borderRadius: 5,
                      flex: 1,
                      borderColor: theme[open ? 7 : 3],
                      paddingVertical: 7,
                      color: theme[12],
                      paddingHorizontal: open ? 10 : 0,
                      fontFamily: `body_600`,
                    }}
                    editable={open}
                    onFocus={handleOpen}
                    onBlur={handleClose}
                    value={attachment.data}
                    onChangeText={(text) => {
                      // updateTask("name", text);
                      // setTask((t) => ({ ...t, name: text }));
                    }}
                  />
                  {open ? (
                    <Button dense style={{ marginLeft: -5 }}>
                      <Icon>remove_circle</Icon>
                    </Button>
                  ) : (
                    <Button style={{ backgroundColor: theme[6] }} dense>
                      <ButtonText>Maps</ButtonText>
                      <Icon>north_east</Icon>
                    </Button>
                  )}
                </View>
              ))}
            </View>
          }
        />
      </ListItemButton>
    </View>
  );
}

function TaskDateCard() {
  const { task, updateTask } = useTaskDrawerContext();
  const theme = useColorTheme();
  const dateMenuRef = useRef();

  const [open, setOpen] = useState(false);
  const handleEditDate = (date) => {
    updateTask("due", date.toISOString());
  };

  return (
    <Menu
      trigger={
        <ListItemButton variant="filled">
          <Icon>calendar_today</Icon>
          <ListItemText
            primary={dayjs(task.due).format("MMM Do, YYYY")}
            secondary="Does not repeat"
          />
        </ListItemButton>
      }
      height={[155]}
    >
      <View
        style={{
          flexDirection: "row",
          paddingVertical: 10,
        }}
      >
        <DatePickerModal
          date={task.due}
          onDateSelect={handleEditDate}
          menuRef={dateMenuRef}
        >
          <Pressable style={drawerStyles.collapsibleMenuItem}>
            <IconButton
              disabled
              style={{ borderWidth: 1, borderColor: theme[6] }}
              size={50}
            >
              <Icon>edit</Icon>
            </IconButton>
            <Text>Edit</Text>
          </Pressable>
        </DatePickerModal>
        <Pressable
          style={drawerStyles.collapsibleMenuItem}
          onPress={() =>
            Toast.show({
              type: "success",
              text1: "Coming soon!",
            })
          }
        >
          <IconButton
            disabled
            style={{ borderWidth: 1, borderColor: theme[6] }}
            size={50}
          >
            <Icon>autorenew</Icon>
          </IconButton>
          <Text>Repeat</Text>
        </Pressable>
        <Pressable style={drawerStyles.collapsibleMenuItem}>
          <IconButton
            style={{ borderWidth: 1, borderColor: theme[6] }}
            size={50}
          >
            <Icon>close</Icon>
          </IconButton>
          <Text>Remove</Text>
        </Pressable>
      </View>
    </Menu>
  );
}

export function TaskDetails() {
  const theme = useColorTheme();
  const { task } = useTaskDrawerContext();

  const attachmentCategories = task.attachments.reduce((acc, attachment) => {
    if (!acc[attachment.type]) acc[attachment.type] = [];
    acc[attachment.type].push(attachment);
    return acc;
  }, {});

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
      {Object.keys(attachmentCategories).length > 0 &&
        Object.keys(attachmentCategories).map((category) => (
          <TaskAttachmentCategory
            attachments={attachmentCategories[category]}
            category={category}
            key={category}
          />
        ))}
      <TaskStream>
        <ListItemButton variant="filled">
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
