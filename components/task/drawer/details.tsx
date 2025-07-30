import { Entity } from "@/components/collections/entity";
import { LocationPickerModal } from "@/components/collections/views/map";
import LabelPicker from "@/components/labels/picker";
import { STORY_POINT_SCALE } from "@/constants/workload";
import { AttachStep } from "@/context/OnboardingProvider";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Modal from "@/ui/Modal";
import { RecurrencePicker } from "@/ui/RecurrencePicker";
import SkeletonContainer from "@/ui/Skeleton/container";
import { LinearSkeletonArray } from "@/ui/Skeleton/linear";
import Text from "@/ui/Text";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalSearchParams } from "expo-router";
import React, { useRef } from "react";
import { Linking, Platform, View } from "react-native";
import Toast from "react-native-toast-message";
import { RRule } from "rrule";
import useSWR from "swr";
import CreateTask from "../create";
import { useTaskDrawerContext } from "./context";
import { TaskDateModal } from "./date-modal";
import { TaskNote } from "./TaskNote";

export const notificationScale = [5, 10, 15, 30, 60, 120, 240, 480, 1440];
export const notificationScaleText = [
  "5m",
  "10m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "8h",
  "1d",
];

function TaskNotificationsButton({ task, updateTask }) {
  const sheetRef = useRef(null);

  return (
    <>
      <MenuItem onPress={() => sheetRef.current.present()}>
        <Icon filled={task.notifications.length > 0}>
          {task.notifications.length > 0
            ? "notifications_active"
            : "notifications_off"}
        </Icon>
        <Text variant="menuItem">
          {task.notifications.length} notification
          {task.notifications.length !== 1 && "s"}
        </Text>
      </MenuItem>
      <Modal
        animation="SCALE"
        sheetRef={sheetRef}
        innerStyles={{ padding: 20 }}
        maxWidth={300}
      >
        <Text
          style={{
            textAlign: "center",
            fontFamily: "serifText800",
            fontSize: 35,
            marginBottom: 20,
            margin: 10,
          }}
        >
          Remind me...
        </Text>
        {notificationScale
          .map((n, i) => ({
            text: notificationScaleText[i]
              .replace("m", " minutes")
              .replace("h", " hours")
              .replace("d", " day"),
            selected: task.notifications.includes(n),
            callback: () =>
              updateTask({
                notifications: (task.notifications.includes(n)
                  ? task.notifications.filter((i) => i !== n)
                  : [...task.notifications, n]
                ).sort(),
              }),
          }))
          .map(({ text, selected, callback }) => (
            <ListItemButton key={text} onPress={callback}>
              <Icon filled={selected}>notifications</Icon>
              <ListItemText primary={`${text} before`} />
              {selected && <Icon>check</Icon>}
            </ListItemButton>
          ))}
      </Modal>
    </>
  );
}

export function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

export const handleLocationPress = (
  session = {
    user: { mapsProvider: "GOOGLE" },
  },
  item
) => {
  if (session.user?.mapsProvider === "APPLE") {
    Linking.openURL(
      `https://beta.maps.apple.com/?${new URLSearchParams({
        q: item.name,
        ll: `${item.coordinates[0]},${item.coordinates[1]}`,
        spn: "0.008983152841206987,0.011316585492991749",
      })}`
    );
  } else {
    Linking.openURL(
      `https://maps.google.com/?${new URLSearchParams({
        q: `${item.coordinates[0]},${item.coordinates[1]}`,
      })}`
    );
  }
};

export const normalizeRecurrenceRuleObject = (rule) => {
  if (!rule) return null;
  return new RRule({
    ...rule,
    ...(rule.until && { until: dayjs(rule.until).toDate() }),
    ...(rule.dtstart && { dtstart: dayjs(rule.dtstart).toDate() }),
  });
};

function SubtaskList() {
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();
  const theme = useColorTheme();

  return (
    Object.keys(task.subtasks || {}).length > 0 && (
      <>
        {!isReadOnly && (
          <>
            <AttachStep index={2}>
              <View>
                <CreateTask
                  mutate={(t) => {
                    updateTask({
                      subtasks: {
                        ...task.subtasks,
                        [t.id]: t,
                      },
                    });
                  }}
                  onPress={() => {
                    if (
                      Platform.OS === "web" &&
                      !localStorage.getItem("subtaskTip")
                    ) {
                      localStorage.setItem("subtaskTip", "true");
                      Toast.show({
                        type: "info",
                        text1: "Pro tip",
                        text2: "Tap twice on a task to open this popup",
                        visibilityTime: 5000,
                      });
                    }
                  }}
                  defaultValues={{ parentTask: task }}
                >
                  <Button
                    icon="prompt_suggestion"
                    dense
                    style={{ gap: 10, marginRight: "auto" }}
                    containerStyle={{ opacity: 0.6 }}
                    text={
                      Object.keys(task.subtasks || {}).length === 0
                        ? "Create subtask"
                        : `${Object.keys(task.subtasks || {}).length} subtask${
                            Object.keys(task.subtasks || {}).length > 1
                              ? "s"
                              : ""
                          }`
                    }
                  />
                </CreateTask>
              </View>
            </AttachStep>
            {Object.keys(task.subtasks || {}).length > 0 && (
              <CreateTask
                mutate={(t) =>
                  updateTask({
                    subtasks: {
                      ...task.subtasks,
                      [t.id]: t,
                    },
                  })
                }
                onPress={() => {
                  if (
                    Platform.OS === "web" &&
                    !localStorage.getItem("subtaskTip")
                  ) {
                    localStorage.setItem("subtaskTip", "true");
                    Toast.show({
                      type: "info",
                      text1: "Pro tip",
                      text2: "Tap twice on a task to open this popup",
                      visibilityTime: 5000,
                    });
                  }
                }}
                defaultValues={{ parentTask: task }}
              >
                <ListItemButton
                  pressableStyle={{ gap: 10, paddingVertical: 10 }}
                  style={{ marginLeft: 15, marginBottom: -5 }}
                >
                  <Icon size={35} style={{ color: theme[12], opacity: 0.5 }}>
                    add_circle
                  </Icon>
                  <ListItemText
                    primary="Create subtask"
                    primaryProps={{ weight: 400 }}
                  />
                </ListItemButton>
              </CreateTask>
            )}
          </>
        )}
        <View
          style={{
            marginBottom:
              Object.keys(task.subtasks || {}).length === 0 ? 0 : 10,
          }}
        >
          {typeof task.subtasks === "object" &&
            Object.values(task.subtasks)
              .filter((t) => !t.trash)
              .map((t: any) => (
                <Entity
                  dense
                  isReadOnly={isReadOnly}
                  item={t}
                  onTaskUpdate={(newTask) => {
                    updateTask(
                      {
                        subtasks: {
                          ...task.subtasks,
                          [t.id]: newTask,
                        },
                      },
                      false
                    );
                  }}
                  key={t.id}
                />
              ))}
        </View>
      </>
    )
  );
}

export function TaskDateMenu({
  onClose,
  isTaskCreation,
}: {
  onClose?: any;
  isTaskCreation?: boolean;
}) {
  const theme = useColorTheme();
  const { session } = useUser();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();

  const recurrenceRule =
    task.recurrenceRule && normalizeRecurrenceRuleObject(task.recurrenceRule);

  const dateName = recurrenceRule
    ? [
        `Repeats ${recurrenceRule
          .toText()
          .replace(
            "every week on Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
            "every day"
          )}`,
      ]
    : [
        task.start
          ? dayjs(task.start).format(
              dayjs(task.start).isSame(dayjs(), "year")
                ? task.dateOnly
                  ? "MMM Do"
                  : session.user.militaryTime
                  ? "MMM Do [@] H:mm"
                  : "MMM Do [@] h:mm a"
                : task.dateOnly
                ? "MMM Do YYYY"
                : session.user.militaryTime
                ? "MMM Do YYYY [@] H:mm"
                : "MMM Do YYYY [@] h:mm a"
            )
          : "Set due date",
        task.end &&
          (task.dateOnly
            ? dayjs(task.start).isSame(dayjs(task.end), "day")
              ? "All day"
              : dayjs(task.end)
                  .format(
                    session.user.militaryTime
                      ? "MMM Do [@] H:mm"
                      : "MMM Do [@] h:mm a"
                  )
                  .replace(":00", "")
            : dayjs(task.start).isSame(dayjs(task.end), "day")
            ? dayjs(task.start)
                .format(
                  session.user.militaryTime ? "[until] H:mm" : "[until] h:mm a"
                )
                .replace(":00", "")
            : dayjs(task.end)
                .format(
                  session.user.militaryTime
                    ? "MMM Do [@] H:mm"
                    : "MMM Do [@] h:mm a"
                )
                .replace(":00", "")),
      ];

  const addRecurrenceRef = useRef(null);

  return (
    !(isReadOnly && !(task.start || task.recurrenceRule)) && (
      <>
        <RecurrencePicker
          onClose={onClose}
          value={recurrenceRule?.options}
          setValue={(value) => updateTask({ recurrenceRule: value })}
          ref={addRecurrenceRef}
        />
        <AttachStep index={0}>
          <View>
            <TaskDateModal
              task={task}
              updateTask={updateTask}
              onClose={onClose}
            >
              <Button
                style={{ gap: 10, marginRight: "auto" }}
                containerStyle={{ opacity: 0.6 }}
                dense
                icon={
                  task.start
                    ? "calendar_today"
                    : task.recurrenceRule
                    ? "loop"
                    : "calendar_today"
                }
                text={
                  <View style={{ flexDirection: "column" }}>
                    <ButtonText weight={400}>
                      {dateName[0]}
                      {dateName[1] && (
                        <ButtonText
                          style={{
                            color: theme[11],
                            opacity: 0.6,
                          }}
                        >
                          {" — "}
                          {dateName[1]}
                        </ButtonText>
                      )}
                    </ButtonText>
                  </View>
                }
              />
            </TaskDateModal>
          </View>
        </AttachStep>
      </>
    )
  );
}

function TaskLocationMenu() {
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();
  const { session } = useUser();

  const { data } = useSWR(
    task.location
      ? `https://nominatim.openstreetmap.org/details?place_id=${task.location.placeId}&format=json`
      : null,
    (t) => fetch(t).then((r) => r.json())
  );

  const trigger = data ? (
    <Button
      containerStyle={{
        opacity: 0.6,
        marginLeft: 14,
        marginTop: 5,
        borderRadius: 0,
      }}
      style={{
        gap: 10,
        alignItems: "flex-start",
        justifyContent: "flex-start",
        paddingHorizontal: 0,
      }}
      height={"auto" as any}
      dense
    >
      <Icon
        style={{
          flexShrink: 0,
          transform: [{ scale: 1.3 }, { translateX: -4 }],
        }}
      >
        near_me
      </Icon>
      <View>
        <ButtonText numberOfLines={undefined}>
          {data.names?.name || "Location"}
        </ButtonText>
        <ButtonText numberOfLines={undefined} weight={300}>
          {[
            `${data.addresstags?.housenumber || ""} ${
              data.addresstags?.street || ""
            }`.trim(),
            data.addresstags?.city,
            data.addresstags?.state,
          ]
            .filter((t) => t)
            .join(", ") || capitalizeFirstLetter(data.type)}
        </ButtonText>
        {/* <ButtonText numberOfLines={undefined}>
          {JSON.stringify(data, null, 2)}
        </ButtonText> */}
      </View>
      <View style={{ marginLeft: "auto", flexDirection: "row" }}>
        {data.extratags?.phone && (
          <IconButton
            icon="phone"
            onPress={() => Linking.openURL(`tel:${data.extratags?.phone}`)}
          />
        )}
        {data.extratags?.website && (
          <IconButton
            icon="language"
            onPress={() => Linking.openURL(data.extratags?.website)}
          />
        )}
        <IconButton
          icon="open_in_new"
          onPress={() => handleLocationPress(session, task.location)}
        />
      </View>
    </Button>
  ) : (
    <Button
      disabled={isReadOnly}
      containerStyle={{
        opacity: 0.6,
        marginLeft: 10,
        marginTop: 5,
        borderRadius: 0,
      }}
      style={{
        gap: 10,
        alignItems: "flex-start",
        justifyContent: "flex-start",
        paddingHorizontal: 0,
      }}
      height={"auto" as any}
      dense
      icon="location_on"
      text={task.location ? task.location.name : "Add location"}
      textProps={{ numberOfLines: undefined }}
    />
  );

  return task.location ? (
    <MenuPopover
      menuProps={{
        style: { maxWidth: "100%" },
        rendererProps: { placement: "top" },
      }}
      containerStyle={{ marginBottom: -10, width: 190 }}
      trigger={trigger}
      options={[
        {
          icon: "remove_circle",
          text: "Remove",
          callback: () => {
            updateTask({ location: null });
          },
        },
      ]}
    />
  ) : (
    !isReadOnly && (
      <LocationPickerModal
        hideSkip
        defaultQuery={task.name.trim()}
        closeOnSelect
        onLocationSelect={(location) =>
          updateTask({
            location: {
              placeId: location.place_id,
              name: location.display_name,
              coordinates: [location.lat, location.lon],
            },
          })
        }
      >
        {trigger}
      </LocationPickerModal>
    )
  );
}

function CanvasLiveInfo() {
  const { session } = useUser();
  const { task } = useTaskDrawerContext();
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { data, error } = useSWR([
    "space/integrations/canvas-live-widget",
    { id: task.id },
  ]);

  return error ? (
    <ErrorAlert message="Couldn't get assignment information - try again later" />
  ) : data ? (
    <SkeletonContainer
      style={{
        marginTop: 10,
        gap: 10,
        paddingVertical: 20,
        paddingHorizontal: 10,
        position: "relative",
        marginBottom: 10,
        borderRadius: 30,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: -3,
          marginTop: -3,
        }}
      >
        <Text style={{ paddingHorizontal: 10 }} variant="eyebrow" weight={700}>
          {data.submission?.workflow_state === "graded" && !data.score
            ? "Assigned"
            : data.submission?.workflow_state
                ?.replace("unsubmitted", "Assigned")
                .replace("_", " ")}
          {data.submission?.workflow_state === "submitted"
            ? data.submission.late
              ? " late :("
              : " on time!"
            : data.submission?.workflow_state === "unsubmitted" ||
              (data.submission?.workflow_state === "graded" && !data.score)
            ? ` ${dayjs(data.updated_at || data.created_at)
                .fromNow()
                .replace("ago", "")
                .replace(/\b(\d+)\s+([a-zA-Z])\w*\b/g, "$1$2")}ago`
            : ""}
        </Text>
        <Button
          onPress={() => Linking.openURL(data.html_url)}
          dense
          text={breakpoints.md ? "Open" : ""}
          iconPosition="end"
          textStyle={!breakpoints.md && { marginLeft: -5 }}
          icon="north_east"
          containerStyle={{ marginLeft: "auto", marginRight: 10 }}
          backgroundColors={{
            default: addHslAlpha(theme[9], 0.1),
            hovered: addHslAlpha(theme[9], 0.2),
            pressed: addHslAlpha(theme[9], 0.3),
          }}
        />
      </View>
      <Text
        style={{
          fontSize: breakpoints.md ? 35 : 30,
          paddingHorizontal: 10,
          marginTop: -10,
        }}
        weight={700}
      >
        {data.submission?.score ? (
          <>
            {data.submission?.score} points
            <Text weight={700} style={{ fontSize: 20, opacity: 0.6 }}>
              {" "}
              out of {data.points_possible}{" "}
              {data.submission?.score === data.points_possible && "🎉"}
            </Text>
          </>
        ) : (
          `${data.points_possible} points`
        )}
      </Text>
      <View style={{ flexDirection: "row", gap: 5, paddingHorizontal: 10 }}>
        {[
          { filled: true },
          { filled: data.submission?.submitted_at },
          { filled: data.submission?.graded_at && data.submission?.score },
        ].map((_, i) => (
          <LinearGradient
            colors={[
              addHslAlpha(theme[_.filled ? 7 : 5], 0.7),
              addHslAlpha(theme[_.filled ? 10 : 5], 0.7),
            ]}
            key={i}
            style={{
              height: 5,
              flex: 1,
              borderRadius: 5,
            }}
          />
        ))}
      </View>
      <View style={{ gap: 10, marginTop: 5 }}>
        {data.score_statistics && (
          <ListItemButton disabled pressableStyle={{ paddingVertical: 0 }}>
            <Icon>area_chart</Icon>
            <ListItemText
              primary="Score statistics"
              secondary={`Low: ${data.score_statistics.min}  •  High: ${data.score_statistics.max}  •  Mean: ${data.score_statistics.mean}`}
            />
          </ListItemButton>
        )}
        <ListItemButton disabled pressableStyle={{ paddingVertical: 0 }}>
          <Icon>assignment</Icon>
          <ListItemText
            primary="Attempts"
            secondary={
              data.allowed_attempts === -1 ? "Unlimited" : data.allowed_attempts
            }
          />
        </ListItemButton>
        <ListItemButton disabled pressableStyle={{ paddingVertical: 0 }}>
          <Icon>assignment</Icon>
          <ListItemText
            primary="Submission"
            secondary={capitalizeFirstLetter(
              data.submission_types.join(", ").replace("_", " ")
            )}
            secondaryProps={{
              style: {
                opacity: 0.6,
                fontSize: 13,
              },
            }}
          />
        </ListItemButton>
      </View>
      {data.unlock_at && (
        <ListItemButton disabled pressableStyle={{ paddingVertical: 0 }}>
          <Icon>lock</Icon>
          <ListItemText
            primary={`Unlocks ${dayjs(data.unlock_at).format(
              session.user.militaryTime ? "MMM Do, H:mm" : "MMM Do, h:mm A"
            )}`}
            secondary={dayjs(data.unlock_at).fromNow()}
          />
        </ListItemButton>
      )}
      {data.submission?.points_deducted && (
        <ListItemButton disabled pressableStyle={{ paddingVertical: 0 }}>
          <Icon>change_history</Icon>
          <ListItemText
            primary={`${data.submission.points_deducted} points deducted`}
          />
        </ListItemButton>
      )}
      {!data.has_submitted_submissions && (
        <ListItemButton disabled pressableStyle={{ paddingVertical: 0 }}>
          <Icon>info</Icon>
          <ListItemText primary="Nobody else has submitted this yet" />
        </ListItemButton>
      )}
      {data.lock_at && (
        <ListItemButton disabled pressableStyle={{ paddingVertical: 0 }}>
          <Icon>lock</Icon>
          <ListItemText
            primary={`Locks on ${dayjs(data.lock_at).format(
              session.user.militaryTime ? "MMM Do, H:mm" : "MMM Do, h:mm A"
            )}`}
            secondary={dayjs(data.lock_at).fromNow()}
          />
        </ListItemButton>
      )}
      {data.require_lockdown_browser && (
        <ListItemButton disabled pressableStyle={{ paddingVertical: 0 }}>
          <Icon>vpn</Icon>
          <ListItemText primary="Requires lockdown browser" />
        </ListItemButton>
      )}
      {data.omit_from_final_grade && (
        <ListItemButton disabled pressableStyle={{ paddingVertical: 0 }}>
          <Icon>close</Icon>
          <ListItemText primary="Omitted from final grade" />
        </ListItemButton>
      )}
      {data.is_quiz_assignment && (
        <ListItemButton disabled pressableStyle={{ paddingVertical: 0 }}>
          <Icon>question_answer</Icon>
          <ListItemText primary="Quiz" />
        </ListItemButton>
      )}
      {data.peer_reviews && (
        <ListItemButton disabled>
          <Icon>people</Icon>
          <ListItemText
            primary="Peer reviews"
            secondary={
              data.anonymous_peer_reviews ? "Anonymous" : "Not anonymous"
            }
          />
        </ListItemButton>
      )}
    </SkeletonContainer>
  ) : (
    <SkeletonContainer style={{ marginTop: 10 }}>
      <LinearSkeletonArray
        widths={["80%", "60%", "70%", "40%", "90%"]}
        height={30}
      />
    </SkeletonContainer>
  );
}

function TaskStoryPoints() {
  const theme = useColorTheme();
  const { task, updateTask } = useTaskDrawerContext();
  const complexityScale = ["XS", "S", "M", "L", "XL"];
  const legacyComplexityScale = [2, 4, 8, 16, 32];
  const menuRef = useRef(null);

  return (
    <MenuPopover
      menuRef={menuRef}
      containerStyle={{ width: 200 }}
      menuProps={{
        style: { marginBottom: -2 },
      }}
      options={
        [
          ...legacyComplexityScale.map((n) => ({
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
                    {
                      complexityScale[
                        legacyComplexityScale.findIndex((i) => i === n)
                      ]
                    }
                  </Text>
                </View>
                <Text variant="menuItem">
                  {
                    STORY_POINT_SCALE[
                      legacyComplexityScale.findIndex((i) => i === n)
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
        <Button
          icon="exercise"
          dense
          style={{ gap: 10 }}
          containerStyle={{ opacity: 0.6, marginRight: "auto" }}
          text={
            STORY_POINT_SCALE[
              legacyComplexityScale.findIndex((i) => i === task.storyPoints)
            ]
          }
        />
      }
    />
  );
}

export function TaskDetails({ labelPickerRef }) {
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();
  const editorRef = useRef(null);
  const { id: collectionId } = useGlobalSearchParams();

  return (
    <View style={{ paddingLeft: 3, gap: 3, paddingTop: 5 }}>
      {task.integration?.type === "NEW_CANVAS_LMS" && <CanvasLiveInfo />}
      <View style={{ flex: 1, gap: 3 }}>
        {!task.parentTaskId && (
          <>
            <TaskDateMenu />
            {task.location && <TaskLocationMenu />}
            {task && !task.parentTaskId && !(isReadOnly && !task.label) && (
              <LabelPicker
                disabled={isReadOnly}
                label={task?.label || undefined}
                setLabel={(e: any) => {
                  updateTask({ labelId: e.id, label: e });
                }}
                onClose={() => {}}
                sheetProps={{ sheetRef: labelPickerRef }}
                defaultCollection={collectionId as any}
              >
                <Button
                  disabled={isReadOnly}
                  icon={
                    task.label?.emoji || task.collection?.emoji ? (
                      <Emoji
                        emoji={task?.label?.emoji || task.collection.emoji}
                        size={20}
                        style={{ marginHorizontal: 2.5 }}
                      />
                    ) : (
                      <Icon>tag</Icon>
                    )
                  }
                  dense
                  style={{ gap: 10 }}
                  containerStyle={{ marginRight: "auto" }}
                  textStyle={{ opacity: 0.6 }}
                  iconStyle={{
                    opacity:
                      task.label?.emoji || task.collection?.emoji ? 1 : 0.6,
                  }}
                  text={
                    task?.label?.name || task?.collection?.name || "Add label"
                  }
                />
              </LabelPicker>
            )}
          </>
        )}
        {task.storyPoints && <TaskStoryPoints />}
        {(isReadOnly && task.subtasks?.length === 0) ||
        task.parentTaskId ? null : (
          <SubtaskList />
        )}
        <TaskNote task={task} ref={editorRef} updateTask={updateTask} />
      </View>
    </View>
  );
}

