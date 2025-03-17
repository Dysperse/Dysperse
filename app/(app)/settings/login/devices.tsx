import { settingStyles } from "@/components/settings/settingsStyles";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import ListItemText from "@/ui/ListItemText";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { Platform, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR, { KeyedMutator } from "swr";

export function SessionCard({
  mutate,
  session,
}: {
  mutate: KeyedMutator<any>;
  session: any;
}) {
  const theme = useColorTheme();
  const { session: currentSession } = useSession();

  const isCurrentDevice = session.id === currentSession;

  const handleDelete = async () => {
    try {
      sendApiRequest(currentSession, "DELETE", "user/sessions", {
        id: session.id,
      });
      mutate((data) => data.filter((i: any) => i.id !== session.id), {
        revalidate: false,
      });
      Toast.show({ type: "success", text1: "Signed out!" });
    } catch (e) {
      Toast.show({ type: "error" });
    }
  };

  const type = ["Unknown", "Phone", "Tablet", "Desktop", "TV"];
  const icons = [
    "device_unknown",
    "phone_iphone",
    "tablet_mac",
    "desktop_mac",
    "tv_gen",
  ];

  const { data } = useSWR(["user/sessions/device", { ip: session.ip }]);
  const dark = useDarkMode();

  const breakpoints = useResponsiveBreakpoints();
  return (
    <View
      style={[
        !breakpoints.md && { padding: 0 },
        {
          marginBottom: 15,
          backgroundColor: theme[isCurrentDevice ? 3 : 0],
          padding: 10,
          borderRadius: breakpoints.md ? 25 : 25,
          borderWidth: 1,
          borderColor: theme[5],
          gap: 20,
          flexDirection: breakpoints.md ? "row" : "column-reverse",
        },
      ]}
    >
      <View style={{ flex: 1, gap: 10, justifyContent: "center" }}>
        <View>
          {data?.city && (
            <View style={{ padding: 10 }}>
              <Text variant="eyebrow">
                {dayjs(session.timestamp).fromNow()}
              </Text>
              <Text style={[{ fontSize: 30 }]}>
                {data?.city?.names?.en}, {data?.subdivisions?.[0]?.names?.en}
              </Text>
            </View>
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            marginTop: -20,
            gap: 10,
          }}
        >
          <Avatar size={40}>
            <Icon>{icons[session.deviceType] || icons[0]}</Icon>
          </Avatar>
          <ListItemText
            primary={
              session.name || type[session.deviceType] || "Unknown device"
            }
            secondary={session.ip}
          />
        </View>
        <ConfirmationModal
          title="Sign out?"
          secondary="You'll need to log in again on this device."
          onSuccess={handleDelete}
          height={360}
        >
          <Button
            variant="filled"
            style={[
              { paddingHorizontal: 20 },
              isCurrentDevice && {
                opacity: 0.5,
                backgroundColor: theme[5],
              },
            ]}
            containerStyle={{ margin: 7, marginTop: -5 }}
            disabled={isCurrentDevice}
          >
            <ButtonText>
              {isCurrentDevice ? "This device" : "Log out"}
            </ButtonText>
          </Button>
        </ConfirmationModal>
      </View>
      {data?.preview ? (
        <Image
          source={{ uri: data?.preview }}
          style={{
            ...(Platform.OS === "web" &&
              dark && {
                filter: "invert(5) brightness(2) contrast(0.8)",
              }),
            width: breakpoints.md ? 300 : "100%",
            height: breakpoints.md ? 300 : undefined,
            borderRadius: 25,
            maxWidth: "100%",
            aspectRatio: "1/1",
          }}
        />
      ) : (
        <View
          style={{
            width: breakpoints.md ? 300 : "100%",
            height: breakpoints.md ? 300 : undefined,
            borderRadius: 25,
            backgroundColor: theme[4],
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "100%",
            aspectRatio: "1/1",
          }}
        >
          <Text style={{ opacity: 0.6, textAlign: "center" }}>
            No preview available
          </Text>
        </View>
      )}
    </View>
  );
}

export default function Page() {
  const { session } = useSession();
  const { data, mutate, error } = useSWR(["user/sessions"]);

  const handleSignOutAllDevices = () => {
    try {
      sendApiRequest(session, "DELETE", "user/sessions", {
        id: session,
        all: "true",
      });
      mutate((d) => d.filter((i: any) => i.id === session), {
        revalidate: false,
      });
      Toast.show({ type: "success", text1: "Signed out!" });
    } catch (e) {
      Toast.show({ type: "error" });
    }
  };

  return (
    <SettingsScrollView>
      {Array.isArray(data) ? (
        <FlashList
          estimatedItemSize={330}
          data={data.sort((a) => (a.id === session ? -1 : 0))}
          ListHeaderComponent={() => (
            <View style={{ marginBottom: 20, paddingTop: 50 }}>
              <Text style={settingStyles.title}>Devices</Text>
              <Text style={{ opacity: 0.6 }}>
                See where else you're logged in here
              </Text>
              <ConfirmationModal
                onSuccess={handleSignOutAllDevices}
                height={430}
                title="Sign out from all devices?"
                secondary="We won't log you out of this one"
              >
                <Button
                  variant="filled"
                  bold
                  text="Sign out from all devices"
                  height={60}
                  containerStyle={{ marginTop: 20 }}
                />
              </ConfirmationModal>
            </View>
          )}
          style={{ flex: 1, width: "100%" }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SessionCard mutate={mutate} session={item} />
          )}
          keyExtractor={(i) => i.id}
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          {error ? <ErrorAlert /> : <Spinner />}
        </View>
      )}
    </SettingsScrollView>
  );
}
