import { useSelectionContext } from "@/context/SelectionContext";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import Text from "@/ui/Text";
import { addHslAlpha, useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { Image } from "expo-image";
import React, { cloneElement, memo, useCallback, useRef } from "react";
import { Linking, Platform, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import TaskCheckbox from "./Checkbox";
import { TaskDrawer } from "./drawer";
import { normalizeRecurrenceRuleObject } from "./drawer/details";

const ImageViewer = ({ children, image }) => {
  const ref = useRef<BottomSheetModal>();
  const handleOpen = useCallback(() => ref.current.present(), []);
  const handleClose = useCallback(() => ref.current.dismiss(), []);

  const trigger = cloneElement(
    children,
    image
      ? {
          onPress: handleOpen,
        }
      : undefined
  );

  return (
    <>
      {trigger}
      {image && (
        <BottomSheet snapPoints={["60%"]} sheetRef={ref} onClose={handleClose}>
          <View
            style={{
              width: "100%",
              aspectRatio: 1,
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Image
              contentFit="contain"
              contentPosition="center"
              source={{ uri: image }}
              style={{ flex: 1, width: "100%", borderRadius: 20 }}
            />
          </View>
          <View style={{ padding: 10 }}>
            <Button variant="filled" style={{ height: 60 }}>
              <ButtonText
                style={{ fontSize: 20 }}
                onPress={() => Linking.openURL(image)}
              >
                Open
              </ButtonText>
              <Icon>open_in_new</Icon>
            </Button>
          </View>
        </BottomSheet>
      )}
    </>
  );
};

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
  "bluejeans.com",
  "join.me",
  "tokbox.com",
  "talky.io",
  "amazonchime.com",
  "viber.com",
];

export const TaskAttachmentChips = memo(function TaskAttachmentChips({
  attachments,
  large,
  published,
}: {
  attachments: any[];
  large?: boolean;
  published?: boolean;
}) {
  const theme = useColorTheme();

  const getAttachmentIcon = (t) =>
    ({
      LINK: "link",
      FILE: "attachment",
      LOCATION: "location_on",
    }[t]);

  const isVideoChatPlatform = (t) =>
    videoChatPlatforms.some((platform) => t?.includes(platform));

  return attachments.map((attachment) => (
    <ImageViewer
      key={attachment.data + attachment.type}
      image={attachment.type === "IMAGE" && attachment.data}
    >
      <Chip
        dense={!large}
        label={
          attachment.name ||
          (attachment.type === "LINK"
            ? isVideoChatPlatform(attachment.data)
              ? "Join meeting"
              : new URL(attachment.data).hostname
            : attachment.type === "LOCATION"
            ? "Maps"
            : "File")
        }
        onPress={() => {
          if (attachment.type === "LINK") {
            Linking.openURL(attachment.data);
          } else if (attachment.type === "LOCATION") {
            Linking.openURL(
              `https://www.google.com/maps/search/?api=1&query=${attachment.data}`
            );
          }
        }}
        icon={
          attachment.type === "IMAGE" ? (
            <Avatar size={22} image={attachment.data} disabled />
          ) : isVideoChatPlatform(attachment.data) ? (
            "call"
          ) : (
            getAttachmentIcon(attachment.type)
          )
        }
        style={[{ padding: 5 }, published && { backgroundColor: theme[5] }]}
      />
    </ImageViewer>
  ));
});

export const TaskImportantChip = ({
  large,
  published,
}: {
  large?: boolean;
  published?: boolean;
}) => {
  const orange = useColor("orange");
  return (
    <Chip
      dense={!large}
      disabled
      label="Urgent"
      icon={
        <Icon size={large ? 24 : 22} style={{ color: orange[11] }}>
          priority_high
        </Icon>
      }
      style={{ backgroundColor: orange[published ? 4 : 6] }}
      color={orange[11]}
    />
  );
};
export const TaskLabelChip = ({
  task,
  published = false,
  large = false,
}: {
  task: any;
  published?: boolean;
  large?: boolean;
}) => {
  const theme = useColor(task.label.color);

  return (
    <Chip
      disabled
      dense={!large}
      label={
        large
          ? task.label.name
          : task.label.name.length > 10
          ? `${task.label.name.slice(0, 10)}...`
          : `${task.label.name}`
      }
      colorTheme={task.label.color}
      icon={<Emoji size={large ? 23 : 17} emoji={task.label.emoji} />}
      style={[
        {
          paddingHorizontal: 10,
        },
        published && {
          backgroundColor: theme[4],
        },
      ]}
    />
  );
};

const Task = memo(function Task({
  task,
  onTaskUpdate,
  showLabel,
  showRelativeTime,
  showDate,
  isReadOnly,
  dateRange,
  planMode,
}: {
  task: any;
  onTaskUpdate: (newData) => void;
  showLabel?: boolean;
  showRelativeTime?: boolean;
  showDate?: boolean;
  isReadOnly?: boolean;
  dateRange?: [Date, Date];
  planMode?: boolean;
}) {
  const theme = useColorTheme();
  const blue = useColor("blue");

  const breakpoints = useResponsiveBreakpoints();

  const isCompleted = task.recurrenceRule
    ? dateRange &&
      task.completionInstances.find((instance) =>
        dayjs(instance.iteration).isBetween(
          dateRange[0],
          dateRange[1],
          "day",
          "[]"
        )
      )
    : task.completionInstances.length > 0;

  const { selection, setSelection } = useSelectionContext();

  const handleSelect = () => {
    if (isReadOnly) return;
    if (selection.includes(task.id)) {
      setSelection((d) => d.filter((e) => e !== task.id));
    } else {
      setSelection((d) => [...d, task.id]);
    }
  };

  const taskStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(selection.includes(task.id) ? 0.95 : 1, {
            damping: 50,
            stiffness: 600,
          }),
        },
      ],
    };
  });

  return (
    <Animated.View style={taskStyle}>
      <TaskDrawer
        id={task.id}
        mutateList={onTaskUpdate}
        dateRange={dateRange}
        isReadOnly={isReadOnly}
        disabled={selection.length > 0}
      >
        <ListItemButton
          android_ripple={{ color: theme[7] }}
          onLongPress={handleSelect}
          {...(Platform.OS === "web" &&
            breakpoints.md && {
              onContextMenu: handleSelect,
            })}
          {...(selection.length > 0 && {
            onPress: handleSelect,
          })}
          style={({ pressed, hovered }) => [
            {
              flexShrink: 0,
              paddingTop: breakpoints.md ? 13 : 18,
              paddingLeft: breakpoints.md ? 13 : 18,
              paddingRight: breakpoints.md ? 13 : 18,
              paddingBottom: breakpoints.md ? 8 : 18,
              borderRadius: 25,
              borderColor: "transparent",
              ...(!breakpoints.md && {
                borderWidth: 1,
                borderColor: theme[4],
                marginTop: breakpoints.md ? 0 : 5,
                marginBottom: 8,
              }),
              backgroundColor: pressed
                ? addHslAlpha(theme[4], 0.7)
                : hovered
                ? addHslAlpha(theme[3], 0.7)
                : undefined,
              ...(planMode && {
                borderWidth: 1,
                borderColor: theme[5],
                backgroundColor: theme[2],
                marginBottom: 10,
                borderRadius: 20,
              }),
              alignItems: "stretch",
            },
            selection.includes(task.id) && {
              backgroundColor: blue[4],
              borderColor: blue[8],
            },
          ]}
        >
          <TaskCheckbox
            dateRange={dateRange}
            isReadOnly={isReadOnly}
            task={task}
            mutateList={onTaskUpdate}
          />
          <View
            style={[
              { gap: 5, flex: 1 },
              isCompleted && {
                opacity: 0.4,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  marginTop:
                    task.note ||
                    (showRelativeTime && task.start) ||
                    (showDate && task.start) ||
                    task.recurrenceRule ||
                    (showLabel && task.label) ||
                    task.pinned ||
                    !task.dateOnly ||
                    task.attachments?.length > 0
                      ? -5
                      : 0,
                  ...(isCompleted && {
                    textDecorationLine: "line-through",
                  }),
                }}
              >
                {task.name}
              </Text>
              {task.note ? (
                <Text
                  numberOfLines={1}
                  weight={300}
                  style={{
                    opacity: 0.7,
                  }}
                >
                  {task.note.substring(0, 100).replaceAll("\n", " ")}
                </Text>
              ) : null}
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
              {showRelativeTime && task.start && (
                <Chip
                  disabled
                  dense
                  label={dayjs(task.start).fromNow()}
                  icon={<Icon>access_time</Icon>}
                />
              )}
              {showDate && task.start && (
                <Chip
                  disabled
                  dense
                  label={dayjs(task.start).format("MMM Do")}
                  icon={<Icon>calendar_today</Icon>}
                />
              )}
              {task.recurrenceRule && (
                <Chip
                  dense
                  label="Repeats"
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
              {task.attachments && (
                <TaskAttachmentChips attachments={task.attachments} />
              )}
              {task.pinned && <TaskImportantChip />}
              {!task.dateOnly && (
                <Chip
                  dense
                  label={dayjs(task.start).format("h:mm A")}
                  icon={<Icon size={22}>calendar_today</Icon>}
                />
              )}
            </View>
          </View>
        </ListItemButton>
      </TaskDrawer>
    </Animated.View>
  );
});

export default React.memo(Task);
