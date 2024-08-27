import MarkdownRenderer from "@/components/MarkdownRenderer";
import { STORY_POINT_SCALE } from "@/constants/workload";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Divider from "@/ui/Divider";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover from "@/ui/MenuPopover";
import Text, { getFontName } from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { Image } from "expo-image";
import React, { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Easing,
  Linking,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Accordion from "react-native-collapsible/Accordion";
import { RRule } from "rrule";
import TaskDatePicker from "../create/TaskDatePicker";
import { TaskAttachmentButton } from "./attachment/button";
import { useTaskDrawerContext } from "./context";

const drawerStyles = StyleSheet.create({
  collapsibleMenuItem: { gap: 5, flex: 1, alignItems: "center" },
});

function TaskRescheduleButton() {
  const breakpoints = useResponsiveBreakpoints();
  const { task, updateTask } = useTaskDrawerContext();
  const handleSelect = (t, n) => {
    updateTask("start", dayjs(task.start).add(n, t).toISOString());
  };
  const isSameDay = task.start && dayjs().isSame(dayjs(task.start), "day");

  return (
    <MenuPopover
      trigger={<IconButton size={40} variant="filled" icon="dark_mode" />}
      menuProps={{
        rendererProps: { placement: breakpoints.md ? "right" : "left" },
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

function TaskNotificationsButton() {
  const breakpoints = useResponsiveBreakpoints();
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
    <MenuPopover
      trigger={
        <IconButton
          size={40}
          variant="filled"
          icon={
            <Icon filled={task.notifications.length > 0}>
              {task.notifications.length > 0
                ? "notifications_active"
                : "notifications_off"}
            </Icon>
          }
        />
      }
      closeOnSelect={false}
      menuProps={{
        rendererProps: { placement: breakpoints.md ? "right" : "left" },
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
              Remind me in
            </Text>
          ),
        },
        ...notificationScale.map((n, i) => ({
          text: notificationScaleText[i]
            .replace("m", " minutes")
            .replace("h", " hours")
            .replace("d", " day"),
          selected: task.notifications.includes(n),
          callback: () =>
            updateTask(
              "notifications",
              (task.notifications.includes(n)
                ? task.notifications.filter((i) => i !== n)
                : [...task.notifications, n]
              ).sort()
            ),
        })),
      ]}
    />
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

function EditAttachment({
  task,
  updateTask,
  item,
  handleCancel,
}: {
  task: any;
  updateTask: any;
  item: any;
  handleCancel: any;
}) {
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
              placeholder="Edit attachment…"
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

const getAttachmentPreview = (item) => {
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

      if (item?.data?.rich) {
        name = name.name;
      }
      break;
    case "IMAGE":
      icon = "image";
      if (isValidHttpUrl(name))
        name =
          new URL(item.data).pathname.split("/")?.[2] ||
          new URL(item.data).pathname;
      break;
  }
  return { icon, name };
};

const attachmentButtonStyles = (theme) => ({
  default: theme[5],
  pressed: theme[6],
  hovered: theme[7],
});

export const handleLocationPress = (session, item) => {
  if (item.type === "LOCATION" && item?.data?.rich) {
    if (session.user?.mapsProvider === "APPLE") {
      Linking.openURL(
        `https://beta.maps.apple.com/?${new URLSearchParams({
          q: item.data.full_name,
          ll: `${item.data.lat},${item.data.lon}`,
          spn: "0.008983152841206987,0.011316585492991749",
        })}`
      );
    } else {
      Linking.openURL(
        `https://maps.google.com/?${new URLSearchParams({
          q: `${item.data.lat},${item.data.lon}`,
        })}`
      );
    }
  } else {
    if (session.user?.mapsProvider === "APPLE") {
      Linking.openURL(
        `https://beta.maps.apple.com/?${new URLSearchParams({
          q: item.data,
        })}`
      );
    } else {
      Linking.openURL(`https://maps.google.com/?q=${item.data}`);
    }
  }
};

function TaskAttachmentPreview({ item, index }: { item: any; index: number }) {
  const theme = useColorTheme();
  const { session } = useUser();

  const { icon, name } = getAttachmentPreview(item);
  const handleOpenPress = useCallback(() => {
    if (isValidHttpUrl(item.data)) {
      Linking.openURL(item.data);
    } else {
      handleLocationPress(session, item);
    }
  }, [item.data]);

  return (
    <Button
      onPress={handleOpenPress}
      backgroundColors={attachmentButtonStyles(theme)}
      borderColors={attachmentButtonStyles(theme)}
      dense
    >
      {item.type === "IMAGE" ? (
        <Image
          source={{ uri: item.data }}
          contentFit="contain"
          contentPosition="center"
          style={{ borderRadius: 20, width: 24, height: 24 }}
        />
      ) : (
        <Icon>{icon || "attachment"}</Icon>
      )}
      <ButtonText>{item.name || name}</ButtonText>
    </Button>
  );
}

function TaskAttachmentCard({ item, index }: { item: any; index: number }) {
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();
  const { icon } = getAttachmentPreview(item);

  const editable =
    !isReadOnly && !(item.type === "LOCATION" && item?.data?.rich);

  const handleDeletePress = useCallback(() => {
    updateTask(
      "attachments",
      task.attachments.filter((_, i) => i !== index)
    );
  }, [updateTask, task, index]);

  return (
    <ListItemButton style={{ paddingLeft: 40 }} disabled>
      <Avatar icon={icon} style={{ borderRadius: 7 }} />
      <View style={{ flex: 1, gap: 5 }}>
        {!(item.type === "LOCATION" && !item?.data?.rich) && (
          <TextField
            variant="filled+outlined"
            editable={editable}
            defaultValue={item?.data?.name || item.name}
            placeholder="(Optional) Friendly name…"
            style={{
              paddingVertical: 3,
              paddingHorizontal: 10,
              borderRadius: 5,
            }}
            onBlur={(e) => {
              if (!e.nativeEvent.text.trim()) return;
              if (!editable) return;
              updateTask(
                "attachments",
                task.attachments.map((attachment, i) =>
                  i === index
                    ? { ...attachment, name: e.nativeEvent.text }
                    : attachment
                )
              );
            }}
          />
        )}
        <TextField
          variant="filled+outlined"
          editable={editable}
          defaultValue={item?.data?.full_name || item.data}
          placeholder={item.type === "LINK" ? "Link…" : "Location…"}
          style={{
            paddingVertical: 3,
            paddingHorizontal: 10,
            borderRadius: 5,
          }}
          onBlur={(e) => {
            if (!editable) return;
            updateTask(
              "attachments",
              task.attachments.map((attachment, i) =>
                i === index
                  ? { ...attachment, data: e.nativeEvent.text }
                  : attachment
              )
            );
          }}
        />
      </View>
      {item.type === "IMAGE" && (
        <Image
          source={{ uri: item.data }}
          style={{ borderRadius: 20 }}
          transition={100}
        />
      )}
      <IconButton icon="remove_circle" onPress={handleDeletePress} />
    </ListItemButton>
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
        <Icon>sticky_note_2</Icon>
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

  const dateName = recurrenceRule
    ? [`Repeats ${recurrenceRule.toText()}`]
    : [
        task.start ? dayjs(task.start).format("MMMM Do, YYYY") : "No date set",
        task.end &&
        !(task.dateOnly && dayjs(task.start).isSame(dayjs(task.end), "day"))
          ? `to ${dayjs(task.end).format("MMM Do, YYYY")}`
          : task.dateOnly
          ? "All day"
          : dayjs(task.start).format("[@] h:mm A"),
      ];

  return (
    <>
      <Accordion
        activeSections={activeSections}
        sectionContainerStyle={{
          backgroundColor: theme[3],
          borderRadius: 20,
          overflow: "hidden",
          marginTop: 15,
        }}
        underlayColor="transparent"
        touchableComponent={Pressable as any}
        easing={Easing.bezier(0.17, 0.67, 0.32, 1)}
        sections={[
          {
            trigger: () => (
              <ListItemButton
                disabled
                variant="filled"
                style={{ paddingVertical: 15, paddingHorizontal: 20 }}
              >
                <Icon
                  style={{
                    transform: [{ rotate: "-45deg" }],
                  }}
                >
                  attachment
                </Icon>
                <ListItemText
                  primary={
                    task.attachments?.length > 0
                      ? `${task.attachments?.length} attachment${
                          task.attachments?.length > 1 ? "s" : ""
                        }`
                      : `Attachments`
                  }
                  secondaryProps={{ style: { opacity: 1 } }}
                  secondary={
                    <View
                      style={{
                        flexWrap: "wrap",
                        gap: 5,
                        flexDirection: "row",
                      }}
                    >
                      <TaskAttachmentButton task={task} updateTask={updateTask}>
                        <Button
                          icon="add"
                          text="New"
                          variant="filled"
                          backgroundColors={attachmentButtonStyles(theme)}
                          borderColors={attachmentButtonStyles(theme)}
                          dense
                        />
                      </TaskAttachmentButton>
                      {task.attachments?.map((i, index) => (
                        <TaskAttachmentPreview
                          item={i}
                          index={index}
                          key={index}
                        />
                      ))}
                    </View>
                  }
                />
                {task.attachments?.length > 0 && (
                  <IconButton
                    style={{ opacity: 1 }}
                    variant="outlined"
                    icon="expand_more"
                    disabled
                  />
                )}
              </ListItemButton>
            ),
            content: (
              <View
                style={{
                  display: task.attachments?.length > 0 ? "flex" : "none",
                }}
              >
                <Divider />
                {task.attachments?.map((i, index) => (
                  <React.Fragment key={index}>
                    <TaskAttachmentCard item={i} index={index} key={index} />
                    {index !== task.attachments.length - 1 && (
                      <Divider style={{ height: 1 }} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            ),
          },
          task.integrationParams && {
            trigger: () => (
              <ListItemButton
                variant="filled"
                style={{ paddingVertical: 15, paddingHorizontal: 20 }}
              >
                <Icon>{task?.integrationParams?.icon || "sync_alt"}</Icon>
                <ListItemText
                  primary={`From ${
                    task?.integrationParams?.from || "integration"
                  }`}
                />
              </ListItemButton>
            ),
            content: <></>,
          },
          task.note && {
            trigger: () => <TaskNote />,
            content: (
              <View style={collapsibleMenuStyles as StyleProp<ViewStyle>}>
                <TaskAttachmentButton
                  defaultView="Note"
                  menuRef={noteMenuRef}
                  lockView
                  task={task}
                  updateTask={updateTask}
                >
                  <Pressable
                    style={drawerStyles.collapsibleMenuItem}
                    android_ripple={{ color: theme[5] }}
                  >
                    <IconButton
                      disabled
                      size={50}
                      variant="outlined"
                      style={{ opacity: 1 }}
                      icon="edit"
                    />
                    <Text>Edit</Text>
                  </Pressable>
                </TaskAttachmentButton>
                <Pressable
                  style={drawerStyles.collapsibleMenuItem}
                  onPress={() => updateTask("note", null)}
                  android_ripple={{ color: theme[5] }}
                >
                  <IconButton
                    size={50}
                    variant="outlined"
                    disabled
                    style={{ opacity: 1 }}
                    icon="close"
                  />
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
                  <ListItemText primary={dateName[0]} secondary={dateName[1]} />
                  <View style={{ flexDirection: "row" }}>
                    <TaskNotificationsButton />
                    {!isReadOnly && !task.recurrenceRule && task.start && (
                      <TaskRescheduleButton />
                    )}
                  </View>
                </ListItemButton>
              </TaskDatePicker>
            ),
            content: isReadOnly ? null : (
              <View style={collapsibleMenuStyles as StyleProp<ViewStyle>}>
                <TaskDatePicker
                  defaultView={task.recurrenceRule ? "recurrence" : "date"}
                  setValue={(name, value) =>
                    updateTask(name === "date" ? "start" : name, value)
                  }
                  watch={(inputName) => {
                    return {
                      date: task.start ? dayjs(task.start) : null,
                      dateOnly: task.dateOnly,
                      recurrenceRule: recurrenceRule?.options,
                    }[inputName];
                  }}
                >
                  <Pressable
                    style={drawerStyles.collapsibleMenuItem}
                    android_ripple={{ color: theme[5] }}
                  >
                    <IconButton
                      disabled
                      style={{
                        opacity: 1,
                      }}
                      variant="outlined"
                      size={50}
                    >
                      <Icon>edit</Icon>
                    </IconButton>
                    <Text>Edit</Text>
                  </Pressable>
                </TaskDatePicker>
                <Pressable
                  style={drawerStyles.collapsibleMenuItem}
                  android_ripple={{ color: theme[5] }}
                  onPress={() => {
                    updateTask("recurrenceRule", null);
                    updateTask("start", null);
                  }}
                >
                  <IconButton
                    style={{
                      opacity: 1,
                    }}
                    variant="outlined"
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
                disabled
                style={{
                  paddingVertical: 15,
                  paddingHorizontal: 20,
                }}
                pressableStyle={{
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
                    <View
                      style={[
                        {
                          flexDirection: "row",
                          gap: 3,
                        },
                        !breakpoints.md && { width: "100%", flex: 1 },
                      ]}
                    >
                      {complexityScale.map((n) => (
                        <IconButton
                          key={n}
                          onPress={() => updateTask("storyPoints", n)}
                          size={35}
                          backgroundColors={{
                            default: theme[n !== task.storyPoints ? 3 : 10],
                            pressed: theme[n !== task.storyPoints ? 4 : 11],
                            hovered: theme[n !== task.storyPoints ? 5 : 12],
                          }}
                          borderColors={
                            n === task.storyPoints && {
                              default: theme[10],
                              pressed: theme[11],
                              hovered: theme[12],
                            }
                          }
                          variant={breakpoints.md ? undefined : "outlined"}
                          animationConfigs={
                            breakpoints.md && { duration: 0.0001 }
                          }
                          style={[
                            breakpoints.md
                              ? {
                                  borderRadius: 10,
                                }
                              : {
                                  width: undefined,
                                  flex: 1,
                                },
                          ]}
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
        ].filter((e) => e)}
        renderHeader={(section) => section.trigger()}
        renderContent={(section) => section.content}
        onChange={setActiveSections}
      />
    </>
  );
}
