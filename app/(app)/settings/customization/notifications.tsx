import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import Alert from "@/ui/Alert";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import { useState } from "react";
import { View } from "react-native";

const notificationSettings = [
  {
    name: "Collections",
    options: [
      {
        key: "collection-invite",
        name: "Invite",
        description: "Notify me when I'm invited to a collection",
      },
      {
        key: "collection-entity-create",
        name: "Create",
        description: "Notify me when a new entity is created in a collection",
      },
      {
        key: "collection-entity-edit",
        name: "Edit",
        description: "Notify me when labels are edited in a collection",
      },
    ],
  },
  {
    name: "Spaces",
    options: [
      {
        key: "space-members",
        name: "Members",
        description: "Notify me when a member joins or leaves my space",
      },
      {
        key: "space-edits",
        name: "Edits",
        description: "Notify me when an edit is made to my space",
      },
    ],
  },
  {
    name: "Friends",
    options: [
      {
        key: "friends-request-me",
        name: "Friend requests",
        description: "Notify me when someone sends me a friend request",
      },
      {
        key: "friend-request-them",
        name: "Friend requests",
        description: "Notify me when someone accepts my friend request",
      },
    ],
  },
  {
    name: "Availability",
    options: [
      {
        key: "availability",
        name: "Availability",
        description: "Notify me when someone wants my availability",
      },
    ],
  },
  {
    name: "Login security",
    options: [
      {
        key: "login-new",
        name: "New login",
        description: "Notify me when someone logs into my account",
        forceChecked: true,
      },
      {
        key: "login-2fa",
        name: "2FA codes",
        description: "Send 2FA codes to this device",
      },
    ],
  },
];

export default function Page() {
  const values = {
    "task-reminders": true,
  };
  const [settings, setSettings] = useState(values);

  return (
    <SettingsLayout>
      <Text style={settingStyles.title}>Notifications</Text>
      <Text>
        Here, you can control how much you want to be{" "}
        <Text style={{ textDecorationLine: "line-through", opacity: 0.4 }}>
          annoyed
        </Text>{" "}
        notified?
      </Text>

      <Alert
        style={{ marginTop: 20, marginBottom: -5 }}
        emoji="1f6a7"
        title="Work in progress"
        subtitle="We're working hard to add notifications to the app. Stay tuned!"
      />

      {notificationSettings.map((section) => (
        <View key={section.name} style={{ paddingHorizontal: 0 }}>
          <Text style={settingStyles.heading}>{section.name}</Text>
          {section.options.map((option) => (
            <ListItemButton
              key={option.key}
              disabled={option.forceChecked}
              style={{
                borderRadius: 0,
                marginHorizontal: -10,
                ...(option.forceChecked && {
                  opacity: 0.2,
                }),
              }}
              onPress={() =>
                setSettings({
                  ...settings,
                  [option.key]: !settings[option.key],
                })
              }
            >
              <ListItemText
                primary={option.name}
                secondary={option.description}
              />
              <Icon
                size={50}
                style={{
                  opacity:
                    settings[option.key] || option.forceChecked ? 1 : 0.4,
                }}
              >
                {settings[option.key] || option.forceChecked
                  ? "toggle_on"
                  : "toggle_off"}
              </Icon>
            </ListItemButton>
          ))}
        </View>
      ))}
    </SettingsLayout>
  );
}
