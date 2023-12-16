import AutoSizeTextArea from "@/ui/AutoSizeTextArea";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import { BottomSheetBackHandler } from "@/ui/BottomSheet/BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "@/ui/BottomSheet/BottomSheetBackdropComponent";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  WINDOW_WIDTH,
} from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import React, { cloneElement, useCallback, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import useSWR from "swr";
import { TaskCheckbox } from "./Checkbox";

function TaskDrawerContent({ data, handleClose }) {
  return (
    <BottomSheetScrollView stickyHeaderIndices={[0]}>
      <View
        className="flex-row items-start bg-white"
        style={{
          paddingHorizontal: 20,
          height: 60,
          left: 0,
        }}
      >
        <View className="flex-row" style={{ paddingTop: 10 }}>
          <IconButton className="bg-gray-200" onPress={handleClose}>
            <Icon>close</Icon>
          </IconButton>
          <View className="flex-1" />
          <IconButton>
            <Icon>dark_mode</Icon>
          </IconButton>
          <IconButton
            className="bg-gray-200 flex-row px-3 ml-1.5"
            style={{ width: "auto", gap: 5 }}
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
          value=""
          className="opacity-60"
          style={{ fontFamily: "body_300" }}
        />

        <Text
          textClassName="uppercase text-sm text-gray-700 mt-3 mb-2 opacity-60"
          weight={700}
        >
          Attachments
        </Text>
        <View className="bg-gray-100 rounded-2xl overflow-hidden">
          {data.where && (
            <ListItemButton
              className="flex-row"
              style={{ gap: 10, paddingRight: 0, paddingVertical: 0 }}
            >
              <Avatar size={30} viewClassName="bg-gray-200">
                <Icon size={20}>link</Icon>
              </Avatar>
              <TextInput
                value={data.where}
                style={{
                  fontFamily: "body_600",
                  flex: 1,
                  paddingVertical: 5,
                }}
              />
            </ListItemButton>
          )}
          {data.where && <View className="border-t border-gray-200" />}
          <ListItemButton buttonClassName="justify-center py-2 bg-gray-100 rounded-t-none active:bg-gray-300">
            <Icon>add</Icon>
            <ListItemText>Add</ListItemText>
          </ListItemButton>
        </View>

        <Text
          textClassName="uppercase text-sm text-gray-700 mt-3 mb-2 opacity-60"
          weight={700}
        >
          Subtasks
        </Text>
        <View className="bg-gray-100 rounded-2xl overflow-hidden">
          {data.subTasks.length > 0 && (
            <View className="border-t border-gray-200" />
          )}
          <ListItemButton buttonClassName="justify-center py-2 bg-gray-100 rounded-t-none active:bg-gray-300">
            <Icon>add</Icon>
            <ListItemText>New</ListItemText>
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
          textClassName="uppercase text-sm text-gray-700 mt-3 mb-2 opacity-60"
          weight={700}
        >
          About
        </Text>
        <View className="bg-gray-100 rounded-2xl">
          {data.createdBy && (
            <ListItemButton>
              <ProfilePicture
                size={30}
                name={data.createdBy.name}
                image={data.createdBy.Profile.picture}
              />
              <ListItemText>Created by {data.createdBy.name}</ListItemText>
            </ListItemButton>
          )}
          <ListItemButton>
            <Avatar size={30}>
              <Icon>workspaces</Icon>
            </Avatar>
            <ListItemText>Found in "{data.property.name}"</ListItemText>
          </ListItemButton>
          <ListItemButton>
            <Avatar size={30}>
              <Icon>access_time</Icon>
            </Avatar>
            <ListItemText>
              Edited {dayjs(data.lastUpdated).fromNow()}
            </ListItemText>
          </ListItemButton>
        </View>

        <View className="bg-gray-100 rounded-2xl mt-5">
          <ListItemButton buttonClassName="justify-center py-4">
            <ListItemText>Delete task</ListItemText>
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

  // Fetch data
  const { data, error } = useSWR(["space/tasks/task", { id }]);

  return (
    <>
      {trigger}
      <BottomSheetModal
        ref={ref}
        snapPoints={["50%", "80%"]}
        backdropComponent={BottomSheetBackdropComponent}
      >
        <BottomSheetBackHandler handleClose={handleClose} />
        {data ? (
          <TaskDrawerContent data={data} handleClose={handleClose} />
        ) : (
          <ActivityIndicator />
        )}
      </BottomSheetModal>
    </>
  );
}

export function Task({ task }) {
  return (
    <TaskDrawer id={task.id}>
      <ListItemButton
        wrapperStyle={{
          borderRadius: WINDOW_WIDTH > 600 ? 20 : 0,
          paddingVertical: 10,
        }}
      >
        <TaskCheckbox completed={task.completionInstances.length > 0} />
        <Text weight={400}>{task.name}</Text>
      </ListItemButton>
    </TaskDrawer>
  );
}
