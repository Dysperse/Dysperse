import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import { Menu } from "@/ui/Menu";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { Image } from "expo-image";
import React, { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Linking,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Accordion from "react-native-collapsible/Accordion";
import { FlatList } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import DateTimePicker from "react-native-ui-datepicker";
import { TaskAttachmentButton } from "./attachment/button";
import { TaskStream } from "./audit-log";
import { useTaskDrawerContext } from "./context";

const drawerStyles = StyleSheet.create({
  collapsibleMenuItem: { gap: 5, flex: 1, alignItems: "center" },
});

function DatePickerModal({ date, onDateSelect, children, menuRef }) {
  const theme = useColorTheme();
  const calendarTextStyles = { color: theme[11], fontFamily: "body_400" };

  return (
    <Menu menuRef={menuRef} height={[440 + 23.5]} trigger={children}>
      <DateTimePicker
        value={date}
        selectedItemColor={theme[9]}
        todayContainerStyle={{ borderColor: theme[4] }}
        calendarTextStyle={calendarTextStyles}
        headerTextStyle={calendarTextStyles}
        todayTextStyle={calendarTextStyles}
        selectedTextStyle={calendarTextStyles}
        weekDaysTextStyle={calendarTextStyles}
        timePickerTextStyle={calendarTextStyles}
        buttonNextIcon={<Icon>arrow_forward_ios</Icon>}
        buttonPrevIcon={<Icon>arrow_back_ios_new</Icon>}
        weekDaysContainerStyle={{ borderColor: theme[4] }}
        onValueChange={(date) => onDateSelect(dayjs(date))}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 10,
          marginTop: 10,
          paddingVertical: 5,
          borderTopWidth: 2,
          borderTopColor: theme[4],
        }}
      >
        <Button onPress={() => menuRef.current?.forceClose()}>
          <Icon>close</Icon>
          <ButtonText>Cancel</ButtonText>
        </Button>
        <Button onPress={() => menuRef.current?.forceClose()} variant="filled">
          <ButtonText>Done</ButtonText>
          <Icon>check</Icon>
        </Button>
      </View>
    </Menu>
  );
}

function TaskAttachmentCategory({ category, attachments }) {
  const theme = useColorTheme();
  const { task } = useTaskDrawerContext();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const icon = {
    LINK: "link",
    LOCATION: "location_on",
  }[category];

  return (
    <View style={{ backgroundColor: theme[open ? 4 : 3], borderRadius: 20 }}>
      <ListItemButton
        style={{
          backgroundColor: "transparent",
          alignItems: attachments.length == 1 ? "center" : "flex-start",
        }}
      >
        <Icon style={{ marginTop: 10 }}>{icon}</Icon>
        <View style={{ flex: 1 }}>
          {attachments.map((attachment) => (
            <Pressable
              style={{
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
              key={attachment.id}
            >
              <ListItemText primary={attachment.data} truncate />
              <Button
                variant="filled"
                dense
                style={{ backgroundColor: theme[4] }}
              >
                <ButtonText>Open</ButtonText>
                <Icon>north_east</Icon>
              </Button>
            </Pressable>
          ))}
        </View>
      </ListItemButton>
    </View>
  );
}

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function EditAttachment({ item, handleCancel }) {
  const { control, handleSubmit } = useForm({
    defaultValues: { attachment: item.data },
  });
  const onSubmit = (data) => console.log(data);

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
        <Controller
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              multiline
              bottomSheet
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              variant="filled+outlined"
              placeholder="Edit attachment..."
              style={{
                flex: 1,
                fontSize: 20,
                paddingHorizontal: 20,
                paddingVertical: 20,
              }}
            />
          )}
          name="attachment"
          control={control}
          defaultValue={item.data}
        />
      </View>
    </>
  );
}

function TaskAttachmentCard({ item }) {
  const theme = useColorTheme();
  const [isEditing, setIsEditing] = useState(false);
  const { height } = useWindowDimensions();

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
      break;
    case "IMAGE":
      icon = "image";
      break;
  }

  const handleOpenPress = useCallback(() => {
    if (isValidHttpUrl(item.data)) {
      Linking.openURL(item.data);
    } else {
      Linking.openURL(`https://maps.google.com/?q=${item.data}`);
    }
  }, [item.data]);

  const handleEditPress = useCallback(() => setIsEditing(true), []);
  const handleCancelEditing = useCallback(() => setIsEditing(false), []);

  return (
    <Menu
      trigger={
        <Pressable
          style={({ pressed }) => ({
            width: 190,
            backgroundColor: theme[pressed ? 4 : 3],
            padding: 20,
            borderRadius: 20,
            height: 100,
            justifyContent: "flex-end",
            position: "relative",
          })}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              margin: 20,
              marginTop: 15,
              flexDirection: "row",
              alignItems: "center",
              zIndex: 999,
              gap: 5,
              backgroundColor: "rgba(0,0,0,0.9)",
              borderRadius: 5,
            }}
          >
            <Icon size={30}>{icon}</Icon>
          </View>
          {item.type !== "IMAGE" && (
            <Text numberOfLines={1} style={{ fontSize: 17 }}>
              {name}
            </Text>
          )}
          {item.type === "IMAGE" && (
            <Image
              source={{ uri: item.data }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                borderRadius: 20,
              }}
              transition={100}
            />
          )}
        </Pressable>
      }
      height={[item.type === "IMAGE" ? height - 50 : isEditing ? 350 : 250]}
    >
      {item.type === "IMAGE" && (
        <View style={{ flex: 1, padding: 25 }}>
          <Image
            source={{ uri: item.data }}
            style={{
              flex: 1,
              borderRadius: 20,
              marginTop: -20,
            }}
            transition={100}
          />
        </View>
      )}
      {isEditing ? (
        <EditAttachment handleCancel={handleCancelEditing} item={item} />
      ) : (
        <View style={{ paddingHorizontal: 20, gap: 20 }}>
          <Button
            variant="filled"
            style={{ height: 90, paddingHorizontal: 30 }}
            onPress={handleOpenPress}
          >
            <View>
              <ButtonText weight={900}>
                Open{" "}
                {item.type === "IMAGE"
                  ? "image"
                  : isValidHttpUrl(item.data)
                  ? "link"
                  : "in Maps"}
              </ButtonText>
              <ButtonText
                style={{ opacity: 0.5, paddingRight: 25 }}
                numberOfLines={1}
              >
                {!isValidHttpUrl(item.data) ? `"${name}"` : name}
              </ButtonText>
            </View>
            <Icon style={{ marginLeft: "auto" }}>north_east</Icon>
          </Button>
          <View style={{ flexDirection: "row", gap: 20 }}>
            <Button variant="outlined" style={{ height: 70, flex: 1 }}>
              <Icon>remove_circle</Icon>
              <ButtonText style={{ fontSize: 17 }}>Delete</ButtonText>
            </Button>
            {item.type !== "IMAGE" && (
              <Button
                variant="outlined"
                style={{ height: 70, flex: 1 }}
                onPress={handleEditPress}
              >
                <Icon>edit_square</Icon>
                <ButtonText style={{ fontSize: 17 }}>Edit</ButtonText>
              </Button>
            )}
          </View>
        </View>
      )}
    </Menu>
  );
}

export function TaskDetails() {
  const theme = useColorTheme();
  const { task, updateTask } = useTaskDrawerContext();

  const [activeSections, setActiveSections] = useState([]);

  const dateMenuRef = useRef();

  const handleEditDate = (date) => {
    updateTask("due", date.toISOString());
  };

  const collapsibleMenuStyles = {
    backgroundColor: theme[3],
    padding: 10,
    flexDirection: "row",
    paddingVertical: 10,
  };

  return (
    <>
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={task.attachments}
        horizontal
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ gap: 20, paddingHorizontal: 20 }}
        style={{ marginBottom: 20, marginHorizontal: -20 }}
        renderItem={(i) => <TaskAttachmentCard {...i} />}
      />
      <Accordion
        activeSections={activeSections}
        sectionContainerStyle={{
          backgroundColor: theme[3],
          borderRadius: 20,
          overflow: "hidden",
          marginBottom: 15,
        }}
        underlayColor="transparent"
        sections={[
          task.note && {
            trigger: (isActive) => (
              <TaskAttachmentButton defaultView="Note" lockView>
                <ListItemButton variant="filled" disabled>
                  <Icon>sticky_note_2</Icon>
                  <ListItemText primary={task.note} />
                </ListItemButton>
              </TaskAttachmentButton>
            ),
            content: (
              <View style={collapsibleMenuStyles as any}>
                <TaskAttachmentButton defaultView="Note" lockView>
                  <Pressable style={drawerStyles.collapsibleMenuItem}>
                    <IconButton
                      disabled
                      style={{ borderWidth: 1, borderColor: theme[6] }}
                      size={50}
                    >
                      <Icon>edit</Icon>
                    </IconButton>
                    <Text>Edit</Text>
                  </Pressable>
                </TaskAttachmentButton>
                <Pressable style={drawerStyles.collapsibleMenuItem}>
                  <IconButton
                    style={{ borderWidth: 1, borderColor: theme[6] }}
                    size={50}
                  >
                    <Icon>close</Icon>
                  </IconButton>
                  <Text>Remove</Text>
                </Pressable>
              </View>
            ),
          },
          {
            trigger: (isActive) => (
              <ListItemButton variant="filled" disabled>
                <Icon>calendar_today</Icon>
                <ListItemText
                  primary={dayjs(task.due).format("MMM Do, YYYY")}
                  secondary="Does not repeat"
                />
              </ListItemButton>
            ),
            content: (
              <View style={collapsibleMenuStyles as any}>
                <DatePickerModal
                  date={task.due}
                  onDateSelect={handleEditDate}
                  menuRef={dateMenuRef}
                >
                  <Pressable style={drawerStyles.collapsibleMenuItem}>
                    <IconButton
                      disabled
                      style={{ borderWidth: 1, borderColor: theme[6] }}
                      size={50}
                    >
                      <Icon>edit</Icon>
                    </IconButton>
                    <Text>Edit</Text>
                  </Pressable>
                </DatePickerModal>
                <Pressable
                  style={drawerStyles.collapsibleMenuItem}
                  onPress={() =>
                    Toast.show({
                      type: "success",
                      text1: "Coming soon!",
                    })
                  }
                >
                  <IconButton
                    disabled
                    style={{ borderWidth: 1, borderColor: theme[6] }}
                    size={50}
                  >
                    <Icon>autorenew</Icon>
                  </IconButton>
                  <Text>Repeat</Text>
                </Pressable>
                <Pressable style={drawerStyles.collapsibleMenuItem}>
                  <IconButton
                    style={{ borderWidth: 1, borderColor: theme[6] }}
                    size={50}
                  >
                    <Icon>close</Icon>
                  </IconButton>
                  <Text>Remove</Text>
                </Pressable>
              </View>
            ),
          },
          !task.dateOnly && {
            trigger: (isActive) => (
              <ListItemButton style={{ backgroundColor: theme[3] }}>
                <Icon>access_time</Icon>
                <ListItemText primary={dayjs(task.due).format("h:mm A")} />
              </ListItemButton>
            ),
            content: <Text>bruh</Text>,
          },
          task.due && {
            trigger: (isActive) => (
              <ListItemButton style={{ backgroundColor: theme[3] }}>
                <Icon>notifications</Icon>
                <ListItemText
                  primary={`${task.notifications.length} notification${
                    task.notifications.length == 1 ? "" : "s"
                  }`}
                />
              </ListItemButton>
            ),
            content: <Text></Text>,
          },
        ].filter((e) => e)}
        renderHeader={(section, _, isActive) => section.trigger(isActive)}
        renderContent={(section) => section.content}
        onChange={setActiveSections}
      />
      <View style={{ gap: 10 }}>
        <TaskStream>
          <ListItemButton variant="filled">
            <Icon>timeline</Icon>
            <ListItemText
              primary="History"
              secondary={`Last edit ${dayjs(
                task.history[0]?.timestamp
              ).fromNow()}`}
            />
          </ListItemButton>
        </TaskStream>
      </View>
    </>
  );
}
