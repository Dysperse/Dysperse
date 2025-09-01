import { settingStyles } from "@/components/settings/settingsStyles";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { showErrorToast } from "@/utils/errorToast";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { toast } from "sonner-native";
import useSWR from "swr";
import { Section } from "../tasks";

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
        showErrorToast();
        return;
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        showErrorToast();
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;

        return pushTokenString;
      } catch (e: unknown) {
        console.log(e);
        showErrorToast();
      }
    } else {
      console.error("Must use physical device for push notifications");
      showErrorToast();
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
    await Notification.requestPermission();

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
    return null;
  }

  return null;
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
    ],
  },
  {
    name: "Tasks",
    options: [
      {
        key: "ENTITY_START",
        name: "Task due dates",
        description: "Notify me when a task is due",
      },
      {
        key: "EMAIL_FORWARDING",
        name: "Email forwarding",
        description:
          "Get a confirmation when Dysperse processes an email you forwarded",
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
        key: "FRIEND_REQUEST_SEND",
        name: "Friend requests",
        description: "Notify me when someone sends me a friend request",
      },
      {
        key: "FRIEND_REQUEST_ACCEPT",
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
    await sendApiRequest(session, "POST", "user/notifications/test");

    setIsLoading(false);
  };

  return (
    <Button
      height={60}
      onPress={handleTest}
      variant="filled"
      large
      text="Show an example"
      icon="send"
      containerStyle={{ flex: 1 }}
      iconPosition="end"
      isLoading={isLoading}
    />
  );
};

export function useDeviceNotificationState() {
  const [state, setState] = useState<"granted" | "denied" | "prompt">();

  useEffect(() => {
    if (Platform.OS === "web") {
      if ("Notification" in window)
        setState(
          Notification.permission === "default"
            ? "prompt"
            : Notification.permission
        );
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
  settings,
  disableAutoCheck,
}: {
  data: any;
  mutate: any;
  text?: string;
  onSuccess?: () => void;
  settings?: boolean;
  disableAutoCheck?: boolean;
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
          ({ tokens }) => webTokens && tokens?.endpoint === webTokens?.endpoint
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
    if (!disableAutoCheck) checkIfTokensExist();
  }, [checkIfTokensExist, disableAutoCheck]);

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
            tokens: sub?.toJSON?.(),
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
    toast.success("You'll receive notifications on this device!");
    await onSuccess?.();
    setIsLoading(false);
  };

  return (
    <>
      <Button
        isLoading={isLoading || !data}
        disabled={Boolean(tokenExists)}
        onPress={handlePress}
        variant={tokenExists ? "outlined" : "filled"}
        bold={!settings}
        large
        height={60}
        containerStyle={[settings && [{ flex: 1 }]]}
        text={
          text ||
          (tokenExists
            ? "Notifications enabled"
            : `Enable${settings ? "" : " notifications"} on this device`)
        }
        icon={
          settings ? (tokenExists ? "check_circle" : "add_circle") : undefined
        }
        iconPosition="end"
      />
      {/* <Text>{JSON.stringify(tokenExists)}</Text> */}
    </>
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
          "When you have many notifications, we'll group them together in a single one."
        }
      />
      <Icon
        size={50}
        style={{ opacity: data.settings.groupNotifications ? 1 : 0.4 }}
      >
        toggle_{data.settings.groupNotifications ? "on" : "off"}
      </Icon>
    </ListItemButton>
  );
}
function AppBadging({ notificationData, mutateSettings }) {
  const { session } = useSession();
  const { data, error } = useSWR(["space/collections"]);

  return error ? (
    <ErrorAlert />
  ) : !data ? (
    <Spinner />
  ) : data.length == 0 ? null : (
    <>
      <Text style={settingStyles.heading}>App badging</Text>
      <Section>
        {data?.map((collection) => (
          <ListItemButton
            key={collection.id}
            onPress={() => {
              sendApiRequest(session, "PATCH", "user/notifications", {
                collectionId: collection.id,
                operation:
                  notificationData.settings.badgedCollections?.includes(
                    collection.id
                  )
                    ? "remove"
                    : "add",
              });
              mutateSettings(
                (oldData) => ({
                  ...oldData,
                  settings: {
                    ...oldData.settings,
                    badgedCollections:
                      notificationData.settings.badgedCollections?.includes(
                        collection.id
                      )
                        ? oldData.settings.badgedCollections.filter(
                            (id) => id !== collection.id
                          )
                        : [
                            ...oldData.settings.badgedCollections,
                            collection.id,
                          ],
                  },
                }),
                { revalidate: false }
              );
            }}
          >
            <Emoji emoji={collection.emoji} />
            <ListItemText primary={collection.name} />
            <Icon
              size={50}
              style={{
                marginVertical: -10,
                opacity: notificationData.settings.badgedCollections?.includes(
                  collection.id
                )
                  ? 1
                  : 0.4,
              }}
            >
              {notificationData.settings.badgedCollections?.includes(
                collection.id
              )
                ? "toggle_on"
                : "toggle_off"}
            </Icon>
          </ListItemButton>
        ))}
      </Section>
    </>
  );
}
export default function Page() {
  const { session } = useSession();
  const breakpoints = useResponsiveBreakpoints();
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
      <View
        style={{
          flexDirection: breakpoints.md ? "row" : undefined,
          gap: 10,
          marginTop: 10,
        }}
      >
        <SubscribeButton settings data={data} mutate={mutate} />
        {data?.subscriptions?.length > 0 && <TestNotifications />}
      </View>
      <Text style={settingStyles.heading}>Preferences</Text>
      {data?.settings ? (
        <NotificationPreferences mutate={mutate} data={data} />
      ) : (
        <Spinner />
      )}
      <Text style={settingStyles.heading}>Manage devices</Text>
      {data ? (
        data?.subscriptions?.map?.((device) => (
          <ListItemButton
            variant="filled"
            disabled
            key={device.id}
            style={{ marginTop: 10 }}
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
      <AppBadging notificationData={data} mutateSettings={mutate} />
      <View style={{ height: 80 }} />
    </SettingsScrollView>
  );
}

