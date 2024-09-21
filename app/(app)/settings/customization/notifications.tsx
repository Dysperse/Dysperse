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
import SettingsScrollView from "@/ui/SettingsScrollView";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
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

async function registerForPushNotificationsAsync() {
  if (Platform.OS !== "web") {
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

        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log(response);
        });

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
}

async function registerForWebPushNotificationsAsync() {
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
    const reg = await navigator.serviceWorker.ready;

    await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(
        process.env.EXPO_PUBLIC_WEB_PUSH_API_KEY
      ),
    });

    const sub = await reg.pushManager.getSubscription();

    if (
      sub &&
      !(sub.expirationTime && Date.now() > sub.expirationTime - 5 * 60 * 1000)
    ) {
      return sub;
    }

    return null; // Return null if no valid subscription found
  }

  return null; // Return null if service worker or workbox is not supported
}

const notificationSettings = [
  {
    name: "Collections",
    options: [
      {
        key: "COLLECTION_INVITE",
        name: "Invite",
        description: "Notify me when I'm invited to a collection",
      },
      {
        key: "COLLECTION_ITEM_CREATE",
        name: "Create",
        description: "Notify me when a new entity is created in a collection",
      },
      {
        key: "COLLECTION_ITEM_UPDATE",
        name: "Edit",
        description: "Notify me when labels are edited in a collection",
      },
    ],
  },
  {
    name: "Entities",
    options: [
      {
        key: "ENTITY_START",
        name: "Task due dates",
        description: "Notify me when a task is due",
      },
      {
        key: "PLAN_DAY",
        name: "Plan my day",
        description: "Remind me to plan my day every morning",
      },
    ],
  },
  {
    name: "Friends",
    options: [
      {
        key: "FRIEND_REQUEST_ME",
        name: "Friend requests",
        description: "Notify me when someone sends me a friend request",
      },
      {
        key: "FRIEND_REQUEST_OTHER",
        name: "Friend requests",
        description: "Notify me when someone accepts my friend request",
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
        key: "MFA_CODES",
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
    const data = await sendApiRequest(
      session,
      "POST",
      "user/notifications/test"
    );
    console.log(data);
    setIsLoading(false);
  };

  return (
    <Button
      onPress={handleTest}
      variant="filled"
      large
      containerStyle={{ marginTop: 20 }}
      isLoading={isLoading}
    >
      <ButtonText style={{ fontSize: 20 }} weight={700}>
        Show an example
      </ButtonText>
      <Icon bold>send</Icon>
    </Button>
  );
};

export function useDeviceNotificationState() {
  const [state, setState] = useState<"granted" | "denied" | "prompt">();

  useEffect(() => {
    if (Platform.OS === "web") {
      navigator.permissions
        .query({ name: "notifications" })
        .then((permissionStatus) => {
          permissionStatus.onchange = () => {
            setState(permissionStatus.state);
          };
          setState(permissionStatus.state);
        });
    } else {
      Notifications.getPermissionsAsync().then(({ status }) => {
        setState(status === "undetermined" ? "prompt" : status);
      });
    }
  }, []);

  return state;
}

export function SubscribeButton({
  data,
  mutate,
  text,
  onSuccess,
}: {
  data: any;
  mutate: any;
  text?: string;
  onSuccess?: () => void;
}) {
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [tokenExists, setTokenExists] = useState(false);

  const checkIfTokensExist = useCallback(async () => {
    if (globalThis.IN_DESKTOP_ENV && globalThis.FCM_DEVICE_TOKEN) {
      const deviceToken = globalThis.FCM_DEVICE_TOKEN;
      setTokenExists(
        data?.subscriptions?.find?.(({ tokens }) => tokens === deviceToken)
      );
    } else if (Platform.OS === "web") {
      const webTokens = await registerForWebPushNotificationsAsync();

      setTokenExists(
        data?.subscriptions?.find?.(
          ({ tokens }) => tokens?.endpoint === webTokens?.endpoint
        )
      );
    } else {
      const expoTokens = await registerForPushNotificationsAsync();
      setTokenExists(
        data?.subscriptions?.find?.(({ tokens }) => tokens === expoTokens)
      );
    }
  }, [data]);

  useEffect(() => {
    checkIfTokensExist();
  }, [checkIfTokensExist]);

  const handlePress = async () => {
    setIsLoading(true);
    if (globalThis.IN_DESKTOP_ENV && globalThis.FCM_DEVICE_TOKEN) {
      await sendApiRequest(
        session,
        "POST",
        "user/notifications",
        {},
        {
          body: JSON.stringify({
            type: "FCM",
            tokens: globalThis.FCM_DEVICE_TOKEN,
            deviceType: Device.deviceType || 0,
            deviceName:
              navigator.userAgent.split("(")[1].split(";")[0] ||
              "Unknown device",
          }),
        }
      );
    } else if (Platform.OS === "web") {
      const sub: any = await registerForWebPushNotificationsAsync();
      await sendApiRequest(
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
    } else {
      const pushTokenString = await registerForPushNotificationsAsync();
      await sendApiRequest(
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
    }

    await mutate();
    Toast.show({
      type: "success",
      text1: "You'll receive notifications on this device!",
    });
    await onSuccess?.();
    setIsLoading(false);
  };

  return (
    <Button
      isLoading={isLoading || !data}
      disabled={Boolean(tokenExists)}
      onPress={handlePress}
      variant={tokenExists ? "outlined" : "filled"}
      bold
      large
      height={60}
      text={
        text ||
        (tokenExists
          ? "Notifications enabled"
          : "Enable notifications on this device")
      }
    ></Button>
  );
}

function NotificationPreferences({ data, mutate }) {
  const { session } = useSession();

  const handleToggle = async () => {
    sendApiRequest(session, "PUT", "user/notifications", {
      key: "groupNotifications",
      value: data.settings.groupNotifications ? "false" : "true",
    });
    mutate(
      (oldData) => ({
        ...oldData,
        settings: {
          ...oldData.settings,
          groupNotifications: !oldData.settings.groupNotifications,
        },
      }),
      { revalidate: false }
    );
  };

  return (
    <ListItemButton onPress={handleToggle}>
      <ListItemText
        primary="Group notifications?"
        secondary={
          "When you have many notifications, we'll group them together in a single notification. \nTurn this off if you like getting spammed."
        }
      />
      <Icon size={40}>
        toggle_{data.settings.groupNotifications ? "on" : "off"}
      </Icon>
    </ListItemButton>
  );
}

export default function Page() {
  const { session } = useSession();
  const theme = useColorTheme();

  const { data, mutate, error } = useSWR(["user/notifications"]);

  const handleDelete = async (id: string) => {
    await sendApiRequest(session, "DELETE", "user/notifications", {
      id,
    });
    await mutate();
  };

  function handleToggle(key: string) {
    sendApiRequest(session, "PUT", "user/notifications", {
      key,
      value: data.settings[key] ? "false" : "true",
    });
    mutate(
      (oldData) => ({
        ...oldData,
        settings: {
          ...oldData.settings,
          [key]: !oldData.settings[key],
        },
      }),
      { revalidate: false }
    );
  }

  return (
    <SettingsScrollView>
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
      <Text style={settingStyles.heading}>Preferences</Text>
      {data?.settings ? (
        <NotificationPreferences mutate={mutate} data={data} />
      ) : (
        <Spinner />
      )}
      <Text style={settingStyles.heading}>Manage devices</Text>
      <SubscribeButton data={data} mutate={mutate} />
      {data ? (
        data?.subscriptions?.map?.((device) => (
          <ListItemButton
            variant="filled"
            disabled
            key={device.id}
            style={{ marginBottom: 10 }}
          >
            <Icon>{icons[device.deviceType]}</Icon>
            <ListItemText
              primary={device.deviceName}
              secondary={`${type[device.deviceType]} ${
                device.type === "FCM" ? "App" : ""
              }`}
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
                marginHorizontal: -10,
                ...(option.forceChecked && {
                  opacity: 0.2,
                }),
              }}
              onPress={() => handleToggle(option.key)}
            >
              <ListItemText
                primary={option.name}
                secondary={option.description}
              />
              <Icon
                size={50}
                style={{
                  opacity:
                    data?.settings?.[option.key] || option.forceChecked
                      ? 1
                      : 0.4,
                }}
              >
                {data?.settings?.[option.key] || option.forceChecked
                  ? "toggle_on"
                  : "toggle_off"}
              </Icon>
            </ListItemButton>
          ))}
        </View>
      ))}
    </SettingsScrollView>
  );
}

