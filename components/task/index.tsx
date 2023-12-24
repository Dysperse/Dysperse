import AutoSizeTextArea from "@/ui/AutoSizeTextArea";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import React, { cloneElement, useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import useSWR from "swr";
import { TaskCheckbox } from "./Checkbox";
import ErrorAlert from "@/ui/Error";
import { useColor } from "@/ui/color";

const styles = StyleSheet.create({
  section: {
    borderRadius: 25,
    overflow: "hidden",
  },
  divider: {
    height: 2,
  },
});

function TaskDrawerContent({ data, handleClose }) {
  const theme = useColorTheme();

  return (
    <BottomSheetScrollView stickyHeaderIndices={[0]}>
      <View
        className="flex-row items-start"
        style={{
          backgroundColor: theme[1],
          paddingHorizontal: 20,
          height: 60,
          left: 0,
        }}
      >
        <View
          className="flex-row"
          style={{ paddingTop: 10, gap: 10, width: "100%" }}
        >
          <IconButton
            onPress={handleClose}
            style={{ backgroundColor: theme[3] }}
          >
            <Icon>close</Icon>
          </IconButton>
          <View className="flex-1" />
          <IconButton style={{ backgroundColor: theme[3] }}>
            <Icon>dark_mode</Icon>
          </IconButton>
          <IconButton
            className="bg-gray-200 flex-row px-3 ml-1.5"
            style={{
              backgroundColor: theme[3],
              width: "auto",
              flexDirection: "row",
              gap: 10,
              paddingHorizontal: 10,
            }}
          >
            <Icon>check</Icon>
            <Text>Complete</Text>
          </IconButton>
        </View>
      </View>
      <View style={{ paddingBottom: 20, paddingHorizontal: 20 }}>
        <View className="flex-row" style={{ gap: 10, marginVertical: 20 }}>
          <Chip icon={<Icon filled={data.pinned}>push_pin</Icon>} />
          <Chip icon={<Icon>label</Icon>} />
          <Chip label={dayjs(data.due).format("DD/MM/YYYY")} />
        </View>
        <AutoSizeTextArea
          inputDefaultValue={data.name}
          inputClassName="text-5xl uppercase"
          inputStyle={{
            fontFamily: "heading",
            color: theme[12],
          }}
          fontSize={50}
        />
        <Text
          textClassName="uppercase text-sm text-gray-700 mt-3 mb-1 opacity-60"
          weight={700}
        >
          Note
        </Text>
        <TextInput
          placeholder="Coming soon..."
          value="Coming soon!"
          className="opacity-60"
          style={{ fontFamily: "body_300", color: theme[12] }}
        />

        <Text
          textClassName="uppercase text-sm text-gray-700 mt-5 mb-2 opacity-60"
          weight={700}
        >
          Attachments
        </Text>
        <View style={[styles.section, { backgroundColor: theme[3] }]}>
          {data.where && (
            <ListItemButton
              className="flex-row"
              style={{ gap: 10, paddingRight: 0, paddingVertical: 0 }}
            >
              <Avatar size={30} style={{ backgroundColor: theme[5] }}>
                <Icon size={20}>link</Icon>
              </Avatar>
              <TextInput
                value={data.where}
                style={{
                  fontFamily: "body_600",
                  flex: 1,
                  paddingVertical: 5,
                  color: theme[12],
                }}
              />
            </ListItemButton>
          )}
          {data.where && (
            <View style={[styles.divider, { backgroundColor: theme[5] }]} />
          )}
          <ListItemButton buttonClassName="justify-center py-2 bg-gray-100 rounded-t-none active:bg-gray-300">
            <Icon>add</Icon>
            <ListItemText primary="Add" />
          </ListItemButton>
        </View>

        <Text
          textClassName="uppercase text-sm text-gray-700 mt-5 mb-2 opacity-60"
          weight={700}
        >
          Subtasks
        </Text>
        <View style={[styles.section, { backgroundColor: theme[3] }]}>
          {data.subTasks.length > 0 && (
            <View className="border-t border-gray-200" />
          )}
          <ListItemButton buttonClassName="justify-center py-2 bg-gray-100 rounded-t-none active:bg-gray-300">
            <Icon>add</Icon>
            <ListItemText primary="New" />
          </ListItemButton>
        </View>

        {data.image && (
          <View className="flex-row">
            <Avatar>
              <Icon>image</Icon>
            </Avatar>
            <TextInput value={data.image} style={{ fontFamily: "body_600" }} />
          </View>
        )}

        <Text
          textClassName="uppercase text-sm text-gray-700 mt-5 mb-2 opacity-60"
          weight={700}
        >
          About
        </Text>
        <View style={[styles.section, { backgroundColor: theme[3] }]}>
          {data.createdBy && (
            <ListItemButton>
              <ProfilePicture
                size={30}
                name={data.createdBy.name}
                image={data.createdBy.profile.picture}
              />
              <ListItemText
                primary={`Created by @${data.createdBy.username}`}
              />
            </ListItemButton>
          )}
          <ListItemButton>
            <Avatar size={30}>
              <Icon>workspaces</Icon>
            </Avatar>
            <ListItemText primary={`Found in #${data.property.username}`} />
          </ListItemButton>
          <ListItemButton>
            <Avatar size={30}>
              <Icon>access_time</Icon>
            </Avatar>
            <ListItemText
              primary={`Edited ${dayjs(data.lastUpdated).fromNow()}`}
            />
          </ListItemButton>
        </View>

        <View
          style={[styles.section, { backgroundColor: theme[3], marginTop: 20 }]}
        >
          <ListItemButton buttonClassName="justify-center py-4">
            <ListItemText primary="Delete task" />
          </ListItemButton>
        </View>
      </View>
    </BottomSheetScrollView>
  );
}

export function TaskDrawer({ children, id }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<BottomSheetModal>(null);

  // callbacks
  const handleOpen = useCallback(() => {
    ref.current?.present();
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    ref.current?.close();
  }, []);

  const trigger = cloneElement(children, { onPress: handleOpen });
  const { width } = useWindowDimensions();

  // Fetch data
  const { data, error } = useSWR(["space/tasks/task", { id }]);

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        snapPoints={error ? ["50%"] : width > 600 ? ["90%"] : ["50%", "80%"]}
        onClose={handleClose}
        style={{
          maxWidth: 550,
          margin: "auto",
        }}
      >
        {data ? (
          <TaskDrawerContent data={data} handleClose={handleClose} />
        ) : error ? (
          <View style={{ padding: 20 }}>
            <ErrorAlert />
          </View>
        ) : (
          <ActivityIndicator />
        )}
      </BottomSheet>
    </>
  );
}

export function Task({ task }) {
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  const orange = useColor("orange", useColorScheme() === "dark");

  return (
    <TaskDrawer id={task.id}>
      <ListItemButton
        onLongPress={() => {
          console.log("long press");
        }}
        style={({ pressed, hovered }) => ({
          paddingHorizontal: 15,
          paddingVertical: 15,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: theme[pressed ? 5 : 4],
          alignItems: "flex-start",
        })}
      >
        <TaskCheckbox completed={task?.completionInstances?.length > 0} />
        <View style={{ gap: 5, paddingTop: 1 }}>
          <Text numberOfLines={1}>{task.name}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
            {task.pinned && (
              <Chip
                dense
                label="Pinned"
                icon={
                  <Icon size={22} style={{ color: orange[11] }}>
                    favorite
                  </Icon>
                }
                style={{ backgroundColor: orange[3] }}
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
}
