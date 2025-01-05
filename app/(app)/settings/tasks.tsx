import { settingStyles } from "@/components/settings/settingsStyles";
import {
  notificationScale,
  notificationScaleText,
} from "@/components/task/drawer/details";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Button, ButtonText } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover from "@/ui/MenuPopover";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { useState } from "react";
import { Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

function Section({ children }: any) {
  const theme = useColorTheme();
  return (
    <View
      style={{
        borderRadius: 20,
        borderWidth: 1,
        padding: 5,
        marginTop: 5,
        borderColor: theme[5],
      }}
    >
      {children}
    </View>
  );
}

function AccountMenuTrigger({ text }: any) {
  return (
    <Button variant="filled">
      <ButtonText>{text}</ButtonText>
      <Icon>expand_more</Icon>
    </Button>
  );
}

function TasksSettings({ updateUserSettings }: any) {
  const { mutate, session } = useUser();

  const theme = useColorTheme();
  const showComingSoon = () =>
    Toast.show({ type: "info", text1: "Coming soon!" });

  return !session?.user ? null : (
    <>
      <Text style={settingStyles.heading} weight={700}>
        Preferences
      </Text>
      <View
        style={{
          gap: 10,
          marginTop: 5,
          padding: 10,
          borderWidth: 1,
          borderColor: theme[5],
          borderRadius: 25,
        }}
      >
        <ListItemButton disabled onPress={() => {}}>
          <ListItemText
            primary="Week start"
            secondary="This setting affects recurring tasks"
          />
          <MenuPopover
            trigger={AccountMenuTrigger({
              text: capitalizeFirstLetter(
                session?.user?.weekStart?.toLowerCase()
              ),
            })}
            options={[{ text: "Sunday" }, { text: "Monday" }].map((e) => ({
              ...e,
              selected: e.text.toUpperCase() === session.user.weekStart,
              callback: () =>
                updateUserSettings("weekStart", e.text.toUpperCase()),
            }))}
          />
        </ListItemButton>
        <ListItemButton disabled onPress={() => {}}>
          <ListItemText
            primary="Default notification"
            secondary="Get reminders before a task starts"
          />
          <MenuPopover
            trigger={AccountMenuTrigger({
              text: "3 notifications",
            })}
            options={notificationScale.map((n, i) => ({
              text: notificationScaleText[i]
                .replace("m", " minutes")
                .replace("h", " hours")
                .replace("d", " day"),
              selected: [5, 15, 30].includes(n),
              callback: () =>
                Toast.show({ type: "info", text1: "Coming soon" }),
            }))}
          />
        </ListItemButton>
        <ListItemButton disabled onPress={() => {}}>
          <ListItemText
            primary="Time display"
            secondary="Choose how times are displayed in the app"
          />
          <MenuPopover
            trigger={AccountMenuTrigger({ text: "12 hour" })}
            options={[{ text: "12 hour" }, { text: "24 hour" }].map((e) => ({
              ...e,
              selected: session.user.militaryTime
                ? e.text === "24 hour"
                : e.text === "12 hour",
              callback: () =>
                updateUserSettings("militaryTime", !session.user.militaryTime),
            }))}
          />
        </ListItemButton>
        <ListItemButton disabled onPress={() => {}}>
          <ListItemText
            primary="Maps provider"
            secondary="Locations will open in this app"
          />
          <MenuPopover
            trigger={AccountMenuTrigger({
              text: `${capitalizeFirstLetter(
                session.user.mapsProvider.toLowerCase()
              )} maps`,
            })}
            options={[
              { text: "Google Maps", value: "GOOGLE" },
              { text: "Apple Maps", value: "APPLE" },
            ].map((e) => ({
              ...e,
              selected: e.value === session.user.mapsProvider,
              callback: () => updateUserSettings("mapsProvider", e.value),
            }))}
          />
        </ListItemButton>
        <ListItemButton
          onPress={() =>
            updateUserSettings("vanishMode", !session.user.vanishMode)
          }
        >
          <ListItemText
            primary="Vanish mode"
            secondary="Delete completed tasks after 14 days"
          />
          <Icon
            style={{ opacity: session.user.vanishMode ? 1 : 0.6 }}
            size={40}
          >
            toggle_{session.user.vanishMode ? "on" : "off"}
          </Icon>
        </ListItemButton>
        <ListItemButton onPress={showComingSoon}>
          <ListItemText
            primary="Enable working hours"
            secondary="Set the hours you're available during the day."
          />
          <Icon style={{ opacity: 0.6 }} size={40}>
            toggle_off
          </Icon>
        </ListItemButton>
        <ListItemButton
          onPress={() =>
            updateUserSettings("privateTasks", !session.user.privateTasks)
          }
        >
          <ListItemText
            primary="Private tasks by default"
            secondary="New tasks are private by default"
          />
          <Icon
            size={40}
            style={{
              opacity: session.user.privateTasks ? 1 : 0.6,
            }}
          >
            toggle_{session.user.privateTasks ? "on" : "off"}
          </Icon>
        </ListItemButton>
      </View>
    </>
  );
}

function GoalsSettings({ updateUserSettings }: { updateUserSettings: any }) {
  const { session } = useUser();
  return (
    <>
      <Text style={settingStyles.heading} weight={700}>
        Goals
      </Text>
      <Section>
        <ListItemButton disabled>
          <ListItemText primary="Daily task goal" />
          <MenuPopover
            trigger={AccountMenuTrigger({
              text: `${session.user.dailyStreakGoal} tasks`,
            })}
            options={[
              { text: "3 tasks" },
              { text: "5 tasks" },
              { text: "10 tasks" },
            ].map((e) => ({
              ...e,
              selected:
                session.user.dailyStreakGoal === parseInt(e.text.split(" ")[0]),
              callback: () =>
                updateUserSettings(
                  "dailyStreakGoal",
                  parseInt(e.text.replace(" tasks", ""))
                ),
            }))}
          />
        </ListItemButton>
        <ListItemButton disabled>
          <ListItemText primary="Weekly task goal" />
          <MenuPopover
            trigger={AccountMenuTrigger({
              text: `${session.user.weeklyStreakGoal} tasks`,
            })}
            options={[
              { text: "10 tasks" },
              { text: "15 tasks" },
              { text: "20 tasks" },
              { text: "30 tasks" },
              { text: "50 tasks" },
            ].map((e) => ({
              ...e,
              selected:
                session.user.weeklyStreakGoal ===
                parseInt(e.text.split(" ")[0]),
              callback: () =>
                updateUserSettings(
                  "weeklyStreakGoal",
                  parseInt(e.text.replace(" tasks", ""))
                ),
            }))}
          />
        </ListItemButton>
      </Section>
    </>
  );
}

function PrioritySettings({ updateUserSettings }: { updateUserSettings: any }) {
  const { session } = useUser();
  const theme = useColorTheme();
  const [state, setState] = useState<"SIMPLE" | "COMPLEX">(
    session.user.priorityScale || "SIMPLE"
  );

  const cardStyle =
    (selected) =>
    ({ pressed, hovered }) => ({
      borderWidth: 1,
      borderColor: theme[5],
      backgroundColor: theme[pressed || selected ? 4 : hovered ? 3 : 2],
      padding: 10,
      borderRadius: 20,
      flex: 1,
    });

  return (
    <>
      <Text style={settingStyles.heading} weight={700}>
        Priorities
      </Text>
      <Section>
        <View style={{ flexDirection: "row", gap: 10, padding: 5 }}>
          <Pressable style={cardStyle(state === "SIMPLE")}>
            <Text weight={900} style={{ fontSize: 20, marginBottom: 3 }}>
              Simple
            </Text>
            <Text style={{ opacity: 0.6 }}>
              Urgent and normal priority tasks
            </Text>
          </Pressable>
          <Pressable style={cardStyle(state === "COMPLEX")}>
            <Text weight={900} style={{ fontSize: 20, marginBottom: 3 }}>
              Complex
            </Text>
            <Text style={{ opacity: 0.6 }}>Four priority levels</Text>
          </Pressable>
        </View>
      </Section>
    </>
  );
}

export default function Page() {
  const { session, sessionToken, mutate } = useUser();
  const { data, error } = useSWR(
    session?.space ? ["space", { spaceId: session?.space?.space?.id }] : null
  );

  const updateUserSettings = (key, value) => {
    try {
      mutate(
        (prev) => ({
          ...prev,
          user: { ...prev.user, [key]: value },
        }),
        { revalidate: false }
      );

      sendApiRequest(
        sessionToken,
        "PUT",
        "user/account",
        {},
        {
          body: JSON.stringify({
            [key]: value,
          }),
        }
      );

      Toast.show({ type: "success", text1: "Saved!" });
    } catch (e) {
      console.error(e);
      Toast.show({ type: "error" });
    }
  };

  return (
    <SettingsScrollView>
      <Text style={settingStyles.title}>Tasks</Text>
      {data ? (
        <>
          <GoalsSettings updateUserSettings={updateUserSettings} />
          {session.user.betaTester && (
            <PrioritySettings updateUserSettings={updateUserSettings} />
          )}
          <TasksSettings data={data} updateUserSettings={updateUserSettings} />
        </>
      ) : error ? (
        <ErrorAlert />
      ) : (
        <Text>Loading...</Text>
      )}
    </SettingsScrollView>
  );
}

