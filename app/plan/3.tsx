import { Entity } from "@/components/collections/entity";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { taskInputStyles } from "@/components/signup/TaskCreator";
import { TaskImportantChip, TaskLabelChip } from "@/components/task";
import Checkbox from "@/components/task/Checkbox";
import CreateTask, { TaskDatePicker } from "@/components/task/create";
import { TaskDrawer } from "@/components/task/drawer";
import { STORY_POINT_SCALE } from "@/constants/workload";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { RRule } from "rrule";
import useSWR from "swr";
import { styles } from ".";

const SubmitButton = ({ text = "Done", icon = "check", onPress, disabled }) => {
  const theme = useColorTheme();

  const handleNext = () => {
    if (onPress) onPress();
    else router.push("/plan/4");
  };

  return (
    <Button
      onPress={handleNext}
      disabled={disabled}
      style={({ pressed, hovered }) => [
        styles.button,
        {
          backgroundColor: !disabled
            ? theme[pressed ? 11 : hovered ? 10 : 9]
            : theme[7],
          marginTop: "auto",
        },
      ]}
    >
      <ButtonText
        style={[styles.buttonText, { color: theme[!disabled ? 1 : 10] }]}
      >
        {text}
      </ButtonText>
      <Icon style={{ color: theme[!disabled ? 1 : 10] }} bold>
        {icon}
      </Icon>
    </Button>
  );
};

const taskStyles = StyleSheet.create({
  chip: { backgroundColor: "transparent", paddingHorizontal: 0 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: "auto",
  },
  footerButton: {
    flex: 1,
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 20,
    gap: 5,
  },
});

function CurrentTaskFooter({
  taskAnimationState,
  slide,
  setSlide,
  task,
  onTaskUpdate,
  dateRange,
}) {
  const { sessionToken } = useUser();
  const theme = useColorTheme();

  const handleEdit = async (key, value) => {
    onTaskUpdate({ ...task, [key]: value });

    await sendApiRequest(
      sessionToken,
      "PUT",
      "space/entity",
      {},
      {
        body: JSON.stringify({
          id: task.id,
          [key]: value,
        }),
      }
    ).catch(() => {
      onTaskUpdate(task);
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later.",
      });
    });
  };

  const handleNext = () => {
    taskAnimationState.value = "NEXT";
    setTimeout(() => {
      setSlide((s) => s + 1);
      taskAnimationState.value = "INTRO";
      setTimeout(() => (taskAnimationState.value = "IDLE"), 0);
    }, 100);
  };

  const isCompleted = task.recurrenceRule
    ? dateRange &&
      task.completionInstances.find((instance) =>
        dayjs(instance.iteration).isBetween(
          dateRange[0],
          dateRange[1],
          "day",
          "[]"
        )
      )
    : task.completionInstances.length > 0;

  const handleBack = () => {
    taskAnimationState.value = "PREVIOUS";
    setTimeout(() => {
      setSlide((s) => s - 1);
      taskAnimationState.value = "IDLE";
    }, 100);
  };

  return (
    <View style={[taskStyles.footer]}>
      <Pressable
        style={({ pressed, hovered }) => [
          taskStyles.footerButton,
          {
            backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
            opacity: slide === 0 ? 0.5 : 1,
          },
        ]}
        disabled={slide === 0}
        onPress={handleBack}
      >
        <Avatar disabled icon="undo" size={40} />
        <Text style={{ color: theme[11] }} weight={500} numberOfLines={1}>
          Back
        </Text>
      </Pressable>
      <TaskDatePicker
        setValue={(date) => handleEdit("due", date)}
        watch={(n) => task.due}
        defaultView="date"
        dueDateOnly
      >
        <Pressable
          style={({ pressed, hovered }) => [
            taskStyles.footerButton,
            {
              backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
              opacity: task.recurrenceRule ? 0.5 : 1,
            },
          ]}
          disabled={task.recurrenceRule}
        >
          <Avatar disabled icon="pan_tool" size={40} />
          <Text style={{ color: theme[11] }} weight={500} numberOfLines={1}>
            Reschedule
          </Text>
        </Pressable>
      </TaskDatePicker>
      <Pressable
        style={({ pressed, hovered }) => [
          taskStyles.footerButton,
          { backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3] },
        ]}
        onPress={() => handleNext()}
      >
        <Avatar
          disabled
          icon="north"
          style={{ backgroundColor: theme[11] }}
          iconProps={{ style: { color: theme[1] } }}
          size={40}
        />
        <Text style={{ color: theme[11] }} weight={800} numberOfLines={1}>
          Add
        </Text>
      </Pressable>
      <Pressable
        style={({ pressed, hovered }) => [
          taskStyles.footerButton,
          { backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3] },
        ]}
        onPress={() => {
          handleEdit("pinned", !task.pinned);
          taskAnimationState.value = task.pinned ? "IDLE" : "PINNED";
          setTimeout(
            () => {
              handleNext();
            },
            !task.pinned ? 450 : 100
          );
        }}
      >
        <Avatar disabled icon="priority_high" size={40} />
        <Text style={{ color: theme[11] }} weight={500} numberOfLines={1}>
          {task.pinned ? "Deprioritize" : "Prioritize"}
        </Text>
      </Pressable>
      <Checkbox
        dateRange={dateRange}
        task={task}
        isReadOnly={false}
        mutateList={(...t) => {
          onTaskUpdate(...t);
          setTimeout(() => {
            handleNext();
          }, 100);
        }}
      >
        <Pressable
          style={({ pressed, hovered }) => [
            taskStyles.footerButton,
            { backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3] },
          ]}
        >
          <Avatar
            disabled
            iconProps={{ filled: isCompleted }}
            icon="verified"
            size={40}
          />
          <Text style={{ color: theme[11] }} weight={500} numberOfLines={1}>
            {isCompleted ? "Marked done" : "Mark done"}
          </Text>
        </Pressable>
      </Checkbox>
    </View>
  );
}

function TodaysTasks({ data, mutate, error, setStage, dateRange }) {
  const theme = useColorTheme();
  const t = useMemo(
    () =>
      Array.isArray(data)
        ? data
            .find((d) => dayjs().isBetween(dayjs(d.start), dayjs(d.end)))
            ?.tasks?.filter(
              (i) =>
                (i.due && dayjs(i.due).isSame(dayjs(), "day")) ||
                i.recurrenceRule
            )
        : [],
    [data]
  );

  const onTaskUpdate = (newTask) =>
    mutate(
      (oldData) => {
        const day = oldData.find((d) =>
          dayjs().isBetween(dayjs(d.start), dayjs(d.end))
        );
        return oldData.map((d) =>
          d.id === day.id
            ? {
                ...d,
                tasks: d.tasks
                  .map((t) => (t.id === newTask.id ? newTask : t))
                  .filter((t) => !t.trash),
              }
            : d
        );
      },
      { revalidate: false }
    );

  const [slide, setSlide] = useState(0);
  const slidesLength = t?.length || 0;

  const currentTask = t?.[slide];
  const taskAnimationState = useSharedValue<
    "INTRO" | "IDLE" | "PINNED" | "NEXT" | "PREVIOUS"
  >("IDLE");

  const taskAnimationStyle = useAnimatedStyle(() => {
    return {
      marginTop: "auto",
      width: "100%",
      marginBottom: "auto",
      opacity: withSpring(
        taskAnimationState.value === "NEXT" ||
          taskAnimationState.value === "INTRO" ||
          taskAnimationState.value === "PREVIOUS"
          ? 0
          : 1
      ),
      transform: [
        {
          scale: withSpring(taskAnimationState.value === "PINNED" ? 1.1 : 1, {
            damping: 1,
            stiffness: 150,
          }),
        },

        {
          translateY:
            taskAnimationState.value === "INTRO"
              ? 100
              : withSpring(
                  taskAnimationState.value === "NEXT"
                    ? -100
                    : taskAnimationState.value === "PREVIOUS"
                    ? 100
                    : 0,
                  {
                    damping: 30,
                    stiffness: 400,
                  }
                ),
        },
      ],
    };
  });

  const taskPinnedAnimation = useAnimatedStyle(() => {
    return {
      width: 300,
      position: "absolute",
      zIndex: 99,
      top: 0,
      left: 0,
      height: "100%",
      transform: [
        {
          translateX:
            taskAnimationState.value === "PINNED"
              ? withSpring(700, {
                  overshootClamping: true,
                })
              : -300,
        },
      ],
    };
  });

  useEffect(() => {
    if (t?.length === 0 || slide + 1 > slidesLength) {
      setStage(2);
    }
  }, [t, setStage, slide, slidesLength]);

  return data ? (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text variant="eyebrow" style={{ marginBottom: 10, marginTop: "auto" }}>
        {slide + 1}/{slidesLength}
      </Text>
      {currentTask && (
        <>
          <Animated.View style={taskAnimationStyle}>
            <TaskDrawer
              mutateList={onTaskUpdate}
              id={currentTask.id}
              dateRange={dateRange}
            >
              <Pressable
                style={({ pressed, hovered }) => ({
                  padding: 20,
                  backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
                  shadowColor: theme[pressed ? 9 : hovered ? 8 : 7],
                  shadowRadius: 20,
                  shadowOpacity: pressed ? 0.2 : 0.3,
                  shadowOffset: { width: 5, height: 5 },
                  borderColor: theme[pressed ? 8 : hovered ? 7 : 6],
                  borderWidth: 1,
                  borderRadius: 20,
                  marginBottom: 20,
                  width: "100%",
                  overflow: "hidden",
                })}
              >
                {currentTask.pinned && (
                  <Animated.View style={taskPinnedAnimation}>
                    <LinearGradient
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      colors={[
                        "transparent",
                        addHslAlpha(theme[8], 0.4),
                        "transparent",
                      ]}
                      style={{
                        flex: 1,
                        width: "100%",
                        transform: [{ skewX: "-15deg" }],
                      }}
                    />
                  </Animated.View>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  {currentTask.pinned && <TaskImportantChip published large />}
                  {currentTask.label && (
                    <TaskLabelChip large published task={currentTask} />
                  )}
                </View>
                <Text style={{ fontSize: 40 }} weight={700}>
                  {currentTask.name}
                </Text>
                <Chip
                  disabled
                  style={taskStyles.chip}
                  icon="calendar_today"
                  label={capitalizeFirstLetter(
                    currentTask.recurrenceRule
                      ? new RRule(currentTask.recurrenceRule).toText()
                      : dayjs(currentTask.due).fromNow()
                  )}
                />
                <Chip
                  disabled
                  style={taskStyles.chip}
                  icon="exercise"
                  label={`${
                    STORY_POINT_SCALE[
                      [2, 4, 8, 16, 32].indexOf(currentTask.storyPoints)
                    ]
                  }`}
                />
                {currentTask.attachments?.length > 0 && (
                  <Chip
                    disabled
                    style={taskStyles.chip}
                    icon="attachment"
                    label={`${currentTask.attachments?.length} attachment${
                      currentTask.attachments?.length > 1 ? "s" : ""
                    }`}
                  />
                )}
                {currentTask.note && (
                  <View
                    style={{ marginTop: 10, gap: 5, pointerEvents: "none" }}
                  >
                    <Text variant="eyebrow">Note</Text>
                    <MarkdownRenderer>{currentTask.note}</MarkdownRenderer>
                  </View>
                )}
              </Pressable>
            </TaskDrawer>
          </Animated.View>
          <CurrentTaskFooter
            taskAnimationState={taskAnimationState}
            dateRange={dateRange}
            onTaskUpdate={onTaskUpdate}
            task={currentTask}
            slide={slide}
            setSlide={setSlide}
          />
        </>
      )}
    </View>
  ) : (
    <Spinner />
  );
}

export default function Page() {
  const theme = useColorTheme();

  const start = dayjs().startOf("week").utc().toISOString();

  const { data, mutate, error } = useSWR([
    "space/collections/collection/planner",
    {
      start: dayjs(start).startOf("week").toISOString(),
      end: dayjs(start).startOf("week").add(1, "week").toISOString(),
      type: "week",
      timezone: dayjs.tz.guess(),
      all: true,
      id: "true",
    },
  ]);

  const todaysTasks = Array.isArray(data)
    ? data?.find((d) => dayjs().isBetween(dayjs(d.start), dayjs(d.end)))?.tasks
    : [];

  const [createdTasks, setCreatedTasks] = useState([]);
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  const breakpoints = useResponsiveBreakpoints();

  return (
    <LinearGradient colors={[theme[2], theme[3]]} style={{ flex: 1 }}>
      <ScrollView
        centerContent
        contentContainerStyle={{
          padding: breakpoints.md ? 50 : 20,
          maxWidth: 700,
          width: "100%",
          marginHorizontal: "auto",
        }}
      >
        {error && <ErrorAlert />}
        {stage === 0 && (
          <>
            <Emoji
              emoji="1f680"
              size={50}
              style={{ marginTop: "auto", marginBottom: 10 }}
            />
            <Text style={{ fontSize: 35, color: theme[11] }} weight={900}>
              What's the plan?
            </Text>
            <Text
              style={{
                fontSize: 20,
                opacity: 0.6,
                color: theme[11],
                marginBottom: 10,
              }}
            >
              We'll show tasks you already have scheduled for today, and also
              help you create new ones.
            </Text>
            <SubmitButton
              disabled={!Array.isArray(data)}
              text="Next"
              icon="arrow_forward_ios"
              onPress={() => setStage(1)}
            />
          </>
        )}
        {stage === 1 && (
          <TodaysTasks
            dateRange={[
              new Date(
                data?.find((d) =>
                  dayjs().isBetween(dayjs(d.start), dayjs(d.end))
                ).start
              ),
              new Date(
                data?.find((d) =>
                  dayjs().isBetween(dayjs(d.start), dayjs(d.end))
                ).end
              ),
            ]}
            setStage={setStage}
            data={data}
            mutate={mutate}
            error={error}
          />
        )}
        {stage === 2 && (
          <>
            <Emoji
              emoji="1f4a1"
              size={50}
              style={{ marginTop: "auto", marginBottom: 10 }}
            />
            <Text style={{ fontSize: 35, color: theme[11] }} weight={900}>
              {todaysTasks.length === 0
                ? "Let's create some tasks!"
                : "Anything else?"}
            </Text>
            <Text
              style={{
                fontSize: 20,
                opacity: 0.6,
                color: theme[11],
                marginBottom: 10,
              }}
            >
              List out any other tasks you'd like to complete today.
            </Text>
            <CreateTask
              mutate={(newTask) => setCreatedTasks((old) => [...old, newTask])}
              defaultValues={{ date: dayjs() }}
            >
              <Pressable
                style={({ pressed, hovered }) => [
                  taskInputStyles.container,
                  {
                    backgroundColor: theme[pressed ? 6 : hovered ? 5 : 4],
                    borderColor: theme[pressed ? 6 : hovered ? 5 : 4],
                    marginBottom: 20,
                    paddingLeft: 3,
                    alignItems: "center",
                  },
                ]}
              >
                <View
                  style={[
                    taskInputStyles.check,
                    {
                      borderColor: "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Icon
                    size={30}
                    style={{
                      color: theme[10],
                    }}
                  >
                    add
                  </Icon>
                </View>
                <Text
                  weight={700}
                  style={{ marginLeft: -10, opacity: 0.8, color: theme[11] }}
                >
                  New task...
                </Text>
              </Pressable>
            </CreateTask>

            {createdTasks.map(
              (task) =>
                task?.id && (
                  <Entity
                    key={task.id}
                    item={task}
                    isReadOnly={false}
                    onTaskUpdate={(newTask) => {
                      setCreatedTasks((old) =>
                        old.map((t) => (t.id === newTask.id ? newTask : t))
                      );
                    }}
                    planMode
                    showLabel
                  />
                )
            )}
          </>
        )}
        {stage === 2 && (
          <SubmitButton
            onPress={() => router.push("/plan/4")}
            disabled={todaysTasks.length === 0 && createdTasks.length === 0}
          />
        )}
      </ScrollView>
    </LinearGradient>
  );
}
