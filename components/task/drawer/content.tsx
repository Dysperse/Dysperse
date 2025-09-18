import { AttachStep, OnboardingContainer } from "@/context/OnboardingProvider";
import { useUser } from "@/context/useUser";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import DropdownMenu from "@/ui/DropdownMenu";
import { GrowingTextInput } from "@/ui/GrowingTextInput";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { addHslAlpha, useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { showErrorToast } from "@/utils/errorToast";
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
import { toast } from "sonner-native";
import { useDebounce } from "use-debounce";
import { TaskCompleteButton } from "./TaskCompleteButton";
import { TaskAttachmentPicker } from "./attachment-picker";
import { useTaskDrawerContext } from "./context";
import { TaskDetails } from "./details";

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
        editable={!isReadOnly}
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
      <DropdownMenu
        options={[
          {
            icon: task.trash ? "restore_from_trash" : "delete",
            text: task.trash ? "Restore from trash" : "Delete",
            onPress: handleDelete,
          },
          session?.user?.betaTester && {
            icon: "content_copy",
            text: "Duplicate",
            onPress: () => toast.info("Coming soon!"),
          },
          {
            icon: "ios_share",
            text: "Share",
            onPress: () => {
              impactAsync(ImpactFeedbackStyle.Heavy);
              const link = `https://dys.us.to/${task.shortId || task.id}`;

              setStringAsync(link);
              shareAsync(link, { dialogTitle: "Dysperse" });
              if (Platform.OS === "web") toast.info("Copied link!");

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
        verticalOffset={5}
        menuWidth={150}
        verticalPlacement="top"
      >
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
      </DropdownMenu>
    </AttachStep>
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
      damping: 125,
      stiffness: 1500,
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
        toast.dismiss();
        toast.success(t ? "Task deleted!" : "Task restored!", {
          duration: 4000,
          close: (
            <Button
              text="Restore"
              dense
              backgroundColors={{
                default: theme[5],
                hovered: theme[6],
                pressed: theme[7],
              }}
              onPress={() => handleDelete(false)}
            />
          ),
        });
        forceClose();
      } catch (e) {
        showErrorToast();
      }
    },
    [updateTask, task, theme, forceClose]
  );

  useHotkeys(["delete", "backspace"], () => handleDelete(true));
  useHotkeys(["shift+3"], () => labelPickerRef.current?.present());

  return (
    <>
      <OnboardingContainer
        delay={500}
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

