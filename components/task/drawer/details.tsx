import { Entity } from "@/components/collections/entity";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { DatePicker } from "@/ui/DatePicker";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Modal from "@/ui/Modal";
import { RecurrencePicker } from "@/ui/RecurrencePicker";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import * as ImagePicker from "expo-image-picker";
import React, { cloneElement, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Linking, Platform, View } from "react-native";
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

function TaskRescheduleButton({ task, updateTask }) {
  const sheetRef = useRef(null);
  const handleSelect = (t, n) => {
    updateTask("start", dayjs(task.start).add(n, t).toISOString());
  };
  const isSameDay = task.start && dayjs().isSame(dayjs(task.start), "day");

  return (
    <>
      <MenuItem onPress={() => sheetRef.current.present()}>
        <Icon>dark_mode</Icon>
        <Text variant="menuItem">Snooze</Text>
      </MenuItem>
      <Modal
        animation="SCALE"
        sheetRef={sheetRef}
        innerStyles={{ padding: 20 }}
        maxWidth={300}
      >
        <Text
          style={{
            textAlign: "center",
            fontFamily: "serifText800",
            fontSize: 35,
            marginBottom: 20,
            margin: 10,
          }}
        >
          Snooze
        </Text>
        {[
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
        ].map(({ text, callback }) => (
          <ListItemButton key={text} onPress={callback}>
            <ListItemText primary={text} />
          </ListItemButton>
        ))}
      </Modal>
    </>
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
  const sheetRef = useRef(null);

  return (
    <>
      <MenuItem onPress={() => sheetRef.current.present()}>
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
      <Modal
        animation="SCALE"
        sheetRef={sheetRef}
        innerStyles={{ padding: 20 }}
        maxWidth={300}
      >
        <Text
          style={{
            textAlign: "center",
            fontFamily: "serifText800",
            fontSize: 35,
            marginBottom: 20,
            margin: 10,
          }}
        >
          Remind me...
        </Text>
        {notificationScale
          .map((n, i) => ({
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
          }))
          .map(({ text, selected, callback }) => (
            <ListItemButton key={text} onPress={callback}>
              <Icon filled={selected}>notifications</Icon>
              <ListItemText primary={`${text} before`} />
              {selected && <Icon>check</Icon>}
            </ListItemButton>
          ))}
      </Modal>
    </>
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

// function TaskAttachmentPreview({ item }: { item: any; index: number }) {
//   const theme = useColorTheme();
//   const { session } = useUser();

//   const { icon, name } = getAttachmentPreview(item);
//   const handleOpenPress = useCallback(() => {
//     if (isValidHttpUrl(item.data)) {
//       Linking.openURL(item.data?.val || item.data);
//     } else {
//       handleLocationPress(session, item);
//     }
//   }, [item, session]);

//   const SafeImageViewer = item.type === "IMAGE" ? ImageViewer : Fragment;

//   return (
//     <SafeImageViewer image={item.data}>
//       <Button
//         onPress={handleOpenPress}
//         backgroundColors={attachmentButtonStyles(theme)}
//         borderColors={attachmentButtonStyles(theme)}
//         dense
//       >
//         {item.type === "IMAGE" ? (
//           <Image
//             source={{ uri: item.data }}
//             contentFit="contain"
//             contentPosition="center"
//             style={{ borderRadius: 20, width: 24, height: 24 }}
//           />
//         ) : (
//           <Icon>{icon || "attachment"}</Icon>
//         )}
//         <ButtonText>{item.name || name}</ButtonText>
//       </Button>
//     </SafeImageViewer>
//   );
// }

// function TaskAttachmentCard({ item, index }: { item: any; index: number }) {
//   const { task, updateTask, isReadOnly } = useTaskDrawerContext();
//   const { icon } = getAttachmentPreview(item);

//   const editable =
//     !isReadOnly && !(item.type === "LOCATION" && item?.data?.rich);

//   const handleDeletePress = useCallback(() => {
//     updateTask(
//       "attachments",
//       task.attachments.filter((_, i) => i !== index)
//     );
//   }, [updateTask, task, index]);

//   return (
//     <ListItemButton style={{ paddingLeft: 40 }} disabled>
//       <Avatar icon={icon} style={{ borderRadius: 7 }} />
//       <View style={{ flex: 1, gap: 5 }}>
//         {!(item.type === "LOCATION" && !item?.data?.rich) && (
//           <TextField
//             variant="filled+outlined"
//             editable={editable}
//             defaultValue={item?.data?.name || item.name}
//             placeholder="(Optional) Friendly name…"
//             style={{
//               paddingVertical: 3,
//               paddingHorizontal: 10,
//               borderRadius: 5,
//             }}
//             onBlur={(e) => {
//               if (!e.nativeEvent.text.trim()) return;
//               if (!editable) return;
//               updateTask(
//                 "attachments",
//                 task.attachments.map((attachment, i) =>
//                   i === index
//                     ? { ...attachment, name: e.nativeEvent.text }
//                     : attachment
//                 )
//               );
//             }}
//           />
//         )}
//         <TextField
//           variant="filled+outlined"
//           editable={editable}
//           defaultValue={item?.data?.full_name || item.data?.val || item.data}
//           placeholder={item.type === "LINK" ? "Link…" : "Location…"}
//           style={{
//             paddingVertical: 3,
//             paddingHorizontal: 10,
//             borderRadius: 5,
//           }}
//           onBlur={(e) => {
//             if (!editable) return;
//             updateTask(
//               "attachments",
//               task.attachments.map((attachment, i) =>
//                 i === index
//                   ? { ...attachment, data: e.nativeEvent.text }
//                   : attachment
//               )
//             );
//           }}
//         />
//       </View>
//       {item.type === "IMAGE" && (
//         <Image
//           source={{ uri: item.data }}
//           style={{ borderRadius: 20 }}
//           transition={100}
//         />
//       )}
//       <IconButton icon="remove_circle" onPress={handleDeletePress} />
//     </ListItemButton>
//   );
// }

function LinkModal({ children, onSubmit }) {
  const modalRef = useRef(null);
  const urlRef = useRef(null);
  const nameRef = useRef(null);

  const trigger = cloneElement(children, {
    onPress: () => {
      modalRef.current.present();
      setTimeout(() => {
        urlRef.current.focus();
      }, 400);
    },
  });

  const removeTrailingSlash = (site) => {
    return site.replace(/\/$/, "");
  };

  const handleSubmit = () => {
    try {
      onSubmit({
        name: nameRef.current.value || null,
        url: removeTrailingSlash(new URL(urlRef.current.value).toString()),
      });
      modalRef.current.close();
    } catch (e) {
      Toast.show({ type: "error", text1: "Please insert a valid URL" });
      setTimeout(() => {
        urlRef.current.focus();
      }, 400);
    }
  };

  return (
    <>
      {trigger}
      <Modal
        sheetRef={modalRef}
        maxWidth={350}
        animation="SCALE"
        innerStyles={{ padding: 20, gap: 10 }}
      >
        <View
          style={{
            marginBottom: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text weight={900} style={{ fontSize: 20 }}>
            Insert link
          </Text>
          <IconButton icon="close" variant="filled" />
        </View>
        <TextField
          onSubmitEditing={handleSubmit}
          inputRef={urlRef}
          variant="filled+outlined"
          placeholder="URL"
        />
        <TextField
          onSubmitEditing={handleSubmit}
          inputRef={nameRef}
          variant="filled+outlined"
          placeholder="Display name (optional)"
        />
        <Button
          variant="filled"
          onPress={handleSubmit}
          bold
          large
          text="Insert"
          icon="add"
        />
      </Modal>
    </>
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

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      presentationStyle: ImagePicker.UIImagePickerPresentationStyle.POPOVER,
    });

    if (!result.canceled) {
      Toast.show({
        type: "info",
        props: { loading: true },
        text1: "Uploading image...",
        swipeable: false,
        visibilityTime: 1e9,
      });
      const blob = await fetch(result.assets[0].uri).then((r) => r.blob());
      const file = new File([blob], result.assets[0].fileName, {
        type: blob.type,
      });
      const form = new FormData();
      form.append("image", file);

      const res = await fetch(
        "https://api.imgbb.com/1/upload?key=9fb5ded732b6b50da7aca563dbe66dec",
        {
          method: "POST",
          body: form,
        }
      ).then((res) => res.json());
      // updateTask("attachments", [
      //   ...(task?.attachments || []),
      //   { type: "IMAGE", data: res.data.display_url },
      // ]);
      editorRef.current.editor
        .chain()
        .focus()
        .insertContent(`<img src="${res.data.display_url}" />`)
        .run();
      Toast.hide();
      Toast.show({ type: "success", text1: "Image attached!" });
    } else {
      alert("You did not select any image.");
    }
  };

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
                  onMouseDown: () =>
                    setTimeout(
                      () => editorRef.current.editor.commands.focus(),
                      0
                    ),
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
          {
            renderer: () => (
              <LinkModal
                onSubmit={(link) => {
                  editorRef.current.editor
                    .chain()
                    .focus()
                    .insertContent(
                      `<a href="${link.url}" target="_blank">${
                        link.name || link.url
                      }</a>`
                    )
                    .run();
                }}
              >
                <MenuItem>
                  <Icon>link</Icon>
                  <Text variant="menuItem">Link</Text>
                </MenuItem>
              </LinkModal>
            ),
          },
          { icon: "image", text: "Image", callback: pickImageAsync },
          {
            icon: "location_on",
            text: "Location",
            callback: () => Toast.show({ type: "info", text1: "Coming soon!" }),
          },

          {
            icon: "format_list_bulleted",
            text: "Bullets",
            callback: () =>
              editorRef.current.editor.chain().focus().toggleBulletList().run(),
          },
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

function getPreviewText(htmlString) {
  // Use a regular expression to remove all tags and their contents (e.g., <img>)
  const strippedString = htmlString.replace(/<\/?[^>]+(>|$)/g, "");

  // Trim the string to a desired length for a preview, e.g., 150 characters
  const previewLength = 150;
  return strippedString.length > previewLength
    ? strippedString.substring(0, previewLength) + "..."
    : strippedString;
}
function TaskNote() {
  const theme = useColorTheme();
  const noteRef = useRef(null);
  const { task, updateTask } = useTaskDrawerContext();
  const [hasClicked, setHasClicked] = useState(false);
  const shouldShow = Boolean(getPreviewText(task.note)) || hasClicked;

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
    <Button
      dense
      onPress={() => setHasClicked(true)}
      containerStyle={{
        marginRight: "auto",
        opacity: 0.6,
        marginLeft: 5,
      }}
      style={{ gap: 10 }}
    >
      <Icon size={20} style={{ marginTop: -3 }}>
        sticky_note_2
      </Icon>
      <Text style={{ color: theme[11] }}>Add note</Text>
    </Button>
  ) : (
    <Animated.View style={focusedStyles}>
      <NoteInsertMenu isFocused={isFocused} editorRef={noteRef} />
      <TaskNoteEditor
        ref={noteRef}
        updateTask={updateTask as any}
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
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();

  return (
    <>
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
          icon="prompt_suggestion"
          dense
          containerStyle={{
            marginRight: "auto",
            opacity: 0.6,
            marginLeft: 5,
          }}
          style={{ gap: 10 }}
          text={
            Object.keys(task.subtasks || {}).length === 0
              ? "Create subtask"
              : `${Object.keys(task.subtasks || {}).length} subtasks`
          }
        />
      </CreateTask>
      <View
        style={{
          marginBottom: Object.keys(task.subtasks || {}).length === 0 ? 0 : 10,
        }}
      >
        {typeof task.subtasks === "object" &&
          Object.values(task.subtasks).map((t) => (
            <Entity
              dense
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

function TaskDateMenu() {
  const theme = useColorTheme();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();

  const recurrenceRule =
    task.recurrenceRule && normalizeRecurrenceRuleObject(task.recurrenceRule);

  const dateName = recurrenceRule
    ? [
        `Repeats ${recurrenceRule
          .toText()
          .replace(
            "every week on Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
            "every day"
          )}`,
      ]
    : [
        task.start ? dayjs(task.start).format("MMMM Do, YYYY") : "Set due date",
        task.end &&
        !(task.dateOnly && dayjs(task.start).isSame(dayjs(task.end), "day"))
          ? `to ${dayjs(task.end).format("MMM Do, YYYY")}`
          : task.dateOnly
          ? "All day"
          : dayjs(task.start).format("[@] h:mm A"),
      ];

  const addRecurrenceRef = useRef(null);
  const addDateRef = useRef(null);
  const breakpoints = useResponsiveBreakpoints();

  return (
    <>
      <DatePicker
        value={{ date: null, dateOnly: true, end: null }}
        setValue={(k, v) => updateTask(k === "date" ? "start" : k, v)}
        ref={addDateRef}
      />
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
      <RecurrencePicker
        value={recurrenceRule?.options}
        setValue={(value) => updateTask("recurrenceRule", value)}
        ref={addRecurrenceRef}
      />
      <MenuPopover
        menuProps={{
          style: { marginRight: "auto" },
        }}
        containerStyle={{
          [breakpoints.md ? "marginTop" : "marginBottom"]: -10,
          width: 190,
        }}
        trigger={
          <Button
            containerStyle={{
              marginRight: "auto",
              opacity: 0.6,
              marginLeft: 5,
            }}
            style={{ gap: 10 }}
            dense
          >
            <Icon size={20} style={{ marginTop: -3, flexShrink: 0 }}>
              {task.start
                ? "calendar_today"
                : task.recurrenceRule
                ? "loop"
                : "calendar_today"}
            </Icon>
            <Text style={{ color: theme[11] }}>{dateName[0]}</Text>
          </Button>
        }
        options={
          isReadOnly
            ? []
            : [
                ...(((task.start || task.recurrenceRule) && [
                  {
                    icon: "edit",
                    text: "Edit",
                    callback: () => {
                      if (task.recurrenceRule)
                        addRecurrenceRef.current.present();
                      else addDateRef.current.present();
                    },
                  },
                  {
                    renderer: () => (
                      <TaskNotificationsButton
                        task={task}
                        updateTask={updateTask}
                      />
                    ),
                  },
                ]) ||
                  []),
                ...((!task.recurrenceRule &&
                  !task.start && [
                    {
                      icon: "calendar_today",
                      text: "Add date",
                      callback: () => addDateRef.current.present(),
                    },
                    {
                      icon: "loop",
                      text: "Add recurrence",
                      callback: () => addRecurrenceRef.current.present(),
                    },
                  ]) ||
                  []),
                !task.recurrenceRule &&
                  task.start && {
                    renderer: () => (
                      <TaskRescheduleButton
                        task={task}
                        updateTask={updateTask}
                      />
                    ),
                  },
              ]
        }
      />
    </>
  );
}

export function TaskDetails() {
  const { task, isReadOnly } = useTaskDrawerContext();

  return (
    <View style={{ gap: 2, marginTop: 5 }}>
      {!task.parentTaskId && (
        <View>
          <TaskDateMenu />
        </View>
      )}
      {(isReadOnly && task.subtasks?.length === 0) ||
      task.parentTaskId ? null : (
        <View>
          <SubtaskList />
        </View>
      )}

      <View>
        <TaskNote />
      </View>
    </View>
  );
}

