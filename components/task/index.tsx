import AutoSizeTextArea from "@/ui/AutoSizeTextArea";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Chip from "@/ui/Chip";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
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
import useSWR from "swr";
import { TaskCheckbox } from "./Checkbox";
import Emoji from "@/ui/Emoji";
import { useLabelColors } from "../labels/useLabelColors";
import ListItemText from "@/ui/ListItemText";
import Divider from "@/ui/Divider";
import { LinearGradient } from "expo-linear-gradient";

const styles = StyleSheet.create({
  section: {
    borderRadius: 25,
    overflow: "hidden",
  },
  divider: {
    height: 2,
  },
});

const timelineStyles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    paddingLeft: 10,
    gap: 15,
  },
  dot: {
    borderWidth: 4,
    borderRadius: 99,
    width: 36,
    height: 36,
    marginLeft: -30,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContainer: { flexDirection: "row", gap: 18 },
});

function TaskDetails({ data }) {
  const theme = useColorTheme();

  return (
    <View style={{ gap: 10 }}>
      <ListItemButton style={{ backgroundColor: theme[3] }}>
        <Icon>calendar_today</Icon>
        <ListItemText
          primary={dayjs(data.due).format("MMM Do, YYYY")}
          secondary="Does not repeat"
        />
      </ListItemButton>
      {!data.dateOnly && (
        <ListItemButton style={{ backgroundColor: theme[3] }}>
          <Icon>access_time</Icon>
          <ListItemText primary={dayjs(data.due).format("h:mm A")} />
        </ListItemButton>
      )}
      {data.due && (
        <ListItemButton style={{ backgroundColor: theme[3] }}>
          <Icon>notifications</Icon>
          <ListItemText
            primary={`${data.notifications.length} notification${
              data.notifications.length == 1 ? "" : "s"
            }`}
          />
        </ListItemButton>
      )}
      <TaskStream data={data}>
        <ListItemButton style={{ backgroundColor: theme[3] }}>
          <Icon>change_history</Icon>
          <ListItemText
            primary="History"
            secondary={`Last edit ${dayjs(
              data.history[0]?.timestamp
            ).fromNow()}`}
          />
        </ListItemButton>
      </TaskStream>
    </View>
  );
}

function TaskStream({ children, data }) {
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  const ref = useRef<BottomSheetModal>(null);

  // callbacks
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        snapPoints={width > 600 ? ["90%"] : ["50%", "80%"]}
        onClose={handleClose}
        style={{
          maxWidth: 550,
          margin: "auto",
        }}
        stackBehavior="push"
      >
        <BottomSheetScrollView contentContainerStyle={{ padding: 20 }}>
          <View
            style={{
              paddingTop: 10,
              flexDirection: "row",
              gap: 10,
              width: "100%",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <IconButton
              onPress={handleClose}
              style={{ backgroundColor: theme[3] }}
            >
              <Icon>arrow_back_ios_new</Icon>
            </IconButton>
            <Text style={{ fontSize: 20 }} weight={700}>
              Audit log
            </Text>
          </View>
          <View
            style={{
              paddingLeft: 20,
              paddingTop: 15,
            }}
          >
            <View
              style={[
                timelineStyles.container,
                {
                  borderLeftColor: theme[5],
                },
              ]}
            >
              {data ? (
                data.history.map((audit) => (
                  <View key={audit.id} style={timelineStyles.itemContainer}>
                    <View
                      style={[
                        timelineStyles.dot,
                        {
                          borderColor: theme[1],
                          width: 30,
                          height: 30,
                          position: "relative",
                        },
                      ]}
                    >
                      <ProfilePicture
                        size={30}
                        name={audit.who.profile.name}
                        image={audit.who.profile.picture}
                        style={{
                          borderWidth: 2,
                          borderColor: theme[1],
                        }}
                      />
                      <Avatar
                        size={23}
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          borderWidth: 2,
                          borderColor: theme[1],
                        }}
                      >
                        <Icon
                          style={{ marginTop: -6, marginLeft: -3 }}
                          size={24}
                        >
                          {audit.type === "CREATE"
                            ? "add"
                            : audit.type == "POSTPONE"
                            ? "east"
                            : "edit"}
                        </Icon>
                      </Avatar>
                    </View>
                    <View style={{ flex: 1, paddingTop: 5, paddingBottom: 10 }}>
                      <Text variant="eyebrow">{audit.who.profile.name}</Text>
                      <Text style={{ fontSize: 25 }} weight={700}>
                        {audit.data.replace(" a ", " this ")}
                      </Text>
                      <Text style={{ opacity: 0.6 }}>
                        {dayjs(audit.timestamp).format("MMM Do h:mm A")} &bull;{" "}
                        {dayjs(audit.timestamp).fromNow()}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <ActivityIndicator />
              )}
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
}

function TaskDrawerContent({ data, handleClose }) {
  const theme = useColorTheme();
  const [view, setView] = useState("details");
  const labelColors = useLabelColors();

  return (
    <BottomSheetScrollView stickyHeaderIndices={[0]}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme[2],
          paddingHorizontal: 20,
          height: 60,
          left: 0,
        }}
      >
        <View
          style={{
            paddingTop: 10,
            flexDirection: "row",
            gap: 10,
            width: "100%",
          }}
        >
          <IconButton
            onPress={handleClose}
            style={{ borderWidth: 1, borderColor: theme[6] }}
            size={55}
          >
            <Icon size={28}>close</Icon>
          </IconButton>
          <View style={{ flex: 1 }} />
          <IconButton
            style={{ borderWidth: 1, borderColor: theme[6] }}
            size={55}
          >
            <Icon size={27}>done_outline</Icon>
          </IconButton>
          <IconButton
            style={{ borderWidth: 1, borderColor: theme[6] }}
            size={55}
          >
            <Icon size={27}>delete</Icon>
          </IconButton>
          <IconButton
            style={{ borderWidth: 1, borderColor: theme[6] }}
            size={55}
          >
            <Icon size={27}>edit</Icon>
          </IconButton>
        </View>
      </View>
      <View style={{ paddingBottom: 20, paddingHorizontal: 12 }}>
        <View
          style={{
            paddingHorizontal: 10,
            gap: 10,
            marginTop: 50,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Chip
            icon={<Icon>push_pin</Icon>}
            style={{
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: theme[6],
            }}
          />
          <Chip
            icon={<Icon>new_label</Icon>}
            label="Add label"
            style={{
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: theme[6],
            }}
            {...(data.label && {
              icon: <Emoji emoji={data.label.emoji} />,
              label: (
                <Text style={{ color: labelColors[data.label.color][11] }}>
                  {data.label.name}
                </Text>
              ),
              style: {
                backgroundColor: labelColors[data.label.color][4],
              },
            })}
          />
        </View>
        <AutoSizeTextArea
          inputDefaultValue={data.name}
          inputStyle={{
            fontFamily: "heading",
            color: theme[12],
            paddingHorizontal: 15,
            marginVertical: 10,
            textAlign: "center",
          }}
          fontSize={50}
        />
        <TaskDetails data={data} />
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
    ref.current?.close();
  }, []);

  const trigger = cloneElement(children, { onPress: handleOpen });
  const { width } = useWindowDimensions();
  const theme = useColorTheme();

  // Fetch data
  const { data, error } = useSWR(open ? ["space/entity", { id }] : null);

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        snapPoints={error ? ["50%"] : width > 600 ? [500] : ["65%", "80%"]}
        onClose={handleClose}
        style={{
          maxWidth: 500,
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
  const orange = useColor("orange", useColorScheme() === "dark");

  return (
    <TaskDrawer id={task.id}>
      <ListItemButton
        onLongPress={() => {
          console.log("long press");
        }}
        style={({ pressed }) => ({
          flexShrink: 0,
          paddingHorizontal: 15,
          paddingVertical: 15,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: theme[pressed ? 5 : 4],
          alignItems: "flex-start",
        })}
      >
        <TaskCheckbox completed={task?.completionInstances?.length > 0} />
        <View style={{ gap: 5, paddingTop: 1, flex: 1 }}>
          <Text numberOfLines={1}>{task.name}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
            {task.pinned && (
              <Chip
                dense
                label="Important"
                icon={
                  <Icon size={22} style={{ color: orange[11] }}>
                    priority_high
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
