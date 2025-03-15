import MarkdownRenderer from "@/components/MarkdownRenderer";
import LabelPicker from "@/components/labels/picker";
import { STORY_POINT_SCALE } from "@/constants/workload";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import AutoSizeTextArea from "@/ui/AutoSizeTextArea";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Modal from "@/ui/Modal";
import ModalHeader from "@/ui/ModalHeader";
import SkeletonContainer from "@/ui/Skeleton/container";
import { LinearSkeletonArray } from "@/ui/Skeleton/linear";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Keyboard, Platform, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { useLabelColors } from "../../labels/useLabelColors";
import { AiLabelSuggestion } from "../create";
import { TaskShareButton } from "./TaskShareButton";
import { TaskCompleteButton } from "./attachment/TaskCompleteButton";
import { useTaskDrawerContext } from "./context";
import { TaskDetails } from "./details";

let AutoGrowingTextInput;

if (Platform.OS !== "ios") {
  AutoGrowingTextInput = () => null; // Provide a fallback or use a working alternative.
} else {
  AutoGrowingTextInput =
    require("react-native-autogrow-textinput").AutoGrowingTextInput;
}

function AISubtask({ task, updateTask }) {
  const modalRef = useRef(null);
  const { sessionToken } = useUser();

  const [open, setOpen] = useState(false);
  const [selectedSubtasks, setSelectedSubtasks] = useState([]);
  const [isCreationLoading, setIsCreationLoading] = useState(false);

  const { data, error } = useSWR(
    open
      ? [
          "ai/generate-subtasks",
          {},
          process.env.EXPO_PUBLIC_API_URL,
          {
            method: "POST",
            body: JSON.stringify({ task }),
          },
        ]
      : null,
    { revalidateOnFocus: false }
  );

  const handleAddSubtasks = async () => {
    setIsCreationLoading(true);
    try {
      const subtasks = selectedSubtasks.map((i) => data[i]);

      const t = await sendApiRequest(
        sessionToken,
        "PATCH",
        "space/entity",
        {},
        {
          body: JSON.stringify({
            entities: subtasks.map((subtask) => ({
              name: subtask.title,
              type: "TASK",
              parentTask: task,
              parentId: task.id,
              note: subtask.description,
              collectionId: task.collectionId,
            })),
          }),
        }
      );
      updateTask(
        {
          subtasks: {
            ...task.subtasks,
            ...t.reduce((acc, curr) => {
              acc[curr.id] = curr;
              return acc;
            }, {}),
          },
        },
        false
      );
      modalRef.current?.close();
    } catch (e) {
      Toast.show({ type: "error" });
    } finally {
      setIsCreationLoading(false);
    }
  };

  return (
    <>
      <MenuItem
        onPress={async () => {
          setOpen(true);
          modalRef.current?.present();
        }}
      >
        <Icon>prompt_suggestion</Icon>
        <Text variant="menuItem">Create subtasks</Text>
      </MenuItem>
      <Modal
        maxWidth={400}
        height="auto"
        innerStyles={{
          minHeight: 400,
          flex: Platform.OS === "web" ? 1 : undefined,
        }}
        animation="SCALE"
        transformCenter
        sheetRef={modalRef}
      >
        <ModalHeader title="AI subtasks" />
        <View style={{ flex: 1 }}>
          {data ? (
            <View
              style={{ flex: 1, padding: 10, paddingTop: 0, marginTop: -10 }}
            >
              {data.map((subtask, i) => (
                <ListItemButton
                  key={i}
                  onPress={() => {
                    setSelectedSubtasks((prev) =>
                      prev.includes(i)
                        ? prev.filter((t) => t !== i)
                        : [...prev, i]
                    );
                  }}
                  style={{
                    paddingVertical: 15,
                    paddingHorizontal: 20,
                  }}
                  pressableStyle={{
                    alignItems: "flex-start",
                  }}
                >
                  <Icon
                    filled={selectedSubtasks.includes(i)}
                    style={{ marginTop: 2 }}
                    size={30}
                  >
                    {selectedSubtasks.includes(i) ? "check_circle" : "circle"}
                  </Icon>
                  <ListItemText
                    primary={subtask.title}
                    secondary={subtask.description}
                  />
                </ListItemButton>
              ))}

              <View style={{ padding: 5, marginTop: "auto" }}>
                <Button
                  isLoading={isCreationLoading}
                  onPress={handleAddSubtasks}
                  variant="filled"
                  large
                  bold
                  text={`Add ${selectedSubtasks.length} subtasks`}
                  icon="add"
                />
              </View>
            </View>
          ) : (
            <View
              style={{
                padding: 20,
                paddingTop: 0,
              }}
            >
              {error ? (
                <ErrorAlert />
              ) : (
                <SkeletonContainer>
                  <LinearSkeletonArray
                    animateWidth
                    widths={[90, 70, 68, 82, 71, 62, 83]}
                    height={33}
                  />
                </SkeletonContainer>
              )}
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

function AiExplanation({ task }) {
  const modalRef = useRef(null);
  const { sessionToken } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [generation, setGeneration] = useState([]);

  return (
    <>
      <MenuItem
        onPress={async () => {
          setIsLoading(true);
          modalRef.current?.present();

          await sendApiRequest(
            sessionToken,
            "POST",
            "ai/generate-explanation",
            {},
            { body: JSON.stringify({ task }) }
          )
            .then((data) => {
              setGeneration(data);
              setIsLoading(false);
            })
            .catch(() => {
              setIsLoading(false);
              Toast.show({ type: "error" });
            });
        }}
      >
        <Icon>lightbulb</Icon>
        <Text variant="menuItem">Describe</Text>
      </MenuItem>
      <Modal
        maxWidth={400}
        height="auto"
        innerStyles={{
          minHeight: Platform.OS === "web" ? 200 : 400,
          flex: Platform.OS === "web" ? 1 : undefined,
        }}
        animation="SCALE"
        transformCenter
        sheetRef={modalRef}
      >
        <ModalHeader title="AI Explanation" />
        <View style={{ flex: 1 }}>
          {!isLoading ? (
            <ScrollView
              style={{ flex: 1, padding: 20, paddingTop: 0, marginTop: -10 }}
            >
              <MarkdownRenderer>{generation}</MarkdownRenderer>
            </ScrollView>
          ) : (
            <View
              style={{
                padding: 20,
                paddingTop: 0,
              }}
            >
              <SkeletonContainer>
                <LinearSkeletonArray
                  animateWidth
                  widths={[90, 70, 68, 20, 40, 41, 82, 71, 62, 83]}
                  height={20}
                />
              </SkeletonContainer>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

function TaskNameInput() {
  const breakpoints = useResponsiveBreakpoints();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();
  const theme = useColorTheme();
  const [name, setName] = useState(task.name);
  const inputRef = useRef(null);

  useEffect(() => {
    // on keyboard close, blur the input
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        inputRef.current?.blur();
      }
    );
    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  const GrowingTextInput =
    Platform.OS === "ios" ? AutoGrowingTextInput : AutoSizeTextArea;

  return (
    <>
      <GrowingTextInput
        selectionColor={theme[11]}
        ref={inputRef}
        onBlur={() => {
          if (name === task.name) return;
          setName(name.replaceAll("\n", ""));
          updateTask({ name: name.replaceAll("\n", "") });
        }}
        onChangeText={(text) => setName(text)}
        enterKeyHint="done"
        value={name}
        bounces={false}
        onKeyPress={(e) => {
          if (e.nativeEvent.key === "Enter" || e.nativeEvent.key === "Escape") {
            e.preventDefault();
            e.target.blur();
          }
        }}
        disabled={isReadOnly}
        style={[
          {
            fontFamily: "serifText800",
            color: theme[12],
            padding: 12,
            paddingVertical: 10,
            borderRadius: 20,
            borderWidth: 2,
            shadowRadius: 0,
            borderColor: "transparent",
          },
        ]}
        fontSize={breakpoints.md ? 35 : 30}
      />
    </>
  );
}

function WorkloadChip() {
  const theme = useColorTheme();
  const { task, isReadOnly, updateTask } = useTaskDrawerContext();
  const complexityScale = ["XS", "S", "M", "L", "XL"];
  const menuRef = useRef(null);

  return (
    !(isReadOnly && !task.storyPoints) && (
      <MenuPopover
        menuRef={menuRef}
        containerStyle={{ width: 200 }}
        options={
          [
            ...complexityScale.map((n) => ({
              renderer: () => (
                <MenuItem
                  onPress={() => {
                    updateTask({ storyPoints: n });
                    menuRef.current?.close();
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      backgroundColor: addHslAlpha(
                        theme[11],
                        n === task.storyPoints ? 1 : 0.1
                      ),
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "mono",
                        color: theme[n === task.storyPoints ? 1 : 11],
                      }}
                    >
                      {n}
                    </Text>
                  </View>
                  <Text variant="menuItem">
                    {
                      STORY_POINT_SCALE[
                        complexityScale.findIndex((i) => i === n)
                      ]
                    }
                  </Text>
                </MenuItem>
              ),
            })),
            task.storyPoints && { divider: true },
            task.storyPoints && {
              renderer: () => (
                <MenuItem
                  onPress={() => {
                    updateTask({ storyPoints: null });
                    menuRef.current?.close();
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      backgroundColor: addHslAlpha(theme[11], 0.1),
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon style={{ color: theme[11] }}>remove</Icon>
                  </View>
                  <Text variant="menuItem">Clear</Text>
                </MenuItem>
              ),
            },
          ] as any
        }
        trigger={
          <Chip
            disabled={isReadOnly}
            icon="exercise"
            label={
              STORY_POINT_SCALE[
                complexityScale.findIndex((i) => i === task.storyPoints)
              ]
            }
            style={{
              borderRadius: 10,
              borderWidth: 1,
            }}
            outlined
          />
        }
      />
    )
  );
}

function TaskMoreMenu({ handleDelete }) {
  const theme = useColorTheme();
  const { session } = useUser();
  const { task } = useTaskDrawerContext();

  return (
    <>
      <MenuPopover
        options={[
          session?.user?.betaTester && {
            icon: "content_copy",
            text: "Duplicate",
            callback: () => {},
          },
          {
            icon: task.trash ? "restore_from_trash" : "delete",
            text: task.trash ? "Restore from trash" : "Move to trash",
            callback: handleDelete,
          },
          task?.integrationParams && {
            renderer: () => (
              <Text
                style={{
                  opacity: 0.6,
                  fontSize: 12,
                  textAlign: "center",
                  marginVertical: 5,
                  color: theme[11],
                }}
              >
                {`Synced with ${
                  task?.integrationParams?.from || "integration"
                }`}
              </Text>
            ),
          },
        ]}
        trigger={<IconButton icon="pending" size={45} />}
      />
    </>
  );
}

function AICategorizer({ task, updateTask }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  const handleCreate = () => {
    setOpen(true);
    ref.current.present();
  };

  const { data, error } = useSWR(
    !open
      ? null
      : [
          "ai/categorize-tasks",
          {},
          process.env.EXPO_PUBLIC_API_URL,
          {
            method: "POST",
            body: JSON.stringify({ task }),
          },
        ],
    { revalidateOnFocus: false }
  );

  return (
    <>
      <MenuItem text="Categorize" icon="category" onPress={handleCreate} />
      <Modal animation="SCALE" sheetRef={ref} maxWidth={400} height="auto">
        <ModalHeader title="AI Sorting" />
        {data ? (
          <View
            style={{
              padding: 20,
              paddingHorizontal: 10,
              paddingTop: 0,
              marginTop: -10,
            }}
          >
            <ListItemButton>
              <Emoji emoji={data.label?.emoji} size={30} />
              <ListItemText primary="Label" secondary={data.label?.name} />
            </ListItemButton>
            <ListItemButton>
              <Avatar icon="priority_high" />
              <ListItemText
                primary="Urgency"
                secondary={data.pinned ? "Urgent" : "Normal"}
              />
            </ListItemButton>
            <ListItemButton>
              <Avatar icon="exercise" />
              <ListItemText
                primary={`Complexity`}
                secondary={`${data.storyPoints} - ${data.storyPointReason}`}
              />
            </ListItemButton>

            <Button
              onPress={() =>
                updateTask({
                  label: data.label,
                  pinned: data.pinned,
                  storyPoints: data.storyPoints,
                  storyPointReason: data.storyPointReason,
                })
              }
              text="Apply changes"
              variant="filled"
              bold
              large
              iconPosition="end"
              icon="east"
              containerStyle={{ marginTop: 10, marginHorizontal: 10 }}
            />
          </View>
        ) : (
          <View
            style={{
              padding: 20,
              paddingTop: 0,
            }}
          >
            {error ? (
              <ErrorAlert />
            ) : (
              <SkeletonContainer>
                <LinearSkeletonArray
                  animateWidth
                  widths={[90, 70, 68, 82]}
                  height={50}
                />
              </SkeletonContainer>
            )}
          </View>
        )}
      </Modal>
    </>
  );
}

function TaskSidekickMenu() {
  const { task, updateTask } = useTaskDrawerContext();
  return (
    <MenuPopover
      containerStyle={{ width: 200 }}
      trigger={<IconButton icon="raven" size={45} />}
      options={[
        {
          renderer: () => <AiExplanation task={task} updateTask={updateTask} />,
        },
        {
          renderer: () => <AISubtask task={task} updateTask={updateTask} />,
        },
        {
          renderer: () => <AICategorizer task={task} updateTask={updateTask} />,
        },
      ]}
    />
  );
}

export function TaskDrawerContent({
  handleClose,
  forceClose,
}: {
  handleClose: () => void;
  forceClose?: (config?: any) => void;
}) {
  const { session } = useUser();
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const labelColors = useLabelColors();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();
  const { id: collectionId } = useGlobalSearchParams();
  const rotate = useSharedValue(task.pinned ? -35 : 0);
  const labelPickerRef = useRef(null);
  const SafeScrollView = forceClose ? BottomSheetScrollView : ScrollView;

  const handlePriorityChange = useCallback(() => {
    impactAsync(ImpactFeedbackStyle.Light);
    rotate.value = withSpring(!task.pinned ? -35 : 0, {
      mass: 1,
      damping: 10,
      stiffness: 200,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 2,
    });
    updateTask({ pinned: !task.pinned });
  }, [task.pinned, updateTask, rotate]);

  const handleDelete = useCallback(
    async (d) => {
      try {
        const t = typeof d === "boolean" ? d : !task.trash;
        updateTask({ trash: t });
        Toast.show({
          type: "success",
          text1: t ? "Task deleted!" : "Task restored!",

          props: {
            renderTrailingIcon: !t
              ? null
              : () => (
                  <IconButton
                    icon="undo"
                    size={40}
                    style={{
                      marginRight: 5,
                      marginLeft: -10,
                    }}
                    backgroundColors={{
                      default: theme[5],
                      hovered: theme[6],
                      pressed: theme[7],
                    }}
                    onPress={() => handleDelete(false)}
                  />
                ),
          },
        });
      } catch (e) {
        Toast.show({
          type: "error",
          text1: "Something went wrong. Please try again later",
        });
      }
    },
    [updateTask, task, theme]
  );

  useHotkeys(["delete", "backspace"], () => handleDelete(true));
  useHotkeys(["shift+1"], () => handlePriorityChange());
  useHotkeys(["shift+3"], () => labelPickerRef.current?.present());

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
          paddingTop: 10,
        }}
      >
        <View
          style={{
            paddingTop: isReadOnly ? 10 : breakpoints.md ? 20 : 10,
            flexDirection: "row",
            gap: 10,
            width: "100%",
          }}
        >
          {forceClose && (
            <IconButton
              onPress={() => {
                handleClose();
                forceClose(
                  breakpoints.md
                    ? undefined
                    : { overshootClamping: true, stiffness: 400 }
                );
              }}
              size={45}
              variant={breakpoints.md ? "outlined" : "text"}
              icon={breakpoints.md ? "close" : "west"}
            />
          )}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            {!isReadOnly && <TaskMoreMenu handleDelete={handleDelete} />}
            {session?.user?.betaTester && !isReadOnly && <TaskSidekickMenu />}
            {!task.parentTaskId && <TaskShareButton />}
            {!isReadOnly && <TaskCompleteButton />}
          </View>
        </View>
      </View>
      <LinearGradient
        colors={[theme[2], addHslAlpha(theme[2], 0)]}
        style={{
          height: 40,
          width: "100%",
          marginBottom: -28,
          zIndex: 1,
        }}
      />
      <KeyboardAvoidingView behavior="height">
        <SafeScrollView
          showsHorizontalScrollIndicator={false}
          style={{
            maxHeight: Dimensions.get("window").height - 200,
          }}
          onScrollBeginDrag={Keyboard.dismiss}
        >
          <View
            style={{
              paddingBottom: breakpoints.md ? 30 : 22,
              paddingTop: breakpoints.md ? 30 : 20,
              paddingHorizontal: breakpoints.md ? 30 : 17,
            }}
          >
            <ScrollView
              horizontal
              contentContainerStyle={{
                gap: 10,
                paddingHorizontal: 45,
              }}
              style={{ marginHorizontal: -30 }}
              showsHorizontalScrollIndicator={false}
            >
              <Chip
                disabled={isReadOnly}
                onPress={handlePriorityChange}
                icon={
                  <Animated.View style={rotateStyle}>
                    <Icon
                      filled={task.pinned}
                      style={{
                        ...(task.pinned
                          ? { color: labelColors.orange[3] }
                          : {}),
                      }}
                    >
                      push_pin
                    </Icon>
                  </Animated.View>
                }
                outlined
                style={{
                  borderRadius: 10,
                  borderWidth: 1,
                  ...(task.pinned && { borderColor: labelColors.orange[11] }),
                  backgroundColor: task.pinned
                    ? labelColors.orange[11]
                    : undefined,
                }}
              />
              {task && !task.parentTaskId && (
                <LabelPicker
                  label={task.label}
                  setLabel={(e: any) => {
                    updateTask(
                      {
                        labelId: e.id,
                        label: e,
                      },
                      false
                    );
                  }}
                  onClose={() => {}}
                  sheetProps={{ sheetRef: labelPickerRef }}
                  defaultCollection={collectionId as any}
                >
                  <Chip
                    disabled={isReadOnly}
                    icon={
                      task?.collection?.emoji ? (
                        <Emoji emoji={task?.collection?.emoji} size={20} />
                      ) : (
                        <Icon>new_label</Icon>
                      )
                    }
                    label={task?.collection?.name || "Add label"}
                    outlined
                    style={{
                      borderRadius: 10,
                      borderWidth: 1,
                    }}
                    {...(task.label && {
                      icon: <Emoji emoji={task.label.emoji} size={20} />,
                      label: (
                        <Text
                          style={{ color: labelColors[task.label.color][11] }}
                        >
                          {task.label.name}
                        </Text>
                      ),
                    })}
                  />
                </LabelPicker>
              )}
              {!task.parentTaskId && <WorkloadChip />}

              {task && !task.label && task.collectionId && (
                <AiLabelSuggestion
                  watch={(key) => task[key]}
                  setValue={(key, value) => {
                    if (key === "label")
                      updateTask({ label: value, labelId: value.id });
                  }}
                  style={{
                    borderColor: addHslAlpha(theme[11], 0.2),
                    borderWidth: 2,
                    margin: -0.5,
                    marginLeft: 1,
                    borderRadius: 10,
                  }}
                />
              )}
            </ScrollView>
            <TaskNameInput />
            <TaskDetails />
          </View>
        </SafeScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

