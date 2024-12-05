import { ImageViewer } from "@/components/ImageViewer";
import { Entity } from "@/components/collections/entity";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import { DatePicker } from "@/ui/DatePicker";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { Image } from "expo-image";
import React, { Fragment, useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Linking, Platform, StyleSheet, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { RRule } from "rrule";
import CreateTask from "../create";
import TaskNoteEditor from "./TaskNoteEditor";
import { useTaskDrawerContext } from "./context";

const drawerStyles = StyleSheet.create({
  collapsibleMenuItem: { gap: 5, flex: 1, alignItems: "center" },
});

function TaskRescheduleButton({ task, updateTask }) {
  const breakpoints = useResponsiveBreakpoints();
  const handleSelect = (t, n) => {
    updateTask("start", dayjs(task.start).add(n, t).toISOString());
  };
  const isSameDay = task.start && dayjs().isSame(dayjs(task.start), "day");

  return (
    <MenuPopover
      trigger={
        <MenuItem>
          <Icon>dark_mode</Icon>
          <Text variant="menuItem">Snooze</Text>
        </MenuItem>
      }
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

export const notificationScale = [5, 10, 15, 30, 60, 120, 240, 480, 1440];
export const notificationScaleText = [
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

function TaskNotificationsButton({ task, updateTask }) {
  const breakpoints = useResponsiveBreakpoints();

  return (
    <MenuPopover
      trigger={
        <MenuItem>
          <Icon filled={task.notifications.length > 0}>
            {task.notifications.length > 0
              ? "notifications_active"
              : "notifications_off"}
          </Icon>
          <Text variant="menuItem">
            {task.notifications.length} notification
            {task.notifications.length !== 1 && "s"}
          </Text>
        </MenuItem>
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
  let name = item.data.val ? item.data.val : item.data;
  switch (item.type) {
    case "LINK":
      icon = "link";
      if (isValidHttpUrl(name)) name = new URL(name).hostname;
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

export const handleLocationPress = (
  session = {
    user: { mapsProvider: "GOOGLE" },
  },
  item
) => {
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

function TaskAttachmentPreview({ item }: { item: any; index: number }) {
  const theme = useColorTheme();
  const { session } = useUser();

  const { icon, name } = getAttachmentPreview(item);
  const handleOpenPress = useCallback(() => {
    if (isValidHttpUrl(item.data)) {
      Linking.openURL(item.data?.val || item.data);
    } else {
      handleLocationPress(session, item);
    }
  }, [item, session]);

  const SafeImageViewer = item.type === "IMAGE" ? ImageViewer : Fragment;

  return (
    <SafeImageViewer image={item.data}>
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
    </SafeImageViewer>
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
          defaultValue={item?.data?.full_name || item.data?.val || item.data}
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

function NoteInsertMenu({ isFocused, editorRef }) {
  const theme = useColorTheme();
  const insertMenuStyles = useAnimatedStyle(() => ({
    opacity: isFocused.value,
    top: 0,
    right: 0,
    margin: 5,
    zIndex: 9999,
    position: "absolute",
  }));

  return (
    <Animated.View style={insertMenuStyles}>
      <MenuPopover
        trigger={
          <Button
            onPress={() => {
              editorRef.current.editor.commands.focus();
            }}
            {...(Platform.OS === "web"
              ? {
                  onMouseDown: () => editorRef.current.editor.commands.focus(),
                }
              : {})}
            backgroundColors={{
              default: addHslAlpha(theme[5], 0.7),
              hovered: addHslAlpha(theme[5], 0.8),
              pressed: addHslAlpha(theme[5], 0.9),
            }}
            icon="add"
            text="Insert"
            variant="filled"
            dense
          />
        }
        closeOnSelect
        menuProps={{
          onOpen: () => editorRef.current.editor.commands.focus(),
          onClose: () => editorRef.current.editor.commands.focus(),
        }}
        options={[
          {
            renderer: () => (
              <View style={{ flexDirection: "row" }}>
                <MenuItem
                  onPress={() =>
                    editorRef.current.editor
                      .chain()
                      .focus()
                      .toggleHeading({ level: 1 })
                      .run()
                  }
                >
                  <Icon>format_h1</Icon>
                </MenuItem>
                <MenuItem
                  onPress={() =>
                    editorRef.current.editor
                      .chain()
                      .focus()
                      .toggleHeading({ level: 2 })
                      .run()
                  }
                >
                  <Icon>format_h2</Icon>
                </MenuItem>
                <MenuItem
                  onPress={() =>
                    editorRef.current.editor
                      .chain()
                      .focus()
                      .toggleHeading({ level: 3 })
                      .run()
                  }
                >
                  <Icon>format_h3</Icon>
                </MenuItem>
              </View>
            ),
          },
          { icon: "link", text: "Link", callback: () => {} },
          { icon: "image", text: "Image", callback: () => {} },
          { icon: "location_on", text: "Location", callback: () => {} },

          { icon: "format_list_bulleted", text: "Bullets", callback: () => {} },
          {
            icon: "code",
            text: "Code block",
            callback: () =>
              editorRef.current.editor.chain().focus().toggleCodeBlock().run(),
          },
          {
            icon: "horizontal_rule",
            text: "Divider",
            callback: () =>
              editorRef.current.editor
                .chain()
                .focus()
                .setHorizontalRule()
                .run(),
          },
        ]}
      />
    </Animated.View>
  );
}

function TaskNote() {
  const theme = useColorTheme();
  const noteRef = useRef(null);
  const { task } = useTaskDrawerContext();
  const [hasClicked, setHasClicked] = useState(false);
  const shouldShow = Boolean(task.note) || hasClicked;

  const isFocused = useSharedValue(0);

  const focusedStyles = useAnimatedStyle(() => ({
    borderRadius: 10,
    position: "relative",
    backgroundColor: interpolateColor(
      isFocused.value,
      [0, 1],
      [addHslAlpha(theme[5], 0), addHslAlpha(theme[5], 0.3)]
    ),
  }));

  return !shouldShow ? (
    <ListItemButton
      style={{ marginTop: -7, opacity: 0.6, marginBottom: -7 }}
      pressableStyle={{ gap: 10 }}
      onPress={() => setHasClicked(true)}
    >
      <Icon size={20} style={{ marginTop: -3 }}>
        sticky_note_2
      </Icon>
      <Text style={{ color: theme[11] }}>Tap to add note</Text>
    </ListItemButton>
  ) : (
    <Animated.View style={focusedStyles}>
      <NoteInsertMenu isFocused={isFocused} editorRef={noteRef} />
      <TaskNoteEditor
        ref={noteRef}
        theme={theme}
        dom={{ matchContents: true }}
        setFocused={(t) => (isFocused.value = withSpring(t ? 1 : 0))}
        content={task.note?.replaceAll("] (http", "](http")?.trim()}
      />
    </Animated.View>
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
function SubtaskList() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { session } = useSession();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();

  return (
    <>
      <ListItemButton pressableStyle={{ paddingVertical: 0 }} disabled>
        <CreateTask
          mutate={() => {}}
          onPress={() => {
            if (Platform.OS === "web" && !localStorage.getItem("subtaskTip")) {
              localStorage.setItem("subtaskTip", "true");
              Toast.show({
                type: "info",
                text1: "Pro tip",
                text2: "Tap twice on a task to open this popup",
                visibilityTime: 5000,
              });
            }
          }}
          defaultValues={{ parentTask: task }}
        >
          <Button
            icon="keyboard_return"
            iconStyle={{ transform: [{ scaleX: -1 }] }}
            style={{ gap: 10, opacity: 0.6 }}
            containerStyle={{ marginLeft: -13, marginTop: 5 }}
            dense
            text={
              Object.keys(task.subtasks || {}).length === 0
                ? "New subtask"
                : `${Object.keys(task.subtasks || {}).length} subtasks`
            }
          />
        </CreateTask>
      </ListItemButton>
      <View style={{ marginHorizontal: -15 }}>
        {typeof task.subtasks === "object" &&
          Object.values(task.subtasks).map((t) => (
            <Entity
              isReadOnly={isReadOnly}
              item={t}
              onTaskUpdate={(newTask) => {
                updateTask(
                  "subtasks",
                  {
                    ...task.subtasks,
                    [t.id]: newTask,
                  },
                  false
                );
              }}
              key={t.id}
            />
          ))}
      </View>
    </>
  );
}

export function TaskDetails() {
  const theme = useColorTheme();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();

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

  const addRecurrenceRef = useRef(null);
  const addDateRef = useRef(null);

  return (
    <>
      <MenuPopover
        menuProps={{
          rendererProps: { placement: "bottom" },
          style: { marginRight: "auto" },
        }}
        containerStyle={{ marginTop: -10 }}
        trigger={
          <Button
            containerStyle={{
              marginTop: -7,
              marginLeft: 5,
              opacity: 0.6,
              marginRight: "auto",
              backgroundColor: "red",
            }}
          >
            <Icon size={20} style={{ marginTop: -3 }}>
              {task.start
                ? "calendar_today"
                : task.recurrenceRule
                ? "loop"
                : "calendar_add_on"}
            </Icon>
            <Text style={{ color: theme[11] }}>{dateName[0]}</Text>
          </Button>
        }
        options={[
          {
            icon: "edit",
            text: "Edit",
            callback: () => {
              addDateRef.current.present();
            },
          },
          !isReadOnly &&
            (task.start || task.recurrenceRule) && {
              renderer: () => (
                <TaskNotificationsButton task={task} updateTask={updateTask} />
              ),
            },
          !isReadOnly &&
            !task.recurrenceRule &&
            task.start && {
              renderer: () => (
                <TaskRescheduleButton task={task} updateTask={updateTask} />
              ),
            },
        ]}
      />
      <TaskNote />
      {(isReadOnly && task.subtasks?.length === 0) ||
      task.parentTaskId ? null : (
        <SubtaskList />
      )}

      <DatePicker
        ref={addDateRef}
        value={task.start}
        setValue={(date) => updateTask("start", date)}
      />
    </>
  );
}

