import { useSelectionContext } from "@/context/SelectionContext";
import { useGlobalTaskContext } from "@/context/globalTaskContext";
import { getTaskCompletionStatus } from "@/helpers/getTaskCompletionStatus";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import dayjs from "dayjs";
import { setUrlAsync } from "expo-clipboard";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { router } from "expo-router";
import React, { memo, useMemo } from "react";
import { Linking, Platform, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { ImageViewer } from "../ImageViewer";
import TaskCheckbox from "./Checkbox";
import DayTaskModal from "./DayTaskModal";
import { TaskDrawer } from "./drawer";
import { normalizeRecurrenceRuleObject } from "./drawer/details";

export const videoChatPlatforms = [
  "zoom.us",
  "meet.google.com",
  "teams.microsoft.com",
  "skype.com",
  "appear.in",
  "gotomeeting.com",
  "webex.com",
  "hangouts.google.com",
  "whereby.com",
  "discord.com",
  "vsee.com",
  "join.me",
  "tokbox.com",
  "talky.io",
  "amazonchime.com",
  "viber.com",
];

export const TaskImportantChip = ({
  published,
}: {
  large?: boolean;
  published?: boolean;
}) => {
  const orange = useColor("orange");
  return (
    <Button
      chip
      text="Urgent"
      disabled
      icon="priority_high"
      backgroundColors={{
        default: orange[published ? 4 : 6],
        hovered: orange[published ? 4 : 6],
        pressed: orange[published ? 4 : 6],
      }}
      iconStyle={{ color: orange[11] }}
      textStyle={{ color: orange[11] }}
    />
  );
};
export const TaskLabelChip = ({
  task,
  large = false,
}: {
  task: any;
  published?: boolean;
  large?: boolean;
}) => {
  const theme = useColor(task.label.color);

  return (
    <Button
      chip
      text={
        large
          ? task.label.name
          : task.label.name.length > 10
          ? `${task.label.name.slice(0, 10)}...`
          : `${task.label.name}`
      }
      backgroundColors={{
        default: theme[3],
        hovered: theme[4],
        pressed: theme[5],
      }}
      onPress={() => router.push(`/everything/labels/${task.label.id}`)}
      icon={<Emoji size={large ? 23 : 17} emoji={task.label.emoji} />}
      textStyle={{ color: theme[11] }}
    />
  );
};

export function getPreviewText(htmlString) {
  if (!htmlString) return "";
  // Use a regular expression to remove all tags and their contents (e.g., <img>)
  const strippedString = htmlString
    .replace(/<a\b[^>]*>(.*?)<\/a>/gi, "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace("null", "");

  // Trim the string to a desired length for a preview, e.g., 150 characters
  const previewLength = 150;
  return strippedString.length > previewLength
    ? strippedString.substring(0, previewLength) + "..."
    : strippedString;
}

function extractLinksFromHTML(htmlString) {
  // Regular expression to match all <a> tags and extract href and inner text
  const regex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi;

  const links = [];
  let match;

  while ((match = regex.exec(htmlString)) !== null) {
    const innerHTML = match[2].trim();
    let text = innerHTML.replace(/<[^>]+>/g, ""); // Remove any HTML tags within the link text
    let icon = "link";

    if (text === match[1]) {
      try {
        text = new URL(text).hostname;
      } catch (e) {
        // If the URL is invalid, keep the original text
      }
    }

    if (videoChatPlatforms.some((platform) => text.includes(platform))) {
      text = "Join meeting";
      icon = "call";
    }

    links.push({
      href: match[1],
      icon,
      text,
      type: "LINK",
    });
  }

  return links;
}

function extractImagesFromHTML(htmlString) {
  const regex =
    /<img\s+(?:[^>]*?\s+)?src=["']([^"']*)["'](?:[^>]*?\s+)?alt=["']([^"']*)["']|<img\s+(?:[^>]*?\s+)?src=["']([^"']*)["'][^>]*>/gi;

  const images = [];
  let match;

  while ((match = regex.exec(htmlString)) !== null) {
    images.push({
      image: match[1] || match[3],
      text: " Image",
      type: "IMAGE",
    });
  }

  return images;
}

function TaskNoteChips({ note }) {
  const chips = useMemo(
    () => [...extractLinksFromHTML(note), ...extractImagesFromHTML(note)],
    [note]
  );

  return (
    <>
      {chips.filter((link) => link.text?.trim()).length > 3 ? (
        <MenuPopover
          containerStyle={{ width: 250 }}
          options={chips
            .filter((link) => link.text?.trim())
            .map((link) => ({
              text: link.text,
              icon: link.image ? (
                <Avatar size={22} image={link.image} disabled />
              ) : (
                link.icon
              ),
              onLongPress: () => {
                impactAsync(ImpactFeedbackStyle.Light);
                if (Platform.OS === "web")
                  navigator.clipboard.writeText(link.href);
                else setUrlAsync(link.href);
                Toast.show({
                  type: "info",
                  text1: "Copied link to clipboard",
                });
              },
              onPress: () => Linking.openURL(link.image || link.href),
            }))}
          trigger={
            <Button
              chip
              text={`${chips.length} links`}
              icon="expand_more"
              iconPosition="end"
            />
          }
        />
      ) : (
        chips
          .filter((link) => link.text?.trim())
          .map((link, index) => (
            <ImageViewer
              key={index + link.type}
              image={link.type === "IMAGE" && link.image}
            >
              <Button
                chip
                key={index}
                textStyle={{ maxWidth: 180 }}
                text={link.text}
                onLongPress={() => {
                  impactAsync(ImpactFeedbackStyle.Light);
                  if (Platform.OS === "web")
                    navigator.clipboard.writeText(link.href);
                  else setUrlAsync(link.href);
                  Toast.show({
                    type: "info",
                    text1: "Copied link to clipboard",
                  });
                }}
                textProps={{ numberOfLines: 1 }}
                onPress={() => Linking.openURL(link.image || link.href)}
                icon={
                  link.image ? (
                    <Avatar size={22} image={link.image} disabled />
                  ) : (
                    link.icon
                  )
                }
              />
            </ImageViewer>
          ))
      )}
    </>
  );
}

const Task = memo(function Task({
  task,
  onTaskUpdate,
  showLabel,
  showRelativeTime,
  showDate,
  isReadOnly,
  dateRange,
  planMode,
  dense,
  reorderFunction,
}: {
  task: any;
  onTaskUpdate: (newData) => void;
  showLabel?: boolean;
  showRelativeTime?: boolean;
  showDate?: boolean;
  isReadOnly?: boolean;
  dateRange?: string;
  planMode?: boolean;
  dense?: boolean;
  reorderFunction?: any;
}) {
  const theme = useColorTheme();
  const blue = useColor("blue");

  const breakpoints = useResponsiveBreakpoints();
  const isCompleted = getTaskCompletionStatus(task, task.recurrenceDay);
  const { reorderMode, selection, setSelection } = useSelectionContext() || {};
  const { globalTaskCreateRef, wrapperRef } = useGlobalTaskContext() || {};

  const handleSelect = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    if (isReadOnly || !setSelection) return;
    setSelection((prev) =>
      prev.some((e) => e.id === task.id)
        ? prev.filter((e) => e.id !== task.id)
        : [...prev, task]
    );
  };

  const isSelected = useMemo(
    () => selection?.some((e) => e.id === task.id),
    [selection, task?.id]
  );

  const taskStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isSelected && !reorderMode ? 0.95 : 1, {
          damping: 50,
          stiffness: 600,
        }),
      },
    ],
  }));

  const hasNote = useMemo(
    () => task.note && getPreviewText(task.note).trim().length > 0,
    [task.note]
  );

  const hasChip = useMemo(
    () =>
      (showLabel && task.label) ||
      task.note ||
      ((showRelativeTime || !task.dateOnly) && task.start) ||
      task.pinned ||
      task.recurrenceRule,
    [task, showLabel, showRelativeTime]
  );

  return (
    <>
      <Animated.View
        style={[taskStyle, task.parentTaskId && { marginLeft: 20 }]}
      >
        <TaskDrawer
          smallWidth={task.parentTaskId}
          onDoublePress={
            task.parentTaskId
              ? null
              : () => {
                  wrapperRef.current.setDefaultValues({ parentTask: task });
                  globalTaskCreateRef.current.present();
                  setTimeout(() => {
                    globalTaskCreateRef.current.setValue("parentTask", task);
                    wrapperRef.current.mutateValue((newTask) => {
                      onTaskUpdate(newTask);
                    });
                  }, 100);
                }
          }
          id={task.id}
          mutateList={onTaskUpdate}
          dateRange={dateRange}
          isReadOnly={isReadOnly}
          disabled={selection?.length > 0}
        >
          <ListItemButton
            onLongPress={reorderMode ? reorderFunction : handleSelect}
            {...(Platform.OS === "web" &&
              breakpoints.md && { onContextMenu: handleSelect })}
            {...(selection?.length > 0 && {
              onPress: handleSelect,
            })}
            pressableStyle={{
              paddingLeft: 15,
              paddingRight: 13,
              alignItems: "flex-start",
              paddingVertical: breakpoints.md ? (dense ? 3 : 8) : 10,
              ...(isSelected && !reorderMode && { backgroundColor: blue[4] }),
            }}
            style={[
              {
                flexShrink: 0,
                borderRadius: 25,
                marginTop: breakpoints.md ? 0 : 3,
                borderColor: "transparent",
                ...(planMode && {
                  borderWidth: 1,
                  borderColor: theme[5],
                  backgroundColor: theme[2],
                  marginBottom: 10,
                  borderRadius: 20,
                }),
                alignItems: "stretch",
              },
            ]}
          >
            <View style={{ marginTop: hasChip ? 5 : 0 }}>
              {reorderMode ? (
                <View
                  style={{
                    padding: 10,
                    margin: -10,
                    transform: [{ translateX: -5 }],
                  }}
                >
                  <Icon size={25}>drag_indicator</Icon>
                </View>
              ) : (
                <TaskCheckbox
                  isReadOnly={isReadOnly}
                  task={task}
                  mutateList={onTaskUpdate}
                />
              )}
            </View>
            <View style={{ flex: 1, alignItems: "flex-start" }}>
              <Text
                style={[
                  {
                    flex: 1,
                    ...(isCompleted && {
                      textDecorationLine: "line-through",
                    }),
                  },
                  isCompleted && { opacity: 0.4 },
                ]}
              >
                {task.name}
              </Text>
              <View
                style={[
                  {
                    flex: 1,
                    maxWidth: "100%",
                    gap: 5,
                  },
                  isCompleted && { opacity: 0.4 },
                ]}
              >
                <View style={{ flex: 1 }}>
                  {hasNote ? (
                    <Text
                      numberOfLines={1}
                      weight={300}
                      style={{ opacity: 0.6, fontSize: 14, marginVertical: 2 }}
                    >
                      {getPreviewText(task.note).trim().substring(0, 100)}
                    </Text>
                  ) : null}
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 5,
                    display: hasChip ? "flex" : "none",
                  }}
                >
                  {task.pinned && <TaskImportantChip />}
                  {(showRelativeTime || !task.dateOnly) && task.start && (
                    <Button
                      chip
                      text={
                        showRelativeTime
                          ? dayjs(task.start).fromNow()
                          : dayjs(task.start).format("h:mm a")
                      }
                      icon="access_time"
                    />
                  )}
                  {showDate && task.start && (
                    <DayTaskModal date={task.start} taskId={task.id}>
                      <Button
                        chip
                        text={dayjs(task.start).format(
                          task.dateOnly
                            ? "MMM Do"
                            : dayjs(task.start).minute() === 0
                            ? "MMM Do [@] h a"
                            : "MMM Do [@] h:mm a"
                        )}
                        icon={<Icon>calendar_today</Icon>}
                      />
                    </DayTaskModal>
                  )}
                  {task.recurrenceRule && (
                    <Button
                      chip
                      text="Repeats"
                      icon="loop"
                      onPress={() => {
                        Toast.show({
                          type: "info",
                          text1: capitalizeFirstLetter(
                            normalizeRecurrenceRuleObject(
                              task.recurrenceRule
                            ).toText()
                          ),
                        });
                      }}
                    />
                  )}
                  {showLabel && task.label && <TaskLabelChip task={task} />}
                  <TaskNoteChips note={task.note} />
                </View>
              </View>
            </View>
          </ListItemButton>
        </TaskDrawer>
      </Animated.View>
      {task.subtasks &&
        Object.values(task.subtasks)
          ?.filter((e) => !e.trash)
          ?.map((subtask) => (
            <Task key={subtask.id} task={subtask} onTaskUpdate={onTaskUpdate} />
          ))}
    </>
  );
});

export default React.memo(Task);

