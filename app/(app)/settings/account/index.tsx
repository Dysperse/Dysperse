import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Divider from "@/ui/Divider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

function SpaceStorage({ data }) {
  const theme = useColorTheme();

  return (
    <>
      {/* <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          gap: 20,
          padding: 10,
          paddingHorizontal: 20,
          marginHorizontal: -10,
          marginBottom: 10,
          marginTop: 5,
          backgroundColor: orange[4],
          borderRadius: 20,
        }}
      >
        <Icon filled style={{ color: orange[11] }} size={30}>
          diamond
        </Icon>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, color: orange[11] }} weight={700}>
            elite
            <Text style={{ verticalAlign: "top", color: orange[11] }}>+</Text>
          </Text>
          <Text style={{ opacity: 0.6, color: orange[11] }}>
            Join #elite and unlock unlimited storage. Plans coming soon.
          </Text>
        </View>
        <Text style={{ fontSize: 20, color: orange[11] }} weight={200}>
          $1.99/mo
        </Text>
      </View> */}
      <View
        style={{
          borderRadius: 20,
          borderWidth: 1,
          padding: 5,
          marginTop: 5,
          borderColor: theme[5],
        }}
      >
        <ListItemButton disabled style={{ backgroundColor: "transparent" }}>
          <ListItemText
            style={{ paddingVertical: 20 }}
            primaryProps={{
              style: { textAlign: "center", fontSize: 25 },
              weight: 900,
            }}
            secondaryProps={{
              style: { textAlign: "center", fontSize: 20, opacity: 0.5 },
            }}
            primary={`${-~(
              (data.storage?.used / data.storage?.limit) *
              100
            )}% used`}
            secondary={`${-~(data.storage?.limit - data.storage?.used)}/${
              data.storage?.limit
            } credits left`}
          />
        </ListItemButton>
        <Divider style={{ height: 1 }} />
        <View
          style={{
            marginVertical: 10,
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {[
            { name: "tasks", icon: "task_alt" },
            { name: "notes", icon: "sticky_note_2" },
            { name: "items", icon: "package_2" },
            { name: "labels", icon: "label" },
            { name: "collections", icon: "shapes" },
          ].map(({ name, icon }) => (
            <ListItemButton key={name} disabled style={{ width: "50%" }}>
              <Avatar icon={icon} size={40} />
              <ListItemText
                primary={`${~~parseInt(
                  ((data.storage?.breakdown?.[name] / data.storage?.limit) *
                    100) as any
                )}%`}
                secondary={`${capitalizeFirstLetter(name)}`}
              />
            </ListItemButton>
          ))}
        </View>
      </View>
    </>
  );
}

function AccountMenuTrigger({ text }) {
  return (
    <Button variant="filled">
      <ButtonText>{text}</ButtonText>
      <Icon>expand_more</Icon>
    </Button>
  );
}

function TasksSettings({ mutate, data }) {
  const { mutate: mutateUser, sessionToken } = useUser();

  const handleSpaceEdit = async (key, value) => {
    try {
      mutate({ ...data, [key]: value }, { revalidate: false });
      mutateUser(
        (prev) => ({
          ...prev,
          space: { ...prev.space, [key]: value },
        }),
        { revalidate: false }
      );
      await sendApiRequest(sessionToken, "PUT", "space", {
        [key]: value,
      });
      Toast.show({ type: "success", text1: "Saved!" });
    } catch (e) {
      mutate(data, { revalidate: false });
      console.error(e);
      Toast.show({ type: "error" });
    }
  };

  const theme = useColorTheme();
  const showComingSoon = () =>
    Toast.show({ type: "info", text1: "Coming soon!" });

  return (
    <>
      <Text style={settingStyles.heading} weight={700}>
        Tasks
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
              text: capitalizeFirstLetter(data?.weekStart?.toLowerCase()),
            })}
            options={[{ text: "Sunday" }, { text: "Monday" }].map((e) => ({
              ...e,
              selected: e.text.toUpperCase() === data?.weekStart,
              callback: () =>
                handleSpaceEdit("weekStart", e.text.toUpperCase()),
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
              selected: e.text === "12 hour",
              callback: showComingSoon,
            }))}
          />
        </ListItemButton>
        <ListItemButton onPress={showComingSoon}>
          <ListItemText
            primary="Vanish mode"
            secondary="Delete completed tasks after 14 days"
          />
          <Icon style={{ opacity: 0.6 }} size={40}>
            toggle_off
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
        <ListItemButton onPress={showComingSoon}>
          <ListItemText
            primary="Private tasks by default"
            secondary="New tasks are private by default"
          />
          <Icon size={40}>toggle_on</Icon>
        </ListItemButton>
      </View>
    </>
  );
}

export default function Page() {
  const { session } = useUser();
  const { data, mutate, error } = useSWR(
    session?.space ? ["space", { spaceId: session?.space?.space?.id }] : null
  );

  return (
    <SettingsLayout>
      <Text style={settingStyles.title}>Account</Text>
      {data ? (
        <>
          <Text style={settingStyles.heading} weight={700}>
            Storage
          </Text>
          <SpaceStorage data={data} />
          <TasksSettings data={data} mutate={mutate} />
        </>
      ) : error ? (
        <ErrorAlert />
      ) : (
        <Text>Loading...</Text>
      )}
    </SettingsLayout>
  );
}
