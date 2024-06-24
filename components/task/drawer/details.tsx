import MarkdownRenderer from "@/components/MarkdownRenderer";
import { STORY_POINT_SCALE } from "@/constants/workload";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Calendar from "@/ui/Calendar";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import { Menu } from "@/ui/Menu";
import MenuPopover from "@/ui/MenuPopover";
import Text, { getFontName } from "@/ui/Text";
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
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { RRule } from "rrule";
import TaskDatePicker from "../create/TaskDatePicker";
import { TaskAttachmentButton } from "./attachment/button";
import { useTaskDrawerContext } from "./context";

const drawerStyles = StyleSheet.create({
  collapsibleMenuItem: { gap: 5, flex: 1, alignItems: "center" },
});

function TaskRescheduleButton() {
  const { task, updateTask } = useTaskDrawerContext();
  const handleSelect = (t, n) => {
    updateTask("start", dayjs(task.start).add(n, t).toISOString());
  };
  const isSameDay = dayjs().isSame(dayjs(task.start), "day");

  return (
    <MenuPopover
      trigger={<IconButton size={50} variant="outlined" icon="dark_mode" />}
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
          text: dayjs().isSame(dayjs(task.start), "week")
            ? "Next week"
            : "1 week",
          callback: () => handleSelect("week", 1),
        },
        {
          text: dayjs().isSame(dayjs(task.start), "month")
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

export function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function EditAttachment({ task, updateTask, item, handleCancel }) {
  const { control, handleSubmit } = useForm({
    defaultValues: { data: item.data, name: item.name },
  });

  const onSubmit = (data) => {
    updateTask(
      "attachments",
      task.attachments.map((attachment, i) =>
        i === task.attachments.indexOf(item)
          ? { ...attachment, ...data }
          : attachment
      )
    );
    setTimeout(handleCancel, 0);
  };

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
        <Text variant="eyebrow">{item.type}</Text>
        <Controller
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              bottomSheet
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              variant="filled+outlined"
              placeholder="Edit attachment..."
              style={{
                fontSize: 20,
                marginTop: 5,
                paddingHorizontal: 20,
                paddingVertical: 20,
              }}
            />
          )}
          name="data"
          control={control}
          defaultValue={item.data}
        />
        {item.type === "LINK" && (
          <>
            <Text variant="eyebrow" style={{ marginTop: 10 }}>
              Name
            </Text>
            <Controller
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  bottomSheet
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  variant="filled+outlined"
                  placeholder="Display name (optional)"
                  style={{
                    backgroundColor: "transparent",
                    fontSize: 20,
                    marginTop: 5,
                    paddingHorizontal: 20,
                    paddingVertical: 20,
                  }}
                />
              )}
              name="name"
              control={control}
              defaultValue={item.name}
            />
          </>
        )}
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
              {item.name || name}
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
          ? item.type === "LINK"
            ? 370
            : 350
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
        <EditAttachment
          task={task}
          updateTask={updateTask}
          handleCancel={handleCancelEditing}
          item={item}
        />
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
          <MarkdownRenderer>
            {task.note?.replaceAll("] (http", "](http")?.trim()}
          </MarkdownRenderer>
        </View>
      </ListItemButton>
    </TaskAttachmentButton>
  );
}

export const normalizeRecurrenceRuleObject = (rule) => {
  if (!rule) return null;
  return new RRule({
    ...rule,
    ...(rule.until && { until: dayjs(rule.until).toDate() }),
    ...(rule.dtstart && { dtstart: dayjs(rule.dtstart).toDate() }),
  });
};

function TaskNotifications() {
  const theme = useColorTheme();
  const { task, updateTask } = useTaskDrawerContext();

  const notificationScale = [5, 10, 15, 30, 60, 120, 240, 480, 1440];
  const notificationScaleText = [
    "5m",
    "10m",
    "15m",
    "30m",
    "1h",
    "2h",
    "4h",
    "8h",
    "1d",
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: 10,
        paddingHorizontal: 10,
        paddingBottom: 10,
      }}
    >
      {notificationScale.map((n, i) => (
        <Pressable
          key={n}
          style={({ pressed, hovered }) => ({
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: task.notifications.includes(n)
              ? theme[pressed ? 12 : hovered ? 11 : 10]
              : theme[pressed ? 5 : hovered ? 4 : 3],
            borderRadius: 10,
          })}
          onPress={() =>
            updateTask(
              "notifications",
              task.notifications.includes(n)
                ? task.notifications.filter((i) => i !== n)
                : [...task.notifications, n]
            )
          }
        >
          <Text
            style={{
              fontFamily: getFontName("jetBrainsMono", 500),
              color: task.notifications.includes(n) ? theme[3] : theme[11],
            }}
          >
            {notificationScaleText[i]}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function TaskDetails() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();

  const [activeSections, setActiveSections] = useState([]);

  const collapsibleMenuStyles = {
    backgroundColor: theme[3],
    padding: 10,
    flexDirection: "row",
    paddingVertical: 10,
  };

  const noteMenuRef = useRef<BottomSheetModal>(null);

  const complexityScale = [2, 4, 8, 16, 32];
  const recurrenceRule =
    task.recurrenceRule && normalizeRecurrenceRuleObject(task.recurrenceRule);

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
              <TaskDatePicker
                defaultView={task.recurrenceRule ? "recurrence" : "date"}
                setValue={(name, value) =>
                  updateTask(name === "date" ? "start" : name, value)
                }
                watch={(inputName) => {
                  return {
                    date: null,
                    dateOnly: task.dateOnly,
                    recurrenceRule: recurrenceRule?.options,
                  }[inputName];
                }}
              >
                <ListItemButton
                  variant="filled"
                  style={{ paddingVertical: 15, paddingHorizontal: 20 }}
                  disabled={Boolean(task.start || task.recurrenceRule)}
                >
                  <Icon>
                    {task.start
                      ? "calendar_today"
                      : task.recurrenceRule
                      ? "loop"
                      : "calendar_add_on"}
                  </Icon>
                  <ListItemText
                    primary={
                      !task.start && !task.recurrenceRule
                        ? "Add date"
                        : task.recurrenceRule
                        ? capitalizeFirstLetter(recurrenceRule.toText())
                        : dayjs(task.start).format("MMM Do, YYYY")
                    }
                    secondary={
                      task.start &&
                      (task.recurrenceRule
                        ? capitalizeFirstLetter(recurrenceRule.toText())
                        : "Does not repeat")
                    }
                  />
                  {!isReadOnly && !task.recurrenceRule && task.start && (
                    <TaskRescheduleButton />
                  )}
                </ListItemButton>
              </TaskDatePicker>
            ),
            content: isReadOnly ? null : (
              <View style={collapsibleMenuStyles as any}>
                <TaskDatePicker
                  defaultView={task.recurrenceRule ? "recurrence" : "date"}
                  setValue={(name, value) =>
                    updateTask(name === "date" ? "start" : name, value)
                  }
                  watch={(inputName) => {
                    return {
                      date: dayjs(task.start),
                      dateOnly: task.dateOnly,
                      recurrenceRule: recurrenceRule?.options,
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
                <Pressable
                  style={drawerStyles.collapsibleMenuItem}
                  onPress={() => {
                    updateTask("recurrenceRule", null);
                    updateTask("start", null);
                  }}
                >
                  <IconButton
                    style={{
                      borderWidth: 1,
                      borderColor: theme[6],
                      opacity: 1,
                    }}
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
          !task.dateOnly && {
            trigger: () => (
              <ListItemButton
                variant="filled"
                style={{ paddingVertical: 15, paddingHorizontal: 20 }}
              >
                <Icon>access_time</Icon>
                <ListItemText primary={dayjs(task.start).format("h:mm A")} />
              </ListItemButton>
            ),
            content: <></>,
          },
          {
            trigger: () => (
              <ListItemButton
                variant="filled"
                disabled
                style={{
                  paddingVertical: 15,
                  paddingHorizontal: 20,
                  flexDirection: breakpoints.md ? "row" : "column",
                  alignItems: breakpoints.md ? undefined : "flex-start",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                    gap: 20,
                  }}
                >
                  <Icon>exercise</Icon>
                  <ListItemText
                    primary="Complexity"
                    secondary={
                      STORY_POINT_SCALE[
                        complexityScale.findIndex((i) => i === task.storyPoints)
                      ]
                    }
                  />
                </View>
                {task.storyPoints &&
                  complexityScale.findIndex((i) => i === task.storyPoints) !==
                    -1 && (
                    <View style={{ flexDirection: "row", gap: 3 }}>
                      {complexityScale.map((n) => (
                        <IconButton
                          key={n}
                          onPress={() => updateTask("storyPoints", n)}
                          size={35}
                          style={({ pressed, hovered }) => ({
                            borderRadius: 10,
                            backgroundColor:
                              theme[
                                n === task.storyPoints
                                  ? pressed
                                    ? 12
                                    : hovered
                                    ? 11
                                    : 10
                                  : pressed
                                  ? 5
                                  : hovered
                                  ? 4
                                  : 3
                              ],
                          })}
                        >
                          <Text
                            style={{
                              fontFamily: getFontName("jetBrainsMono", 500),
                              color: theme[n === task.storyPoints ? 3 : 11],
                            }}
                          >
                            {String(n).padStart(2, "0")}
                          </Text>
                        </IconButton>
                      ))}
                    </View>
                  )}
              </ListItemButton>
            ),
            content: <></>,
          },
          task.start && {
            trigger: () => (
              <ListItemButton
                variant="filled"
                disabled
                style={{ paddingVertical: 15, paddingHorizontal: 20 }}
              >
                <Icon>notifications</Icon>
                <ListItemText
                  primary={`${task.notifications.length} notification${
                    task.notifications.length == 1 ? "" : "s"
                  }`}
                />
                <Icon>arrow_forward_ios</Icon>
              </ListItemButton>
            ),
            content: <TaskNotifications />,
          },
          task.collection && {
            trigger: () => (
              <ListItemButton
                variant="filled"
                style={{ paddingVertical: 15, paddingHorizontal: 20 }}
              >
                <Icon>interests</Icon>
                <ListItemText
                  primary={`Found in ${task.collection.name}`}
                  secondary={
                    task.label ? `Label: ${task.label?.name}` : "No label set"
                  }
                />
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
