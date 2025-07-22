import MarkdownRenderer from "@/components/MarkdownRenderer";
import { AttachStep, OnboardingContainer } from "@/context/OnboardingProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import { GrowingTextInput } from "@/ui/GrowingTextInput";
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
import { addHslAlpha, useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { setStringAsync } from "expo-clipboard";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { shareAsync } from "expo-sharing";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { useDebounce } from "use-debounce";
import { TaskCompleteButton } from "./TaskCompleteButton";
import { TaskAttachmentPicker } from "./attachment-picker";
import { useTaskDrawerContext } from "./context";
import { TaskDetails } from "./details";

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

export function TaskNameInput({ fullscreen }: { fullscreen }) {
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

  const [debouncedName] = useDebounce(name, 300);

  const handleSave = () => {
    fullscreen.value = 0;
    if (name === task.name) return;
    console.log("saved");
    setName(name.replaceAll("\n", ""));
    updateTask({ name: name.replaceAll("\n", "") });
  };
  useEffect(() => {
    // growing text input has a weird bug
    if (Platform.OS !== "ios") handleSave();
  }, [debouncedName]);

  return (
    <>
      <GrowingTextInput
        selectionColor={theme[11]}
        ref={inputRef}
        onBlur={handleSave}
        onChangeText={(text) => setName(text)}
        blurOnSubmit
        enterKeyHint="done"
        defaultValue={name}
        bounces={false}
        onKeyPress={(e) => {
          if (e.nativeEvent.key === "Enter" || e.nativeEvent.key === "Escape") {
            e.preventDefault();
            e.target.blur();
          }
        }}
        disabled={isReadOnly}
        scrollEnabled={false}
        onFocus={() => (fullscreen.value = 1)}
        style={[
          {
            fontFamily: "serifText700",
            color: theme[11],
            padding: 12,
            paddingVertical: 0,
            marginTop: 10,
            marginBottom: 3,
            borderRadius: 20,
            borderWidth: 2,
            shadowRadius: 0,
            borderColor: "transparent",
          },
        ]}
        fontSize={35}
      />
    </>
  );
}

function TaskMoreMenu({ handleDelete }) {
  const theme = useColorTheme();
  const { session } = useUser();
  const { task, updateTask } = useTaskDrawerContext();

  return (
    <AttachStep index={2} style={{ flex: 1 }}>
      <MenuPopover
        menuProps={{ rendererProps: { placement: "top" } }}
        options={[
          {
            icon: task.trash ? "restore_from_trash" : "delete",
            text: task.trash ? "Restore from trash" : "Delete",
            callback: handleDelete,
          },
          session?.user?.betaTester && {
            icon: "content_copy",
            text: "Duplicate",
            callback: () => Toast.show({ type: "info", text1: "Coming soon!" }),
          },
          {
            icon: "ios_share",
            text: "Share",
            callback: () => {
              impactAsync(ImpactFeedbackStyle.Heavy);
              const link = `https://dys.us.to/${task.shortId || task.id}`;

              setStringAsync(link);
              shareAsync(link, { dialogTitle: "Dysperse" });
              if (Platform.OS === "web")
                Toast.show({
                  type: "success",
                  text1: "Copied link to clipboard!",
                });

              updateTask({ published: true });
            },
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
        containerStyle={{ marginLeft: 27, width: 150 }}
        trigger={
          <Button
            large
            onPress={() => {
              impactAsync(ImpactFeedbackStyle.Heavy);
            }}
            icon="pending"
            backgroundColors={{
              default: addHslAlpha(theme[11], 0.1),
              hovered: addHslAlpha(theme[11], 0.2),
              pressed: addHslAlpha(theme[11], 0.3),
            }}
          />
        }
      />
    </AttachStep>
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
                primary={"Complexity"}
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

function TaskHome({ labelPickerRef, forceClose, fullscreen }) {
  const breakpoints = useResponsiveBreakpoints();
  const SafeScrollView = forceClose ? BottomSheetScrollView : ScrollView;

  const barStyle = useAnimatedStyle(() => ({
    opacity: withSpring(fullscreen.value === 1 ? 0.4 : 1),
    pointerEvents: fullscreen.value === 1 ? "none" : "auto",
  }));

  return (
    <SafeScrollView
      showsHorizontalScrollIndicator={false}
      style={{
        maxHeight: Dimensions.get("window").height - 300,
      }}
      onScrollBeginDrag={Keyboard.dismiss}
    >
      <View
        style={{
          paddingHorizontal: 15,
          paddingTop: breakpoints.md ? 20 : 35,
          paddingBottom: 10,
        }}
      >
        <TaskNameInput fullscreen={fullscreen} />
        <Animated.View style={[barStyle]}>
          <TaskDetails labelPickerRef={labelPickerRef} />
        </Animated.View>
      </View>
    </SafeScrollView>
  );
}

function TaskPinButton() {
  const { task, updateTask } = useTaskDrawerContext();
  const rotate = useSharedValue(task.pinned ? -35 : 0);
  const orange = useColor("tomato");

  const theme = useColorTheme();

  const handlePriorityChange = useCallback(() => {
    if (Platform.OS !== "web") impactAsync(ImpactFeedbackStyle.Light);
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

  useHotkeys(["shift+1"], () => handlePriorityChange());

  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotate.value}deg` }],
    };
  });

  return (
    <View style={{ flex: 1 }}>
      <Button
        large
        onPress={handlePriorityChange}
        icon={
          <Animated.View style={rotateStyle}>
            <Icon
              filled={task.pinned}
              style={task.pinned ? { color: orange[11] } : {}}
            >
              push_pin
            </Icon>
          </Animated.View>
        }
        backgroundColors={
          task.pinned
            ? {
                default: addHslAlpha(orange[11], 0.2),
                hovered: addHslAlpha(orange[11], 0.3),
                pressed: addHslAlpha(orange[11], 0.4),
              }
            : {
                default: addHslAlpha(theme[11], 0.1),
                hovered: addHslAlpha(theme[11], 0.2),
                pressed: addHslAlpha(theme[11], 0.3),
              }
        }
        style={task.pinned && { borderColor: orange[11] }}
      />
    </View>
  );
}

export function TaskDrawerContent({
  forceClose,
}: {
  forceClose?: (config?: any) => void;
}) {
  const theme = useColorTheme();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();
  const labelPickerRef = useRef(null);

  const [view, setView] = useState<"HOME" | "ATTACH">("HOME");

  const fullscreen = useSharedValue(0);

  const barStyle = useAnimatedStyle(() => ({
    opacity: withSpring(fullscreen.value === 1 ? 0.4 : 1),
    pointerEvents: fullscreen.value === 1 ? "none" : "auto",
  }));

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
        forceClose();
      } catch (e) {
        Toast.show({
          type: "error",
          text1: "Something went wrong. Please try again later",
        });
      }
    },
    [updateTask, task, theme, forceClose]
  );

  useHotkeys(["delete", "backspace"], () => handleDelete(true));
  useHotkeys(["shift+3"], () => labelPickerRef.current?.present());

  return (
    <>
      <OnboardingContainer
        delay={1000}
        id="TASK_DRAWER"
        onlyIf={() => true}
        steps={[
          {
            text: "Set a due date for your task",
          },
          {
            text: "Categorize your task with a label",
          },
          {
            text: "Tap and hold to instantly share with others",
          },
          {
            text: "You can double tap on any task to create a subtask",
          },
          {
            text: "Mark your task as done!",
          },
        ]}
      >
        {() => (
          <>
            <KeyboardAvoidingView behavior="height">
              {view === "HOME" ? (
                <TaskHome
                  fullscreen={fullscreen}
                  forceClose={forceClose}
                  labelPickerRef={labelPickerRef}
                />
              ) : (
                <TaskAttachmentPicker
                  handleBack={() => setView("HOME")}
                  forceClose={forceClose}
                />
              )}
              {!isReadOnly && (
                <View onTouchStart={Keyboard.dismiss}>
                  <Animated.View
                    style={[
                      barStyle,
                      {
                        padding: 20,
                        flexDirection: "row",
                        gap: 5,
                        height: 90,
                        flexShrink: 0,
                      },
                    ]}
                  >
                    {view === "HOME" && (
                      <TaskMoreMenu handleDelete={handleDelete} />
                    )}
                    <AttachStep index={3} style={{ flex: 1 }}>
                      <Button
                        large
                        icon={view === "HOME" ? "note_stack_add" : "west"}
                        onPress={() => {
                          impactAsync(ImpactFeedbackStyle.Heavy);
                          setView((t) => (t === "HOME" ? "ATTACH" : "HOME"));
                        }}
                        bold={view === "ATTACH"}
                        variant="filled"
                        text={view === "HOME" ? undefined : "Attach"}
                        iconPosition={view === "ATTACH" ? "start" : "end"}
                        containerStyle={{
                          flex: 1,
                          marginRight: view === "ATTACH" ? "auto" : undefined,
                        }}
                        style={view === "ATTACH" && { marginHorizontal: 5 }}
                        backgroundColors={{
                          default: addHslAlpha(theme[11], 0.1),
                          hovered: addHslAlpha(theme[11], 0.2),
                          pressed: addHslAlpha(theme[11], 0.3),
                        }}
                      />
                    </AttachStep>
                    {view === "HOME" && <TaskPinButton />}
                    {view === "HOME" && <TaskCompleteButton />}
                  </Animated.View>
                </View>
              )}
            </KeyboardAvoidingView>
          </>
        )}
      </OnboardingContainer>
    </>
  );
}

