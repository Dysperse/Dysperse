import { blue } from "@/themes";
import { Button, ButtonText } from "@/ui/Button";
import Calendar from "@/ui/Calendar";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import { Menu } from "@/ui/Menu";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { Image } from "expo-image";
import React, { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Linking,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Accordion from "react-native-collapsible/Accordion";
import { FlatList } from "react-native-gesture-handler";
import Markdown from "react-native-markdown-display";
import { RRule } from "rrule";
import { TaskDatePicker } from "../create";
import { TaskAttachmentButton } from "./attachment/button";
import { useTaskDrawerContext } from "./context";

const drawerStyles = StyleSheet.create({
  collapsibleMenuItem: { gap: 5, flex: 1, alignItems: "center" },
});

function TaskRescheduleButton() {
  const { task, updateTask } = useTaskDrawerContext();
  const handleSelect = (t, n) => {
    updateTask("due", dayjs(task.due).add(n, t).toISOString());
  };
  const isSameDay = dayjs().isSame(dayjs(task.due), "day");

  return (
    <MenuPopover
      trigger={
        <IconButton size={55}>
          <Icon>dark_mode</Icon>
        </IconButton>
      }
      menuProps={{
        rendererProps: {
          placement: "top",
        },
      }}
      options={[
        {
          renderer: () => (
            <Text
              variant="eyebrow"
              style={{
                textAlign: "center",
                margin: 10,
              }}
            >
              Snooze
            </Text>
          ),
        },
        {
          text: isSameDay ? "Tomorrow" : "1 day",
          callback: () => handleSelect("day", 1),
        },
        {
          text: isSameDay ? "In 2 days" : "2 days",
          callback: () => handleSelect("day", 2),
        },
        {
          text: isSameDay ? "In 3 days" : "3 days",
          callback: () => handleSelect("day", 3),
        },
        {
          text: isSameDay ? "In 4 days" : "4 days",
          callback: () => handleSelect("day", 5),
        },
        {
          text: dayjs().isSame(dayjs(task.due), "week")
            ? "Next week"
            : "1 week",
          callback: () => handleSelect("week", 1),
        },
        {
          text: dayjs().isSame(dayjs(task.due), "month")
            ? "Next month"
            : "1 month",
          callback: () => handleSelect("month", 1),
        },
      ]}
    />
  );
}

function DatePickerModal({
  date,
  onDateSelect,
  children,
  menuRef,
  enabled = true,
  closeOnSelect = false,
}) {
  return !enabled ? (
    children
  ) : (
    <Menu menuRef={menuRef} height={[400]} trigger={children}>
      <View style={{ marginVertical: "auto" }}>
        <View style={{ paddingHorizontal: 20, marginTop: -15 }}>
          <Calendar
            date={date}
            onDayPress={(date) => {
              onDateSelect(dayjs(date.dateString, "YYYY-MM-DD"));
              if (closeOnSelect) setTimeout(() => menuRef.current.close(), 100);
            }}
            markedDates={{
              [dayjs(date).format("YYYY-MM-DD")]: {
                selected: true,
                disableTouchEvent: true,
              },
            }}
          />
        </View>
      </View>
    </Menu>
  );
}

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function EditAttachment({ item, handleCancel }) {
  const { control, handleSubmit } = useForm({
    defaultValues: { attachment: item.data },
  });
  const onSubmit = (data) => console.log(data);

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          gap: 20,
          paddingHorizontal: 20,
          alignItems: "center",
        }}
      >
        <IconButton
          onPress={handleCancel}
          icon="close"
          variant="outlined"
          size={55}
        />
        <Text style={{ marginHorizontal: "auto", fontSize: 20 }}>Edit</Text>
        <IconButton
          onPress={handleSubmit(onSubmit)}
          icon="check"
          variant="outlined"
          size={55}
        />
      </View>
      <View style={{ paddingHorizontal: 20, flex: 1, paddingTop: 20 }}>
        <Controller
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              multiline
              bottomSheet
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              variant="filled+outlined"
              placeholder="Edit attachment..."
              style={{
                flex: 1,
                fontSize: 20,
                paddingHorizontal: 20,
                paddingVertical: 20,
              }}
            />
          )}
          name="attachment"
          control={control}
          defaultValue={item.data}
        />
      </View>
    </>
  );
}

function TaskAttachmentCard({ item, index }) {
  const theme = useColorTheme();
  const menuRef = useRef<BottomSheetModal>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { height } = useWindowDimensions();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();

  let icon = "";
  let name = item.data;
  switch (item.type) {
    case "LINK":
      icon = "link";
      if (isValidHttpUrl(name)) name = new URL(item.data).hostname;
      break;
    case "LOCATION":
      icon = isValidHttpUrl(item.data) ? "link" : "map";
      if (isValidHttpUrl(name)) name = new URL(item.data).hostname;
      break;
    case "IMAGE":
      icon = "image";
      break;
  }

  const handleOpenPress = useCallback(() => {
    if (isValidHttpUrl(item.data)) {
      Linking.openURL(item.data);
    } else {
      Linking.openURL(`https://maps.google.com/?q=${item.data}`);
    }
  }, [item.data]);

  const handleDeletePress = useCallback(() => {
    updateTask(
      "attachments",
      task.attachments.filter((_, i) => i !== index)
    );
    setTimeout(() => {
      setTimeout(() => menuRef.current?.close(), 100);
    }, 0);
  }, [updateTask, task, index]);

  const handleEditPress = useCallback(() => setIsEditing(true), []);
  const handleCancelEditing = useCallback(() => setIsEditing(false), []);

  return (
    <Menu
      menuRef={menuRef}
      trigger={
        <Pressable
          style={({ pressed }) => ({
            width: 190,
            backgroundColor: theme[pressed ? 4 : 3],
            padding: 20,
            borderRadius: 20,
            height: 100,
            justifyContent: "flex-end",
            position: "relative",
          })}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              margin: 20,
              marginTop: 15,
              flexDirection: "row",
              alignItems: "center",
              zIndex: 999,
              gap: 5,
              borderRadius: 5,
            }}
          >
            <Icon size={30}>{icon}</Icon>
          </View>
          {item.type !== "IMAGE" && (
            <Text numberOfLines={1} style={{ fontSize: 17 }}>
              {name}
            </Text>
          )}
          {item.type === "IMAGE" && (
            <Image
              source={{ uri: item.data }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                borderRadius: 20,
              }}
              transition={100}
            />
          )}
        </Pressable>
      }
      height={[
        item.type === "IMAGE"
          ? height - 50
          : isReadOnly
          ? 155
          : isEditing
          ? 350
          : 250,
      ]}
    >
      {item.type === "IMAGE" && (
        <View style={{ flex: 1, padding: 25 }}>
          <Image
            source={{ uri: item.data }}
            style={{
              flex: 1,
              borderRadius: 20,
              marginTop: -20,
            }}
            transition={100}
          />
        </View>
      )}
      {isEditing ? (
        <EditAttachment handleCancel={handleCancelEditing} item={item} />
      ) : (
        <View style={{ paddingHorizontal: 20, gap: 20 }}>
          <Button
            variant="filled"
            style={{ height: 90, paddingHorizontal: 30 }}
            onPress={handleOpenPress}
          >
            <View style={{ flex: 1, overflow: "hidden" }}>
              <ButtonText weight={900}>
                Open{" "}
                {item.type === "IMAGE"
                  ? "image"
                  : isValidHttpUrl(item.data)
                  ? "link"
                  : "in Maps"}
              </ButtonText>
              <ButtonText
                style={{ opacity: 0.5, paddingRight: 25 }}
                numberOfLines={1}
              >
                {!isValidHttpUrl(item.data) ? `"${name}"` : name}
              </ButtonText>
            </View>
            <Icon style={{ marginLeft: "auto" }}>north_east</Icon>
          </Button>
          <View style={{ flexDirection: "row", gap: 20 }}>
            {!isReadOnly && (
              <Button
                variant="outlined"
                style={{ height: 70, flex: 1 }}
                onPress={handleDeletePress}
              >
                <Icon>remove_circle</Icon>
                <ButtonText style={{ fontSize: 17 }}>Delete</ButtonText>
              </Button>
            )}
            {item.type !== "IMAGE" && !isReadOnly && (
              <Button
                variant="outlined"
                style={{ height: 70, flex: 1 }}
                onPress={handleEditPress}
              >
                <Icon>edit_square</Icon>
                <ButtonText style={{ fontSize: 17 }}>Edit</ButtonText>
              </Button>
            )}
          </View>
        </View>
      )}
    </Menu>
  );
}

function TaskNote() {
  const theme = useColorTheme();
  const { task, updateTask } = useTaskDrawerContext();

  return (
    <TaskAttachmentButton
      defaultView="Note"
      lockView
      task={task}
      updateTask={updateTask}
    >
      <ListItemButton
        variant="filled"
        disabled
        style={{ paddingVertical: 15, paddingHorizontal: 20 }}
      >
        <View style={{ flex: 1 }}>
          <Markdown
            style={{
              body: {
                fontFamily: "body_400",
                fontSize: 15,
                color: theme[12],
              },
              link: { color: blue.blue9 },
              image: {
                borderRadius: 20,
                overflow: "hidden",
                objectFit: "cover",
              },
              blockquote: {
                borderLeftColor: theme[9],
                borderLeftWidth: 3,
                paddingHorizontal: 20,
                backgroundColor: "transparent",
                marginVertical: 10,
              },
              bullet_list_icon: {
                width: 5,
                height: 5,
                borderRadius: 99,
                backgroundColor: theme[9],
                color: "transparent",
                marginTop: 8,
              },
              ordered_list_icon: {
                color: theme[11],
              },
            }}
          >
            {task.note?.replaceAll("] (http", "](http")?.trim()}
          </Markdown>
        </View>
      </ListItemButton>
    </TaskAttachmentButton>
  );
}

export function TaskDetails() {
  const theme = useColorTheme();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();

  const [activeSections, setActiveSections] = useState([]);

  const collapsibleMenuStyles = {
    backgroundColor: theme[3],
    padding: 10,
    flexDirection: "row",
    paddingVertical: 10,
  };

  const noteMenuRef = useRef<BottomSheetModal>(null);

  return (
    <>
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={task.attachments}
        horizontal
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ gap: 20, paddingHorizontal: 20 }}
        style={{ marginBottom: 20, marginHorizontal: -20 }}
        renderItem={(i) => <TaskAttachmentCard {...i} />}
      />
      <Accordion
        activeSections={activeSections}
        sectionContainerStyle={{
          backgroundColor: theme[3],
          borderRadius: 20,
          overflow: "hidden",
          marginBottom: 15,
        }}
        underlayColor="transparent"
        sections={[
          task.note && {
            trigger: () => <TaskNote />,
            content: (
              <View style={collapsibleMenuStyles as any}>
                <TaskAttachmentButton
                  defaultView="Note"
                  menuRef={noteMenuRef}
                  lockView
                  task={task}
                  updateTask={updateTask}
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
                </TaskAttachmentButton>
                <Pressable
                  style={drawerStyles.collapsibleMenuItem}
                  onPress={() => {
                    updateTask("note", null);
                  }}
                >
                  <IconButton
                    style={{ borderWidth: 1, borderColor: theme[6] }}
                    size={50}
                    disabled
                  >
                    <Icon>close</Icon>
                  </IconButton>
                  <Text>Remove</Text>
                </Pressable>
              </View>
            ),
          },
          {
            trigger: () => (
              <ListItemButton
                variant="filled"
                style={{ paddingVertical: 15, paddingHorizontal: 20 }}
                disabled={task.due || task.recurrenceRule}
              >
                <Icon>
                  {task.due
                    ? "calendar_today"
                    : task.recurrenceRule
                    ? "loop"
                    : "calendar_add_on"}
                </Icon>
                <ListItemText
                  primary={
                    !task.due && !task.recurrenceRule
                      ? "Add date"
                      : task.recurrenceRule
                      ? capitalizeFirstLetter(
                          new RRule(task.recurrenceRule).toText()
                        )
                      : dayjs(task.due).format("MMM Do, YYYY")
                  }
                  secondary={
                    task.due &&
                    (task.recurrenceRule
                      ? capitalizeFirstLetter(
                          new RRule(task.recurrenceRule).toText()
                        )
                      : "Does not repeat")
                  }
                />
                {!isReadOnly && !task.recurrenceRule && (
                  <TaskRescheduleButton />
                )}
              </ListItemButton>
            ),
            content: isReadOnly ? null : (
              <View style={collapsibleMenuStyles as any}>
                <TaskDatePicker
                  key="test"
                  defaultView={task.recurrenceRule ? "recurrence" : "date"}
                  setValue={(name, value) =>
                    updateTask(name === "date" ? "due" : name, value)
                  }
                  watch={(inputName) => {
                    return {
                      date: dayjs(task.due),
                      dateOnly: task.dateOnly,
                      recurrenceRule: {
                        ...task.recurrenceRule,
                        dtstart: new Date(task.due),
                      },
                    }[inputName];
                  }}
                >
                  <Pressable style={drawerStyles.collapsibleMenuItem}>
                    <IconButton
                      disabled
                      style={{
                        opacity: 1,
                        borderWidth: 1,
                        borderColor: theme[6],
                      }}
                      size={50}
                    >
                      <Icon>edit</Icon>
                    </IconButton>
                    <Text>Edit</Text>
                  </Pressable>
                </TaskDatePicker>
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
            ),
          },
          !task.dateOnly && {
            trigger: (isActive) => (
              <ListItemButton
                variant="filled"
                style={{ paddingVertical: 15, paddingHorizontal: 20 }}
              >
                <Icon>access_time</Icon>
                <ListItemText primary={dayjs(task.due).format("h:mm A")} />
              </ListItemButton>
            ),
            content: <></>,
          },
          task.due && {
            trigger: () => (
              <ListItemButton
                variant="filled"
                style={{ paddingVertical: 15, paddingHorizontal: 20 }}
              >
                <Icon>notifications</Icon>
                <ListItemText
                  primary={`${task.notifications.length} notification${
                    task.notifications.length == 1 ? "" : "s"
                  }`}
                />
                {!isReadOnly && (
                  <Chip
                    label="Coming soon"
                    style={{ backgroundColor: theme[5] }}
                  />
                )}
              </ListItemButton>
            ),
            content: <></>,
          },
          task.collection && {
            trigger: () => (
              <ListItemButton
                variant="filled"
                style={{ paddingVertical: 15, paddingHorizontal: 20 }}
              >
                <Icon>interests</Icon>
                <ListItemText primary={`Found in ${task.collection.name}`} />
              </ListItemButton>
            ),
            content: <></>,
          },
        ].filter((e) => e)}
        renderHeader={(section, _, isActive) => section.trigger(isActive)}
        renderContent={(section) => section.content}
        onChange={setActiveSections}
      />
    </>
  );
}
