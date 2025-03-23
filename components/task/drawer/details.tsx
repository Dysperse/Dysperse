import { Entity } from "@/components/collections/entity";
import { LocationPickerModal } from "@/components/collections/views/map";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import { DatePicker } from "@/ui/DatePicker";
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
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import { Linking, Platform, View } from "react-native";
import Toast from "react-native-toast-message";
import { RRule } from "rrule";
import useSWR from "swr";
import CreateTask from "../create";
import { TaskNote } from "./TaskNote";
import { useTaskDrawerContext } from "./context";

function TaskRescheduleButton({ task, updateTask }) {
  const sheetRef = useRef(null);
  const handleSelect = (t, n) =>
    updateTask({ start: dayjs(task.start).add(n, t).toISOString() });

  const isSameDay = task.start && dayjs().isSame(dayjs(task.start), "day");

  return (
    <>
      <MenuItem
        onPress={() => sheetRef.current.present()}
        containerStyle={{ minWidth: 0 }}
      >
        <Icon>dark_mode</Icon>
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
          Snooze
        </Text>
        {[
          {
            text: isSameDay ? "Tomorrow" : "1 day",
            callback: () => handleSelect("day", 1),
          },
          {
            text: isSameDay ? "In 2 days" : "2 days",
            callback: () => handleSelect("day", 2),
          },
          {
            text: isSameDay ? "In 3 days" : "3 days",
            callback: () => handleSelect("day", 3),
          },
          {
            text: isSameDay ? "In 4 days" : "4 days",
            callback: () => handleSelect("day", 5),
          },
          {
            text: dayjs().isSame(dayjs(task.start), "week")
              ? "Next week"
              : "1 week",
            callback: () => handleSelect("week", 1),
          },
          {
            text: dayjs().isSame(dayjs(task.start), "month")
              ? "Next month"
              : "1 month",
            callback: () => handleSelect("month", 1),
          },
        ].map(({ text, callback }) => (
          <ListItemButton key={text} onPress={callback}>
            <ListItemText primary={text} />
          </ListItemButton>
        ))}
      </Modal>
    </>
  );
}

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
    <>
      {!isReadOnly && (
        <>
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
              containerStyle={{
                marginRight: "auto",
                opacity: 0.6,
                marginLeft: 5,
                marginTop: 2,
              }}
              style={{ gap: 10 }}
              text={
                Object.keys(task.subtasks || {}).length === 0
                  ? "Create subtask"
                  : `${Object.keys(task.subtasks || {}).length} subtasks`
              }
            />
          </CreateTask>
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
          marginBottom: Object.keys(task.subtasks || {}).length === 0 ? 0 : 10,
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
  );
}

function TaskDateMenu() {
  const theme = useColorTheme();
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
                ? "MMMM Do"
                : "MMM Do, YYYY"
            )
          : "Set due date",
        task.end &&
          (task.dateOnly
            ? dayjs(task.start).isSame(dayjs(task.end), "day")
              ? "All day"
              : dayjs(task.end).format("MMM Do h:mm a").replace(":00", "")
            : dayjs(task.start).isSame(dayjs(task.end), "day")
            ? dayjs(task.start).format("[until] h:mm a").replace(":00", "")
            : dayjs(task.end).format("MMM Do h:mm a").replace(":00", "")),
      ];

  const addRecurrenceRef = useRef(null);
  const addDateRef = useRef(null);
  const menuRef = useRef(null);
  const breakpoints = useResponsiveBreakpoints();

  return (
    !(isReadOnly && !(task.start || task.recurrenceRule)) && (
      <>
        <DatePicker
          value={{
            date: dayjs(task?.start).isValid() ? task?.start : null,
            dateOnly: task?.dateOnly,
            end: dayjs(task?.end).isValid() ? task?.end : null,
          }}
          setValue={(t) =>
            updateTask({
              ...t,
              ...(t.date && { start: t.date.toISOString() }),
            })
          }
          ref={addDateRef}
        />
        <RecurrencePicker
          value={recurrenceRule?.options}
          setValue={(value) => updateTask({ recurrenceRule: value })}
          ref={addRecurrenceRef}
        />
        <MenuPopover
          menuProps={{
            style: { marginRight: "auto" },
            rendererProps: { placement: "top" },
          }}
          containerStyle={{
            [breakpoints.md ? "marginTop" : "marginBottom"]: -10,
            width: 190,
          }}
          trigger={
            <Button
              containerStyle={{
                marginRight: "auto",
                opacity: 0.6,
                marginLeft: 6,
              }}
              style={{ gap: 12 }}
              dense
              height={"auto" as any}
            >
              <Icon size={20} style={{ marginTop: -3, flexShrink: 0 }}>
                {task.start
                  ? "calendar_today"
                  : task.recurrenceRule
                  ? "loop"
                  : "calendar_today"}
              </Icon>
              <View style={{ flexDirection: "column" }}>
                <Text style={{ color: theme[11] }}>
                  {dateName[0]}
                  {dateName[1] && (
                    <Text
                      style={{
                        color: theme[11],
                        opacity: 0.6,
                      }}
                    >
                      {" — "}
                      {dateName[1]}
                    </Text>
                  )}
                </Text>
              </View>
            </Button>
          }
          closeOnSelect
          menuRef={menuRef}
          options={
            isReadOnly
              ? []
              : [
                  ...(((task.start || task.recurrenceRule) && [
                    {
                      renderer: () => (
                        <View style={{ flexDirection: "row" }}>
                          <MenuItem
                            onPress={() => {
                              menuRef.current.close();
                              if (task.recurrenceRule)
                                addRecurrenceRef.current.present();
                              else addDateRef.current.present();
                            }}
                            containerStyle={{ flex: 1 }}
                          >
                            <Icon>edit</Icon>
                            <Text variant="menuItem">Edit</Text>
                          </MenuItem>
                          <TaskRescheduleButton
                            menuRef={menuRef}
                            task={task}
                            updateTask={updateTask}
                          />
                        </View>
                      ),
                    },
                    {
                      renderer: () => (
                        <TaskNotificationsButton
                          task={task}
                          updateTask={updateTask}
                        />
                      ),
                    },
                  ]) ||
                    []),
                  ...((!task.recurrenceRule &&
                    !task.start && [
                      {
                        icon: "loop",
                        text: "Add recurrence",
                        callback: () => addRecurrenceRef.current.present(),
                      },
                      {
                        icon: "calendar_today",
                        text: "Add date",
                        callback: () => addDateRef.current.present(),
                      },
                    ]) ||
                    []),
                  (task.recurrenceRule || task.start) && {
                    icon: "remove_circle",
                    text: "Remove",
                    callback: () => {
                      updateTask({ recurrenceRule: null, start: null });
                    },
                  },
                ]
          }
        />
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
      <Icon style={{ flexShrink: 0, transform: [{ scale: 1.1 }] }}>
        near_me
      </Icon>
      <View>
        <ButtonText numberOfLines={undefined}>{data.names?.name}</ButtonText>
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
      containerStyle={{
        opacity: 0.6,
        marginLeft: 14,
        marginTop: 7,
      }}
      style={{
        gap: 10,
        alignItems: task.location ? "flex-start" : undefined,
        justifyContent: "flex-start",
        paddingHorizontal: 0,
        paddingRight: 50,
      }}
      dense
      height={"auto" as any}
      icon="near_me"
      iconStyle={{ transform: [{ scale: 1.15 }], flexShrink: 0 }}
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
        marginBottom: 10,
        gap: 10,
        paddingHorizontal: 5,
        position: "relative",
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
              "MMM Do, h:mm A"
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
            primary={`Locks on ${dayjs(data.lock_at).format("MMM Do, h:mm A")}`}
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

export function TaskDetails() {
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();
  const editorRef = useRef(null);

  return (
    <View style={{ gap: 2, marginTop: 5 }}>
      {!task.parentTaskId && (
        <View style={{ flex: 1 }}>
          <TaskDateMenu />
          <TaskLocationMenu />
        </View>
      )}
      {(isReadOnly && task.subtasks?.length === 0) ||
      task.parentTaskId ? null : (
        <View>
          <SubtaskList />
        </View>
      )}

      {task.integration?.type === "NEW_CANVAS_LMS" && <CanvasLiveInfo />}
      <View>
        <TaskNote task={task} ref={editorRef} updateTask={updateTask} />
      </View>
    </View>
  );
}

