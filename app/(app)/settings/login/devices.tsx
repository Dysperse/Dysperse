import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { Button, ButtonText } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { View } from "react-native";
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

  return (
    <View style={{ height: 85 }}>
      <ListItemButton
        variant={isCurrentDevice ? "filled" : "outlined"}
        disabled
      >
        <Icon>{icons[session.deviceType || 0]}</Icon>
        <ListItemText
          truncate
          primary={session.name || type[session.deviceType] || "Unknown device"}
          secondary={`${session.ip} • ${dayjs(session.timestamp).fromNow()}`}
        />
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
            disabled={isCurrentDevice}
          >
            <ButtonText>
              {isCurrentDevice ? "This device" : "Log out"}
            </ButtonText>
          </Button>
        </ConfirmationModal>
      </ListItemButton>
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
    <SettingsLayout noScroll>
      {Array.isArray(data) ? (
        <FlashList
          estimatedItemSize={85}
          data={data.sort((a) => (a.id === session ? -1 : 0))}
          ListHeaderComponent={() => (
            <View style={{ marginBottom: 20, paddingTop: 50 }}>
              <Text style={settingStyles.title}>Devices</Text>
              <Text style={{ opacity: 0.6 }}>
                Forgot to log out of someone else's device? Seeing any weird
                activity?
                {"\n"}No worries, you can log out here.
              </Text>
              <ConfirmationModal
                onSuccess={handleSignOutAllDevices}
                height={430}
                title="Sign out all devices?"
                secondary="You won't be logged out of this device."
              >
                <Button
                  variant="outlined"
                  style={{ height: 60, marginTop: 20 }}
                >
                  <ButtonText>Sign out all devices</ButtonText>
                </Button>
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
    </SettingsLayout>
  );
}
