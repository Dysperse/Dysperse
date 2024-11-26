import { ImageViewer } from "@/components/ImageViewer";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Entity } from "@/components/collections/entity";
import { STORY_POINT_SCALE } from "@/constants/workload";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import { DatePicker } from "@/ui/DatePicker";
import Divider from "@/ui/Divider";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Modal from "@/ui/Modal";
import { RecurrencePicker } from "@/ui/RecurrencePicker";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { Image } from "expo-image";
import React, { Fragment, useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Easing,
  Linking,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Accordion from "react-native-collapsible/Accordion";
import Toast from "react-native-toast-message";
import { RRule } from "rrule";
import CreateTask from "../create";
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

function TaskNote({ backgroundColors }) {
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
        backgroundColors={backgroundColors}
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

const TaskCollapsibleAction = ({
  icon,
  text,
  onPress,
}: {
  icon: string;
  text: string;
  onPress?: () => any;
}) => {
  return (
    <Pressable style={drawerStyles.collapsibleMenuItem} onPress={onPress}>
      <IconButton size={50} disabled style={{ opacity: 1 }} variant="outlined">
        <Icon>{icon}</Icon>
      </IconButton>
      <Text>{text}</Text>
    </Pressable>
  );
};

function ComplexityTrigger({ backgroundColors }) {
  const ref = useRef(null);
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();

  const complexityScale = [2, 4, 8, 16, 32];

  return (
    <ListItemButton
      backgroundColors={backgroundColors}
      disabled
      style={{
        paddingVertical: 15,
        paddingHorizontal: 20,
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
            ] || "How difficult is this task?"
          }
        />
      </View>
      {!isReadOnly && (
        <View style={{ flexDirection: "row", gap: 10 }}>
          {task.storyPoints && (
            <IconButton
              onPress={() => updateTask("storyPoints", null)}
              size={35}
              animationConfigs={breakpoints.md && { duration: 0.0001 }}
              style={[breakpoints.md && { borderRadius: 10 }]}
            >
              <Icon style={{ color: theme[11] }}>close</Icon>
            </IconButton>
          )}
          <MenuPopover
            menuRef={ref}
            containerStyle={{ width: 200 }}
            trigger={
              task.storyPoints ? (
                <Pressable
                  style={({ pressed, hovered }) => ({
                    paddingLeft: 5,
                    gap: 5,
                    width: 60,
                    height: 35,
                    backgroundColor: theme[pressed ? 12 : hovered ? 11 : 10],
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                  })}
                >
                  <Text
                    style={{
                      fontFamily: "mono",
                      color: theme[1],
                    }}
                  >
                    {String(task.storyPoints).padStart(2, "0")}
                  </Text>
                  <Icon style={{ color: theme[1] }}>expand_more</Icon>
                </Pressable>
              ) : (
                <IconButton size={35} variant="outlined" icon="add" />
              )
            }
            options={
              complexityScale.map((n) => ({
                renderer: () => (
                  <MenuItem
                    onPress={() => {
                      updateTask("storyPoints", n);
                      ref.current?.close();
                    }}
                  >
                    <View
                      style={{
                        width: 30,
                        height: 30,
                        backgroundColor: addHslAlpha(
                          theme[11],
                          n === task.storyPoints ? 1 : 0.1
                        ),
                        borderRadius: 10,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "mono",
                          color: theme[n === task.storyPoints ? 1 : 11],
                        }}
                      >
                        {String(n).padStart(2, "0")}
                      </Text>
                    </View>
                    <Text variant="menuItem">
                      {
                        STORY_POINT_SCALE[
                          complexityScale.findIndex((i) => i === n)
                        ]
                      }
                    </Text>
                  </MenuItem>
                ),
              })) as any
            }
          />
        </View>
      )}
    </ListItemButton>
  );
}

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
        backgroundColors={{
          default: addHslAlpha(theme[11], 0.05),
          pressed: addHslAlpha(theme[11], 0.1),
          hovered: addHslAlpha(theme[11], 0.2),
        }}
        dense
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

function SubtaskList({ backgroundColors }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { session } = useSession();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();

  return (
    <>
      <ListItemButton
        backgroundColors={backgroundColors}
        style={{ paddingVertical: 15, paddingHorizontal: 20 }}
      >
        <Icon>list</Icon>
        <ListItemText
          style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
          primary="Subtasks"
          secondary={`${Object.keys(task?.subtasks || {}).length}`}
        />
        <View style={{ gap: 5, flexDirection: "row" }}>
          {session && <AISubtask />}
          <CreateTask
            mutate={() => {}}
            onPress={() => {
              if (
                Platform.OS === "web" &&
                !localStorage.getItem("subtaskTip")
              ) {
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
              text={breakpoints.md && "New"}
              iconPosition="end"
              backgroundColors={{
                default: addHslAlpha(theme[11], 0.05),
                pressed: addHslAlpha(theme[11], 0.1),
                hovered: addHslAlpha(theme[11], 0.2),
              }}
              dense
            />
          </CreateTask>
        </View>
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

  const [activeSections, setActiveSections] = useState([]);

  const collapsibleMenuStyles = {
    padding: 10,
    flexDirection: "row",
    paddingVertical: 10,
  } as StyleProp<ViewStyle>;

  const noteMenuRef = useRef<BottomSheetModal>(null);

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
  const backgroundColors = {
    default: "transparent",
    active: "transparent",
    hover: "transparent",
  };

  return (
    <>
      <Accordion
        activeSections={activeSections}
        sectionContainerStyle={{
          backgroundColor: addHslAlpha(theme[5], 0.3),
          borderRadius: 20,
          overflow: "hidden",
          marginTop: 15,
        }}
        underlayColor="transparent"
        touchableComponent={Pressable as any}
        easing={Easing.bezier(0.17, 0.67, 0.32, 1)}
        sections={[
          isReadOnly && task.attachments?.length === 0
            ? null
            : {
                trigger: () => (
                  <ListItemButton
                    disabled
                    backgroundColors={backgroundColors}
                    style={{
                      paddingVertical: 15,
                      paddingHorizontal: 20,
                    }}
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
                          {!isReadOnly && (
                            <TaskAttachmentButton
                              task={task}
                              updateTask={updateTask}
                            >
                              <Button
                                icon="add"
                                text="New"
                                variant="filled"
                                backgroundColors={attachmentButtonStyles(theme)}
                                borderColors={attachmentButtonStyles(theme)}
                                dense
                              />
                            </TaskAttachmentButton>
                          )}
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
                    {!isReadOnly && task.attachments?.length > 0 && (
                      <IconButton
                        style={{ opacity: 1 }}
                        variant="outlined"
                        icon="expand_more"
                        disabled
                      />
                    )}
                  </ListItemButton>
                ),
                content: !isReadOnly && (
                  <View
                    style={{
                      display: task.attachments?.length > 0 ? "flex" : "none",
                    }}
                  >
                    <Divider />
                    {task.attachments?.map((i, index) => (
                      <React.Fragment key={index}>
                        <TaskAttachmentCard
                          item={i}
                          index={index}
                          key={index}
                        />
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
                backgroundColors={backgroundColors}
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
            trigger: () => <TaskNote backgroundColors={backgroundColors} />,
            content: !isReadOnly && (
              <View style={collapsibleMenuStyles}>
                <TaskCollapsibleAction
                  icon="close"
                  text="Remove"
                  onPress={() => updateTask("note", null)}
                />
                <TaskAttachmentButton
                  defaultView="Note"
                  menuRef={noteMenuRef}
                  lockView
                  task={task}
                  updateTask={updateTask}
                >
                  <TaskCollapsibleAction icon="edit" text="Edit" />
                </TaskAttachmentButton>
              </View>
            ),
          },
          !task.parentTaskId && {
            trigger: () => (
              <ListItemButton
                disabled
                backgroundColors={backgroundColors}
                style={{ paddingVertical: 15, paddingHorizontal: 20 }}
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
                  {!isReadOnly && (task.start || task.recurrenceRule) && (
                    <TaskNotificationsButton />
                  )}
                  {!isReadOnly && !task.recurrenceRule && task.start && (
                    <TaskRescheduleButton />
                  )}
                </View>
              </ListItemButton>
            ),
            content: isReadOnly ? null : task.start || task.recurrenceRule ? (
              <View style={collapsibleMenuStyles}>
                <TaskCollapsibleAction
                  icon="close"
                  text="Remove"
                  onPress={() => {
                    updateTask("recurrenceRule", null);
                    updateTask("start", null);
                  }}
                />
                <TaskDatePicker
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
                  <TaskCollapsibleAction icon="edit" text="Edit" />
                </TaskDatePicker>
              </View>
            ) : (
              <View style={[collapsibleMenuStyles, { height: 100 }]}>
                <RecurrencePicker
                  value={recurrenceRule?.options}
                  setValue={(value) => updateTask("recurrenceRule", value)}
                  ref={addRecurrenceRef}
                />
                <DatePicker
                  value={{ date: null, dateOnly: true, end: null }}
                  setValue={(k, v) => updateTask(k === "date" ? "start" : k, v)}
                  ref={addDateRef}
                />
                <TaskCollapsibleAction
                  icon="loop"
                  text="Add recurrence"
                  onPress={() => addRecurrenceRef.current?.present()}
                />
                <TaskCollapsibleAction
                  icon="today"
                  text="Set due date"
                  onPress={() => addDateRef.current?.present()}
                />
              </View>
            ),
          },

          isReadOnly && !task.storyPoints
            ? null
            : {
                trigger: () => (
                  <ComplexityTrigger backgroundColors={backgroundColors} />
                ),
                content: <></>,
              },
          (isReadOnly && task.subtasks?.length === 0) || task.parentTaskId
            ? null
            : {
                trigger: () => (
                  <SubtaskList backgroundColors={backgroundColors} />
                ),
              },
        ].filter((e) => e)}
        renderHeader={(section) => section.trigger()}
        renderContent={(section) => section.content}
        onChange={setActiveSections}
      />
    </>
  );
}

