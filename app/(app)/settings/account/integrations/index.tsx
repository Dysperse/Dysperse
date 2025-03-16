import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import Alert from "@/ui/Alert";
import { Button } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Icon from "@/ui/Icon";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { setStringAsync } from "expo-clipboard";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Fragment } from "react";
import { Linking, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

function SpotifyIntegration({ children }) {
  const { session, sessionToken, mutate } = useUser();

  const handleSpotifyAuthorization = () => {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/user/currently-playing/redirect?token=${sessionToken}`;
    Linking.openURL(url);
  };

  const disconnectSpotify = async () => {
    await sendApiRequest(
      sessionToken,
      "PUT",
      "user/profile",
      {},
      {
        body: JSON.stringify({ spotifyAuthTokens: "null" }),
      }
    );
    await mutate();
  };
  return (
    <ConfirmationModal
      title="Unlink Spotify?"
      secondary="You can always re-connect it later."
      onSuccess={async () => {
        if (session.user?.profile?.spotifyAuthTokens) await disconnectSpotify();
        else handleSpotifyAuthorization();
      }}
      disabled={!session.user?.profile?.spotifyAuthTokens}
    >
      {children}
    </ConfirmationModal>
  );
}

const IntegrationItem = ({ item, data }) => {
  const theme = useColorTheme();
  const { session } = useUser();

  const Container = item.slug === "spotify" ? SpotifyIntegration : Fragment;

  const hasConnected = data?.find?.((i) => item.slug === i.integration?.name);

  const showCheck =
    item.slug === "email-forwarding" ||
    item.slug === "ical-feed" ||
    (item.slug === "spotify" && session.user?.profile?.spotifyAuthTokens) ||
    hasConnected;

  return (
    <View
      key={item.slug}
      style={{
        width: "50%",
        padding: 10,
      }}
    >
      <Container>
        <Button
          variant={showCheck ? "filled" : "outlined"}
          height={"auto" as any}
          containerStyle={{ borderRadius: 20, flex: 1 }}
          style={{
            padding: 15,
            flexDirection: "column",
            flex: 1,
            borderRadius: 0,
            gap: 0,
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
          onPress={() => {
            if (item.slug === "ical-feed") {
              setStringAsync(
                "https://api.dysperse.com/ical/" + session.space?.id
              );
              Toast.show({ type: "success", text1: "Copied to clipboard" });
              return;
            }
            if (item.navigate === false) return;
            if (item.comingSoon)
              Toast.show({ type: "info", text1: "Coming soon!" });
            else router.push(`/settings/account/integrations/${item.slug}`);
          }}
        >
          {showCheck && (
            <Icon
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                margin: 10,
              }}
              size={30}
              filled
            >
              check_circle
            </Icon>
          )}
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 20,
              backgroundColor: theme[5],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {item.icon.startsWith("https") ? (
              <Image
                source={{ uri: item.icon }}
                contentFit="contain"
                style={{ height: 30, width: 30 }}
              />
            ) : (
              <Icon size={30}>{item.icon}</Icon>
            )}
          </View>
          <Text
            weight={700}
            style={{ color: theme[12], fontSize: 20, marginTop: 10 }}
          >
            {item.name}
          </Text>
          <Text style={{ color: theme[11], opacity: 0.8 }}>
            {item.description}
          </Text>
        </Button>
      </Container>
    </View>
  );
};

export default function Page() {
  const { data } = useSWR(["space/integrations"]);

  const { data: integrationsList } = useSWR(
    `${
      process.env.NODE_ENV === "development"
        ? "/integrations.json"
        : "https://app.dysperse.com/integrations.json"
    }`,
    (t) => fetch(t).then((t) => t.json())
  );

  return (
    <SettingsScrollView>
      <Text style={settingStyles.title}>Integrations</Text>
      <Text style={{ fontSize: 17, opacity: 0.7 }}>
        Connect your apps with Dysperse for a seamless experience
      </Text>
      {process.env.NODE_ENV !== "development" && (
        <Alert
          style={{ marginTop: 20 }}
          emoji="1f6a7"
          title="This feature may be unstable for now"
          subtitle="Soon, you'll be able to connect your account to other services like
      Notion, Google Calendar, and more."
        />
      )}
      <View
        style={{
          marginHorizontal: -10,
          marginTop: 10,
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {!data || !integrationsList ? (
          <View style={{ padding: 10 }}>
            <Spinner />
          </View>
        ) : (
          integrationsList.map((item) => (
            <IntegrationItem key={item.name} data={data} item={item} />
          ))
        )}
      </View>
    </SettingsScrollView>
  );
}

