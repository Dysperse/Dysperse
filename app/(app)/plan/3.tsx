import { Entity } from "@/components/collections/entity";
import { taskInputStyles } from "@/components/signup/TaskCreator";
import { TaskImportantChip, TaskLabelChip } from "@/components/task";
import Checkbox from "@/components/task/Checkbox";
import CreateTask from "@/components/task/create";
import TaskDatePicker from "@/components/task/create/TaskDatePicker";
import { TaskDrawer } from "@/components/task/drawer";
import { normalizeRecurrenceRuleObject } from "@/components/task/drawer/details";
import { STORY_POINT_SCALE } from "@/constants/workload";
import { useBadgingService } from "@/context/BadgingProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import dayjs from "dayjs";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { getTaskCompletionStatus } from "../../../helpers/getTaskCompletionStatus";
import { SubmitButton } from "./2";

const taskStyles = StyleSheet.create({
  chip: { backgroundColor: "transparent", paddingHorizontal: 0 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
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
  const badgingService = useBadgingService();

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
    badgingService.current.mutate();
  };

  const handleNext = () => {
    taskAnimationState.value = "NEXT";
    setTimeout(() => {
      setSlide((s) => s + 1);
      taskAnimationState.value = "INTRO";
      setTimeout(() => (taskAnimationState.value = "IDLE"), 0);
    }, 100);
  };

  const isCompleted = getTaskCompletionStatus(task, task.recurrenceDay);
  const insets = useSafeAreaInsets();

  return (
    <View style={{ marginTop: "auto", marginBottom: insets.bottom, gap: 5 }}>
      <View style={[taskStyles.footer, { gap: 5 }]}>
        <TaskDatePicker
          setValue={(date) => handleEdit("start", date)}
          watch={() => task.start}
          defaultView="date"
          dueDateOnly
        >
          <Button
            style={[taskStyles.footerButton, { flexDirection: "column" }]}
            backgroundColors={{
              default: theme[4],
              pressed: theme[5],
              hovered: theme[6],
            }}
            containerStyle={{ flex: 1, borderRadius: 30 }}
            height={100}
            onPress={() => {
              handleEdit("pinned", !task.pinned);
              impactAsync(ImpactFeedbackStyle.Light);
              taskAnimationState.value = task.pinned ? "IDLE" : "PINNED";
              setTimeout(
                () => {
                  handleNext();
                },
                !task.pinned ? 450 : 100
              );
            }}
            disabled={!!task.recurrenceRule}
          >
            <Icon bold>calendar_today</Icon>
            <Text style={{ color: theme[11] }} weight={700} numberOfLines={1}>
              Snooze
            </Text>
          </Button>
        </TaskDatePicker>
        <Button
          style={[taskStyles.footerButton, { flexDirection: "column" }]}
          backgroundColors={{
            default: theme[4],
            pressed: theme[5],
            hovered: theme[6],
          }}
          containerStyle={{ flex: 1, borderRadius: 30 }}
          height={100}
          onPress={() => {
            impactAsync(ImpactFeedbackStyle.Heavy);
            handleEdit("trash", !task.trash);
            setTimeout(() => {
              handleNext();
            }, 100);
          }}
        >
          <Icon bold>delete</Icon>
          <Text style={{ color: theme[11] }} weight={700} numberOfLines={1}>
            {task.trash ? "Restore" : "Trash"}
          </Text>
        </Button>
        <Button
          style={[taskStyles.footerButton, { flexDirection: "column" }]}
          backgroundColors={{
            default: theme[4],
            pressed: theme[5],
            hovered: theme[6],
          }}
          containerStyle={{ flex: 1, borderRadius: 30 }}
          height={100}
          onPress={() => {
            handleEdit("pinned", !task.pinned);
            impactAsync(ImpactFeedbackStyle.Light);
            taskAnimationState.value = task.pinned ? "IDLE" : "PINNED";
            setTimeout(
              () => {
                handleNext();
              },
              !task.pinned ? 450 : 100
            );
          }}
        >
          <Icon bold>priority_high</Icon>
          <Text style={{ color: theme[11] }} weight={700} numberOfLines={1}>
            {task.pinned ? "Unpin" : "Pin"}
          </Text>
        </Button>
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
          <Button
            style={[taskStyles.footerButton, { flexDirection: "column" }]}
            backgroundColors={{
              default: theme[4],
              pressed: theme[5],
              hovered: theme[6],
            }}
            containerStyle={{ flex: 1, borderRadius: 30 }}
            height={100}
          >
            <Icon bold>done_outline</Icon>
            <Text style={{ color: theme[11] }} weight={700} numberOfLines={1}>
              {isCompleted ? "Completed" : "Finish"}
            </Text>
          </Button>
        </Checkbox>
      </View>
      <Button
        onPress={() => {
          impactAsync(ImpactFeedbackStyle.Medium);
          handleNext();
        }}
        icon="north"
        backgroundColors={{
          default: theme[5],
          pressed: theme[6],
          hovered: theme[7],
        }}
        bold
        large
        iconPosition="end"
        containerStyle={{ marginBottom: 10 }}
        height={100}
        text="Add"
        textStyle={{ fontSize: 25 }}
        iconStyle={{ fontSize: 30, width: 30, height: 30, lineHeight: 30 }}
      />
    </View>
  );
}

const CurrentSlideIndicator = ({ slide, slidesLength }) => (
  <Text variant="eyebrow">{slidesLength - slide} left</Text>
);

const CurrentTaskCard = ({
  onTaskUpdate,
  currentTask,
  taskAnimationState,
  dateRange,
}) => {
  const theme = useColorTheme();

  // @ts-expect-error idk
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

  const taskPinnedAnimation = useAnimatedStyle(() => ({
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
            : "-400%",
      },
    ],
  }));

  console.log(currentTask);
  return (
    <Animated.View style={taskAnimationStyle}>
      <TaskDrawer
        mutateList={onTaskUpdate}
        id={currentTask.id}
        dateRange={currentTask.recurrenceDay}
      >
        <Pressable
          style={({ pressed, hovered }) => ({
            backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
            shadowColor: theme[pressed ? 9 : hovered ? 8 : 7],
            shadowOpacity: pressed ? 0.2 : 0.3,
            borderColor: theme[pressed ? 8 : hovered ? 7 : 5],
            shadowOffset: { width: 5, height: 5 },
            padding: 20,
            shadowRadius: 20,
            borderWidth: 2,
            borderRadius: 20,
            marginBottom: 20,
            width: "100%",
            overflow: "hidden",
            position: "relative",
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
                  height: "100%",
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
              flexWrap: "wrap",
              gap: 10,
              marginBottom: currentTask.pinned || currentTask.label ? 10 : 0,
            }}
          >
            {currentTask.pinned && <TaskImportantChip published large />}
            {currentTask.label && (
              <TaskLabelChip large published task={currentTask} />
            )}
          </View>
          <Text
            style={{
              fontSize: 37,
              lineHeight: 45,
              marginBottom: 5,
              fontFamily: "serifText700",
            }}
          >
            {currentTask.name}
          </Text>
          <Chip
            disabled
            style={taskStyles.chip}
            icon="calendar_today"
            textStyle={{ flex: 1 }}
            label={capitalizeFirstLetter(
              currentTask.recurrenceRule
                ? normalizeRecurrenceRuleObject(
                    currentTask.recurrenceRule
                  ).toText()
                : dayjs(currentTask.start).fromNow()
            )}
          />
          {getTaskCompletionStatus(currentTask, currentTask.recurrenceDay) && (
            <Chip
              disabled
              style={taskStyles.chip}
              icon="done_outline"
              textStyle={{ flex: 1 }}
              label={"Completed!"}
            />
          )}
          {currentTask.storyPoints && (
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
          )}
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
        </Pressable>
      </TaskDrawer>
    </Animated.View>
  );
};

function TodaysTasks({ data, mutate, setStage, dateRange }) {
  console.log(data);
  const t = useMemo(
    () =>
      Array.isArray(data)
        ? Object.values(
            data.find((d) => dayjs().isBetween(dayjs(d.start), dayjs(d.end)))
              ?.entities
          )?.filter(
            (i) =>
              (i.start && i.start && dayjs(i.start).isSame(dayjs(), "day")) ||
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

  const theme = useColorTheme();

  const currentTask = t?.[slide];
  const taskAnimationState = useSharedValue<
    "INTRO" | "IDLE" | "PINNED" | "NEXT" | "PREVIOUS"
  >("IDLE");

  useEffect(() => {
    if (t?.length === 0 || slide + 1 > slidesLength) setStage(2);
  }, [t, setStage, slide, slidesLength]);

  const handleBack = () => {
    taskAnimationState.value = "PREVIOUS";
    setTimeout(() => {
      setSlide((s) => s - 1);
      taskAnimationState.value = "IDLE";
    }, 100);
  };

  return data ? (
    <View
      style={{
        alignItems: "center",
        flex: 1,
        paddingHorizontal: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          alignItems: "center",
        }}
      >
        <CurrentSlideIndicator slide={slide} slidesLength={slidesLength} />
        <Button
          containerStyle={{ marginLeft: "auto" }}
          disabled={slide === 0}
          text="Back"
          onPress={handleBack}
        />
      </View>
      {currentTask && (
        <>
          <CurrentTaskCard
            dateRange={dateRange}
            currentTask={currentTask}
            onTaskUpdate={onTaskUpdate}
            taskAnimationState={taskAnimationState}
          />
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
    ? Object.values(
        data?.find((d) => dayjs().isBetween(dayjs(d.start), dayjs(d.end)))
          ?.entities
      )
    : [];

  const [createdTasks, setCreatedTasks] = useState([]);
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  const breakpoints = useResponsiveBreakpoints();

  return (
    <LinearGradient colors={[theme[2], theme[3]]} style={{ flex: 1 }}>
      <ScrollView
        centerContent
        contentContainerStyle={{
          maxWidth: 700,
          width: "100%",
          marginHorizontal: "auto",
          minHeight: "100%",
        }}
      >
        {error && <ErrorAlert />}
        {stage === 0 && (
          <>
            <View
              style={{
                padding: breakpoints.md ? 50 : 20,
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Emoji emoji="1f680" size={50} style={{ marginBottom: 10 }} />
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 30,
                  color: theme[11],
                  fontFamily: "serifText700",
                }}
              >
                What's your plan?
              </Text>
              <Text
                style={{
                  opacity: 0.6,
                  textAlign: "center",
                  color: theme[11],
                  marginBottom: 10,
                  marginTop: 5,
                }}
              >
                We'll show tasks you already have scheduled for today, and also
                help you create new ones.
              </Text>
            </View>
            <SubmitButton
              disabled={!Array.isArray(data)}
              handleNext={() => {
                setStage(1);
              }}
              text="Continue"
              icon="arrow_forward_ios"
              onPress={() => {
                setStage(1);
              }}
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
          />
        )}
        {stage === 2 && (
          <>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                padding: 20,
              }}
            >
              <Emoji emoji="1f4a1" size={50} style={{ marginBottom: 10 }} />
              <Text
                style={{
                  fontSize: 35,
                  color: theme[11],
                  fontFamily: "serifText700",
                  marginBottom: 5,
                  marginTop: 10,
                }}
              >
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
                  textAlign: "center",
                }}
              >
                List out any other tasks you'd{"\n"}like to complete today.
              </Text>
            </View>
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
                    marginHorizontal: 20,
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
                  <Icon size={30} style={{ color: theme[10] }}>
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
            handleNext={() => router.push("/plan/4")}
            disabled={todaysTasks.length === 0 && createdTasks.length === 0}
          />
        )}
      </ScrollView>
    </LinearGradient>
  );
}

