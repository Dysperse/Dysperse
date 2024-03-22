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
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { Image } from "expo-image";
import React, { cloneElement, memo, useCallback, useRef } from "react";
import { Linking, Platform, View } from "react-native";
import TaskCheckbox from "./Checkbox";
import { TaskDrawer } from "./drawer";

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

const TaskAttachmentChips = memo(function TaskAttachmentChips({
  attachments,
}: {
  attachments: any[];
}) {
  const getAttachmentIcon = (t) =>
    ({
      LINK: "link",
      FILE: "attachment",
      LOCATION: "location_on",
    }[t]);

  return attachments.map((attachment) => (
    <ImageViewer
      key={attachment.data + attachment.type}
      image={attachment.type === "IMAGE" && attachment.data}
    >
      <Chip
        dense
        label={
          attachment.type === "LINK"
            ? new URL(attachment.data).hostname
            : attachment.type === "LOCATION"
            ? "Maps"
            : "File"
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
          ) : (
            <Icon>{getAttachmentIcon(attachment.type)}</Icon>
          )
        }
        style={{ padding: 5 }}
      />
    </ImageViewer>
  ));
});

const Task = memo(function Task({
  task,
  onTaskUpdate,
  showLabel,
  showRelativeTime,
  showDate,
}: {
  task: any;
  onTaskUpdate: (newData) => void;
  showLabel?: boolean;
  showRelativeTime?: boolean;
  showDate?: boolean;
}) {
  const theme = useColorTheme();
  const orange = useColor("orange");
  const blue = useColor("blue");

  const breakpoints = useResponsiveBreakpoints();
  const isCompleted = task.completionInstances.length > 0;

  const { selection, setSelection } = useSelectionContext();

  const handleSelect = () => {
    if (selection.includes(task.id)) {
      setSelection((d) => d.filter((e) => e !== task.id));
    } else {
      setSelection((d) => [...d, task.id]);
    }
  };

  return (
    <TaskDrawer
      id={task.id}
      mutateList={onTaskUpdate}
      disabled={selection.length > 0}
    >
      <ListItemButton
        onLongPress={handleSelect}
        {...(Platform.OS === "web" && {
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
            borderWidth: 2,
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
            alignItems: "flex-start",
          },
          isCompleted && {
            opacity: 0.6,
          },
          selection.includes(task.id) && {
            backgroundColor: blue[2],
            borderColor: blue[6],
          },
        ]}
      >
        <TaskCheckbox task={task} mutateList={onTaskUpdate} />
        <View style={{ gap: 5, flex: 1 }}>
          <View style={{ flex: 1 }}>
            <Text
              weight={300}
              style={{
                opacity: 0.8,
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
            {showRelativeTime && (
              <Chip
                disabled
                dense
                label={dayjs(task.due).fromNow()}
                icon={<Icon>access_time</Icon>}
              />
            )}
            {showDate && task.due && (
              <Chip
                disabled
                dense
                label={dayjs(task.due).format("MMM Do")}
                icon={<Icon>calendar_today</Icon>}
              />
            )}
            {showLabel && task.label && (
              <Chip
                disabled
                dense
                label={
                  task.label.name.length > 10
                    ? `${task.label.name.slice(0, 10)}...`
                    : `${task.label.name}`
                }
                colorTheme={task.label.color}
                icon={<Emoji size={17} emoji={task.label.emoji} />}
                style={{
                  paddingHorizontal: 10,
                }}
              />
            )}
            {task.attachments && (
              <TaskAttachmentChips attachments={task.attachments} />
            )}
            {task.pinned && (
              <Chip
                dense
                disabled
                label="Urgent"
                icon={
                  <Icon size={22} style={{ color: orange[11] }}>
                    priority_high
                  </Icon>
                }
                style={{ backgroundColor: orange[6] }}
                color={orange[11]}
              />
            )}
            {!task.dateOnly && (
              <Chip
                dense
                label={dayjs(task.due).format("h:mm A")}
                icon={<Icon size={22}>calendar_today</Icon>}
              />
            )}
          </View>
        </View>
      </ListItemButton>
    </TaskDrawer>
  );
});

export default React.memo(Task);
