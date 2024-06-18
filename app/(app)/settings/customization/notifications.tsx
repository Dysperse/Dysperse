import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import Alert from "@/ui/Alert";
import { Button, ButtonText } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

const type = ["Unknown", "Phone", "Tablet", "Desktop", "TV"];
const icons = [
  "device_unknown",
  "phone_iphone",
  "tablet_mac",
  "desktop_mac",
  "tv_gen",
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync(session) {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "All notifications",
      description:
        "Open Dysperse to change your notification settings at any time 🚀",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.error("Permission not granted to get push token!");
      Toast.show({ type: "error" });
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      console.log("Project ID not found");
      Toast.show({ type: "error" });
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      const data = await sendApiRequest(
        session,
        "POST",
        "user/notifications",
        {},
        {
          body: JSON.stringify({
            type: "EXPO",
            tokens: pushTokenString,
            deviceType: Device.deviceType,
            deviceName: Device.deviceName || "Unknown device",
          }),
        }
      );
      console.error(data);
      return pushTokenString;
    } catch (e: unknown) {
      console.log(e);
      Toast.show({ type: "error" });
    }
  } else {
    console.error("Must use physical device for push notifications");
    Toast.show({ type: "error" });
  }
}

async function registerForWebPushNotificationsAsync(session) {
  const base64ToUint8Array = (base64) => {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(b64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };
  if (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    window.workbox !== undefined
  ) {
    // run only in browser
    navigator.serviceWorker.ready.then(async (reg) => {
      await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8Array(
          process.env.EXPO_PUBLIC_WEB_PUSH_API_KEY
        ),
      });
      reg.pushManager.getSubscription().then((sub) => {
        if (
          sub &&
          !(
            sub.expirationTime &&
            Date.now() > sub.expirationTime - 5 * 60 * 1000
          )
        ) {
          console.log(sub);
          console.log("web push subscribed!");

          sendApiRequest(
            session,
            "POST",
            "user/notifications",
            {},
            {
              body: JSON.stringify({
                type: "WEB",
                tokens: sub.toJSON(),
                deviceType: Device.deviceType || 0,
                deviceName:
                  navigator.userAgent.split("(")[1].split(";")[0] ||
                  "Unknown device",
              }),
            }
          );
          return sub;
        }
      });
    });
  }
}

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

const TestNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useSession();
  const handleTest = async () => {
    setIsLoading(true);
    await sendApiRequest(session, "POST", "user/notifications/test");
    setIsLoading(false);
  };

  return (
    <Button
      onPress={handleTest}
      variant="filled"
      large
      style={{ marginTop: 20 }}
      isLoading={isLoading}
    >
      <ButtonText style={{ fontSize: 20 }} weight={700}>
        Show an example
      </ButtonText>
      <Icon bold>send</Icon>
    </Button>
  );
};

export default function Page() {
  const { session } = useSession();
  const theme = useColorTheme();

  const { data, mutate, error } = useSWR(["user/notifications"]);

  const [settings, setSettings] = useState({ "task-reminders": true });

  useEffect(() => {
    if (Platform.OS === "web") registerForWebPushNotificationsAsync(session);
    else registerForPushNotificationsAsync(session);
  }, [session]);

  const handleDelete = async (id: string) => {
    sendApiRequest(session, "DELETE", "user/notifications", {
      id,
    });
    mutate((oldData) => oldData.filter((device) => device.id !== id), {
      revalidate: false,
    });
  };

  return (
    <SettingsLayout>
      <Text style={settingStyles.title}>Notifications</Text>
      <Text weight={600}>
        Here, you can control how much you want to be{" "}
        <Text
          weight={600}
          style={{
            textDecorationLine: "line-through",
            color: addHslAlpha(theme[12], 0.6),
          }}
        >
          annoyed
        </Text>{" "}
        notified.
      </Text>

      <Alert
        style={{ marginTop: 20, marginBottom: -5 }}
        emoji="1f6a7"
        title="Work in progress"
        subtitle="We're working hard to add notifications to the app. Stay tuned!"
      />

      <TestNotifications />
      {data && data.length > 0 && (
        <Text style={settingStyles.heading}>Manage devices</Text>
      )}
      {data ? (
        data.map((device) => (
          <ListItemButton
            variant="filled"
            disabled
            key={device.id}
            style={{ marginBottom: 10 }}
          >
            <Icon>{icons[device.deviceType]}</Icon>
            <ListItemText
              primary={device.deviceName}
              secondary={type[device.deviceType]}
            />
            <IconButton
              onPress={() => handleDelete(device.id)}
              icon="close"
              variant="outlined"
            />
          </ListItemButton>
        ))
      ) : error ? (
        <ErrorAlert />
      ) : (
        <Spinner />
      )}

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
