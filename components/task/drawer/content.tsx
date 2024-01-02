import { LabelPicker } from "@/components/labels/picker";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import AutoSizeTextArea from "@/ui/AutoSizeTextArea";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { Menu } from "@/ui/Menu";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import React, {
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Keyboard, Pressable, View, useColorScheme } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { useLabelColors } from "../../labels/useLabelColors";
import { styles } from "../create/styles";
import { useTaskDrawerContext } from "./context";
import { TaskDetails } from "./details";
import { Controller, useForm } from "react-hook-form";
import { useSession } from "@/context/AuthProvider";

function TaskCompleteButton() {
  const theme = useColorTheme();
  const { sessionToken } = useUser();
  const { task, updateTask, mutateList } = useTaskDrawerContext();
  const green = useColor("green", useColorScheme() == "dark");
  const isCompleted = task.completionInstances.length > 0;
  const [isLoading, setIsLoading] = useState(false);
  const { animatedIndex } = useBottomSheet();

  const handlePress = async () => {
    // setIsLoading(true);
    const newArr = isCompleted ? [] : [...task.completionInstances, true];
    updateTask("completionInstances", newArr, false);
    await sendApiRequest(
      sessionToken,
      isCompleted ? "DELETE" : "POST",
      "space/entity/complete-task",
      {},
      {
        body: JSON.stringify({
          id: task.id,
          recurring: false,
        }),
      }
    );
    if (animatedIndex.value === -1) {
      mutateList({
        ...task,
        completionInstances: newArr,
      });
    }
    // setIsLoading(false);
  };

  return (
    <>
      <IconButton
        style={({ pressed, hovered }) => ({
          borderWidth: 1,
          borderColor: isCompleted
            ? green[pressed ? 8 : hovered ? 7 : 6]
            : theme[pressed ? 8 : hovered ? 7 : 6],
          backgroundColor: isCompleted
            ? green[pressed ? 6 : hovered ? 5 : 4]
            : theme[pressed ? 4 : hovered ? 3 : 2],
        })}
        size={55}
        onPress={handlePress}
      >
        {isLoading ? (
          <Spinner color={isCompleted ? green[11] : theme[11]} />
        ) : (
          <Icon
            size={27}
            style={{
              color: isCompleted ? green[11] : theme[11],
            }}
          >
            done_outline
          </Icon>
        )}
      </IconButton>
    </>
  );
}

function TaskNameInput() {
  const { task, updateTask } = useTaskDrawerContext();
  const theme = useColorTheme();
  const [name, setName] = useState(task.name);

  return (
    <AutoSizeTextArea
      onBlur={(e) => {
        if (name === task.name) return;
        updateTask("name", name);
      }}
      onChangeText={(text) => setName(text.replaceAll("\n", ""))}
      value={name}
      style={{
        fontFamily: "heading",
        color: theme[12],
        paddingHorizontal: 20,
        marginVertical: 20,
        textAlign: "center",
      }}
      fontSize={50}
    />
  );
}

function TaskLocationPicker({ updateTask, task, children }) {
  const trigger = cloneElement(children);
  const menuRef = useRef<BottomSheetModal>(null);
  const theme = useColorTheme();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      location: "",
    },
  });

  const { session } = useSession();

  const onSubmit = useCallback(
    async (values) => {
      try {
        Keyboard.dismiss();
        setIsLoading(true);
        const d = await sendApiRequest(
          session,
          "POST",
          "space/entity/attachments",
          {},
          {
            body: JSON.stringify({
              id: task.id,
              type: "LOCATION",
              data: values.location,
            }),
          }
        );
        updateTask("attachments", [...task.attachments, d], false);
        setIsLoading(false);
      } catch {
        setIsLoading(false);
        Toast.show({
          type: "error",
          text1: "Something went wrong. Please try again later",
        });
      }
    },
    [session, task, updateTask]
  );

  useEffect(() => {
    if (errors.location) {
      Toast.show({
        type: "error",
        text1: "Please enter a location",
      });
    }
  }, [errors.location]);

  return (
    <Menu
      height={[250]}
      trigger={trigger}
      stackBehavior="replace"
      menuRef={menuRef}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          gap: 20,
        }}
      >
        <IconButton onPress={() => menuRef.current.close()}>
          <Icon>arrow_back_ios_new</Icon>
        </IconButton>
        <Text weight={700} style={{ fontSize: 23 }}>
          Location
        </Text>
      </View>
      <View style={{ padding: 20, gap: 10 }}>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              bottomSheet
              placeholder="Enter a location"
              variant="filled"
              style={{
                paddingHorizontal: 25,
                paddingVertical: 15,
                fontSize: 20,
              }}
              autoFocus
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
          name="location"
        />
        <Button
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          style={({ pressed, hovered }: any) => ({
            borderRadius: 25,
            padding: 10,
            backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
            width: "100%",
          })}
        >
          <ButtonText>Done</ButtonText>
        </Button>
      </View>
    </Menu>
  );
}

function TaskAttachmentButton() {
  const menuRef = useRef<BottomSheetModal>(null);
  const theme = useColorTheme();
  const { task, updateTask } = useTaskDrawerContext();

  const handleClose = useCallback(() => menuRef.current?.close(), [menuRef]);

  const taskMenuCardStyle = ({ pressed, hovered }: any) => [
    styles.attachmentCard,
    { backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3] },
  ];

  return (
    <Menu
      menuRef={menuRef}
      height={[400]}
      width={400}
      trigger={
        <IconButton style={{ borderWidth: 1, borderColor: theme[6] }} size={55}>
          <Icon size={27}>edit</Icon>
        </IconButton>
      }
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          gap: 20,
        }}
      >
        <IconButton onPress={() => menuRef.current.close()} variant="filled">
          <Icon>close</Icon>
        </IconButton>
        <Text weight={700} style={{ fontSize: 23 }}>
          Add
        </Text>
      </View>
      <View style={styles.gridRow}>
        <TaskLocationPicker task={task} updateTask={updateTask}>
          <Pressable onPress={handleClose} style={taskMenuCardStyle}>
            <Avatar size={45}>
              <Icon style={{ transform: [{ rotate: "-45deg" }] }}>
                attachment
              </Icon>
            </Avatar>
            <Text style={styles.attachmentCardText}>Location</Text>
          </Pressable>
        </TaskLocationPicker>
        <Pressable onPress={handleClose} style={taskMenuCardStyle}>
          <Avatar size={45}>
            <Icon>link</Icon>
          </Avatar>
          <Text style={styles.attachmentCardText}>Link</Text>
        </Pressable>
      </View>
      <View style={styles.gridRow}>
        <Pressable onPress={handleClose} style={taskMenuCardStyle}>
          <Avatar size={45}>
            <Icon>sticky_note_2</Icon>
          </Avatar>
          <Text style={styles.attachmentCardText}>Note</Text>
        </Pressable>
        <Pressable onPress={handleClose} style={taskMenuCardStyle}>
          <Avatar size={45}>
            <Icon>cloud</Icon>
          </Avatar>
          <Text style={styles.attachmentCardText}>Image</Text>
        </Pressable>
      </View>
    </Menu>
  );
}

export function TaskDrawerContent({ handleClose }) {
  const theme = useColorTheme();
  const labelColors = useLabelColors();
  const { task, updateTask, mutateList } = useTaskDrawerContext();

  const rotate = useSharedValue(task.pinned ? -35 : 0);

  const handlePriorityChange = useCallback(() => {
    rotate.value = withSpring(!task.pinned ? -35 : 0, {
      mass: 1,
      damping: 10,
      stiffness: 200,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 2,
    });
    updateTask("pinned", !task.pinned);
  }, [task.pinned, updateTask, rotate]);

  const handleDelete = useCallback(async () => {
    try {
      updateTask("trash", true);
      handleClose();
      setImmediate(async () => {
        mutateList({ ...task, trash: true });
        Toast.show({
          type: "success",
          text1: "Task deleted!",
        });
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later",
      });
    }
  }, [handleClose, updateTask, mutateList, task]);

  // Rotate the pin icon by 45 degrees if the task is pinned using react-native-reanimated
  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotate.value}deg`,
        },
      ],
    };
  });

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme[2],
          paddingHorizontal: 20,
          left: 0,
          paddingBottom: 10,
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
          <TaskCompleteButton />
          <IconButton
            style={{ borderWidth: 1, borderColor: theme[6] }}
            size={55}
            onPress={handleDelete}
          >
            <Icon size={27}>delete</Icon>
          </IconButton>
          <TaskAttachmentButton />
        </View>
      </View>
      <BottomSheetScrollView>
        <View style={{ paddingBottom: 20, paddingHorizontal: 12 }}>
          <View
            style={{
              paddingHorizontal: 10,
              gap: 10,
              marginTop: 30,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Chip
              onPress={handlePriorityChange}
              icon={
                <Animated.View style={rotateStyle}>
                  <Icon
                    filled={task.pinned}
                    style={{
                      ...(task.pinned ? { color: labelColors.orange[3] } : {}),
                    }}
                  >
                    push_pin
                  </Icon>
                </Animated.View>
              }
              style={{
                backgroundColor: task.pinned
                  ? labelColors.orange[11]
                  : "transparent",
                borderWidth: 1,
                borderColor: task.pinned ? labelColors.orange[3] : theme[6],
              }}
            />
            <LabelPicker
              label={task.labelId}
              setLabel={(e) => {
                updateTask("labelId", e.id);
                updateTask("label", e, false);
              }}
              onClose={() => {}}
              autoFocus={false}
            >
              <Chip
                icon={<Icon>new_label</Icon>}
                label="Add label"
                style={({ pressed }) => ({
                  backgroundColor: theme[pressed ? 4 : 2],
                  borderWidth: 1,
                  borderColor: theme[6],
                })}
                {...(task.label && {
                  icon: <Emoji emoji={task.label.emoji} />,
                  label: (
                    <Text style={{ color: labelColors[task.label.color][11] }}>
                      {task.label.name}
                    </Text>
                  ),
                  style: {
                    backgroundColor: labelColors[task.label.color][5],
                  },
                })}
              />
            </LabelPicker>
          </View>
          <TaskNameInput />
          <TaskDetails />
        </View>
      </BottomSheetScrollView>
    </>
  );
}
