import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import Alert from "@/ui/Alert";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Original Title",
    body: "And here is the body!",
    data: { someData: "goes here" },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
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
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
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

export default function Page() {
  const values = {
    "task-reminders": true,
  };
  const [settings, setSettings] = useState(values);

  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error: any) => setExpoPushToken(`${error}`));

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <SettingsLayout>
      <Text style={settingStyles.title}>Notifications</Text>
      <Button
        onPress={async () => {
          await sendPushNotification(expoPushToken);
        }}
      >
        <ButtonText>Press to Send Notification</ButtonText>
      </Button>
      <Text>Your Expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text>
          Title: {notification && notification.request.content.title}{" "}
        </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>
          Data:{" "}
          {notification && JSON.stringify(notification.request.content.data)}
        </Text>
      </View>

      <Text>
        Here, you can control how much you want to be{" "}
        <Text style={{ textDecorationLine: "line-through", opacity: 0.4 }}>
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
