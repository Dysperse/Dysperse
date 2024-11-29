import { ImageViewer } from "@/components/ImageViewer";
import { Entity } from "@/components/collections/entity";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover from "@/ui/MenuPopover";
import Modal from "@/ui/Modal";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { Image } from "expo-image";
import React, { Fragment, useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Linking, Platform, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { RRule } from "rrule";
import CreateTask from "../create";
import TaskNoteEditor from "./TaskNoteEditor";
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
      trigger={<IconButton size={40} icon="dark_mode" />}
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

function TaskNotificationsButton() {
  const breakpoints = useResponsiveBreakpoints();
  const { task, updateTask } = useTaskDrawerContext();

  return (
    <MenuPopover
      trigger={
        <IconButton
          size={40}
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

function TaskNote() {
  const theme = useColorTheme();
  const { task } = useTaskDrawerContext();
  const [hasClicked, setHasClicked] = useState(false);
  const shouldShow = Boolean(task.note) || hasClicked;

  return !shouldShow ? (
    <ListItemButton
      style={{ marginTop: -5, opacity: 0.6, marginBottom: -7 }}
      pressableStyle={{ gap: 10 }}
      onPress={() => setHasClicked(true)}
    >
      <Icon size={20} style={{ marginTop: -3 }}>
        sticky_note_2
      </Icon>
      <Text style={{ color: theme[11] }}>Tap to add note</Text>
    </ListItemButton>
  ) : (
    <TaskNoteEditor
      theme={theme}
      content={task.note?.replaceAll("] (http", "](http")?.trim()}
    />
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

function AISubtask() {
  const modalRef = useRef();
  const theme = useColorTheme();
  const { sessionToken } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { task, updateTask } = useTaskDrawerContext();

  const [selectedSubtasks, setSelectedSubtasks] = useState([]);
  const [generatedSubtasks, setGeneratedSubtasks] = useState([]);
  const [isCreationLoading, setIsCreationLoading] = useState(false);

  const handleAddSubtasks = async () => {
    setIsCreationLoading(true);
    try {
      const subtasks = selectedSubtasks.map((i) => generatedSubtasks[i]);

      const t = await sendApiRequest(
        sessionToken,
        "PATCH",
        "space/entity",
        {},
        {
          body: JSON.stringify({
            entities: subtasks.map((subtask) => ({
              name: subtask.title,
              type: "TASK",
              parentTask: task,
              parentId: task.id,
              note: subtask.description,
              collectionId: task.collectionId,
            })),
          }),
        }
      );
      updateTask(
        "subtasks",
        {
          ...task.subtasks,
          ...t.reduce((acc, curr) => {
            acc[curr.id] = curr;
            return acc;
          }, {}),
        },
        false
      );
      modalRef.current?.close();
    } catch (e) {
      Toast.show({ type: "error" });
    } finally {
      setIsCreationLoading(false);
    }
  };

  return (
    <>
      <Button
        icon="magic_button"
        text="Generate"
        dense
        style={{ gap: 10, opacity: 0.6, marginBottom: -3, marginLeft: "auto" }}
        onPress={() => {
          setIsLoading(true);
          modalRef.current?.present();

          fetch("https://dysperse.koyeb.app/subtasks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: task.name,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (!Array.isArray(data?.response))
                throw new Error("No response");
              setGeneratedSubtasks(data.response);
              setSelectedSubtasks(data.response.map((_, i) => i));
              setIsLoading(false);
            })
            .catch((e) => {
              setIsLoading(false);
              Toast.show({ type: "error" });
            });
        }}
      />
      <Modal
        maxWidth={400}
        height="auto"
        innerStyles={{ minHeight: 400 }}
        animation="SCALE"
        transformCenter
        sheetRef={modalRef}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 20,
          }}
        >
          <View>
            <Text style={{ fontSize: 20 }} weight={900}>
              AI subtasks
            </Text>
            <Text style={{ opacity: 0.6, fontSize: 13 }}>Experimental</Text>
          </View>
          <IconButton
            icon="close"
            onPress={() => modalRef.current?.close()}
            variant="filled"
          />
        </View>
        <View style={{ flex: 1 }}>
          {!isLoading ? (
            <View style={{ padding: 10, paddingTop: 0, marginTop: -10 }}>
              {generatedSubtasks.map((subtask, i) => (
                <ListItemButton
                  key={i}
                  onPress={() => {
                    setSelectedSubtasks((prev) =>
                      prev.includes(i)
                        ? prev.filter((t) => t !== i)
                        : [...prev, i]
                    );
                  }}
                  style={{
                    paddingVertical: 15,
                    paddingHorizontal: 20,
                  }}
                  pressableStyle={{
                    alignItems: "flex-start",
                  }}
                >
                  <Icon
                    filled={selectedSubtasks.includes(i)}
                    style={{ marginTop: 2 }}
                    size={30}
                  >
                    {selectedSubtasks.includes(i) ? "check_circle" : "circle"}
                  </Icon>
                  <ListItemText
                    primary={subtask.title}
                    secondary={subtask.description}
                  />
                </ListItemButton>
              ))}

              <View style={{ padding: 5 }}>
                <Button
                  isLoading={isCreationLoading}
                  onPress={handleAddSubtasks}
                  variant="filled"
                  large
                  bold
                  text={`Add ${selectedSubtasks.length} subtasks`}
                  icon="add"
                />
              </View>
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Spinner />
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

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
            icon="add"
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
        <AISubtask />
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
      <ListItemButton
        style={{ marginTop: -7, opacity: 0.6 }}
        pressableStyle={{ gap: 10 }}
      >
        <Icon size={20} style={{ marginTop: -3 }}>
          {task.start
            ? "calendar_today"
            : task.recurrenceRule
            ? "loop"
            : "calendar_add_on"}
        </Icon>
        <Text style={{ color: theme[11] }}>{dateName[0]}</Text>
        {/* <View style={{ flexDirection: "row" }}>
          {!isReadOnly && (task.start || task.recurrenceRule) && (
            <TaskNotificationsButton />
          )}
          {!isReadOnly && !task.recurrenceRule && task.start && (
            <TaskRescheduleButton />
          )}
        </View> */}
      </ListItemButton>
      <ListItemButton
        style={{ marginTop: -7, opacity: 0.6 }}
        pressableStyle={{ gap: 10 }}
      >
        <Icon size={20} style={{ marginTop: -3 }}>
          filter_drama
        </Icon>
        <Text style={{ color: theme[11] }}>{`Synced with ${
          task?.integrationParams?.from || "integration"
        }`}</Text>
      </ListItemButton>
      <TaskNote />
      {(isReadOnly && task.subtasks?.length === 0) ||
      task.parentTaskId ? null : (
        <SubtaskList />
      )}
    </>
  );
}

