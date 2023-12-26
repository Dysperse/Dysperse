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
  return (
    <>
      <Text>{JSON.stringify(data)}</Text>
    </>
  );
}

function TaskStream({ data }) {
  const theme = useColorTheme();
  return (
    <View style={{ paddingLeft: 20, paddingTop: 15 }}>
      <View
        style={[
          timelineStyles.container,
          {
            borderLeftColor: theme[5],
          },
        ]}
      >
        {data.history.map((audit) => (
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
                <Icon style={{ marginTop: -6, marginLeft: -3 }} size={24}>
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
        ))}
      </View>
    </View>
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
          backgroundColor: theme[1],
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
            style={{ backgroundColor: theme[3] }}
          >
            <Icon>close</Icon>
          </IconButton>
          <View style={{ flex: 1 }} />
          <IconButton style={{ backgroundColor: theme[3] }}>
            <Icon>dark_mode</Icon>
          </IconButton>
          <IconButton
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
        <View style={{ gap: 10, marginVertical: 20, flexDirection: "row" }}>
          <Chip icon={<Icon filled={data.pinned}>push_pin</Icon>} />
          <Chip
            icon={<Icon>label</Icon>}
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
          <Chip label={dayjs(data.due).format("MMM Do, YYYY")} />
        </View>
        <AutoSizeTextArea
          inputDefaultValue={data.name}
          inputStyle={{
            fontFamily: "heading",
            color: theme[12],
          }}
          fontSize={50}
        />
        <ButtonGroup
          containerStyle={{
            marginVertical: 10,
            padding: 0,
            borderRadius: 0,
            gap: 0,
            backgroundColor: "transparent",
          }}
          buttonStyle={{
            borderRadius: 0,
            backgroundColor: "transparent",
            borderBottomWidth: 2,
            borderColor: theme[5],
            flex: null,
            paddingVertical: 7,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
          }}
          selectedButtonStyle={{
            borderBottomColor: theme[9],
            backgroundColor: theme[3],
          }}
          buttonTextStyle={{
            fontSize: 15,
            color: theme[12],
          }}
          selectedButtonTextStyle={{
            color: theme[11],
          }}
          options={[
            { label: "Details", value: "details" },
            { label: "Subtasks", value: "subtasks" },
            { label: "Stream", value: "stream" },
          ]}
          state={[view, setView]}
        />

        {view === "details" && <TaskDetails data={data} />}
        {view === "stream" && <TaskStream data={data} />}

        <View
          style={[styles.section, { backgroundColor: theme[3], marginTop: 20 }]}
        >
          <Button>
            <ButtonText>Move to trash</ButtonText>
          </Button>
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
  const { data, error } = useSWR(["space/entity", { id }]);

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
        <View style={{ gap: 5, paddingTop: 1 }}>
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
