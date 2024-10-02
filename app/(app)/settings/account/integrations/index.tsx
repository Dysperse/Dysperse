import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import Alert from "@/ui/Alert";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Icon from "@/ui/Icon";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Fragment } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import useSWR from "swr";

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  button: {
    flex: 1,
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    minHeight: 80,
    alignItems: "center",
    gap: 20,
    flexDirection: "row",
  },
  image: {
    borderRadius: 5,
    width: 25,
    height: 25,
  },
  name: { fontSize: 16 },
  description: { opacity: 0.6 },
});

function AllIntegrations({ connected }) {
  const theme = useColorTheme();
  const { data } = useSWR(["space/integrations/about"]);

  const isConnected = (integration, connected) =>
    connected?.find((i) => i.integration.name === integration.slug);

  return (
    <>
      {!data ? (
        <View style={styles.loadingContainer}>
          <Spinner />
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {data.map((integration) => (
            <Pressable
              key={integration.name}
              style={({ pressed, hovered }) => [
                styles.button,
                {
                  backgroundColor: theme[pressed ? 4 : hovered ? 3 : 2],
                  opacity:
                    integration.name === "Notion" ||
                    integration.name === "Gmail"
                      ? 0.5
                      : 1,
                },
              ]}
              onPress={() =>
                router.replace(
                  `/settings/account/integrations/${integration.slug}`
                )
              }
              disabled={
                integration.name === "Notion" || integration.name === "Gmail"
              }
            >
              <Avatar size={40}>
                <Image
                  source={{ uri: integration.icon }}
                  style={styles.image}
                />
              </Avatar>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} weight={700} style={styles.name}>
                  {integration.name}
                </Text>
                <Text numberOfLines={1} weight={300} style={styles.description}>
                  {integration.description}
                </Text>
              </View>
              {isConnected(integration, connected) && <Icon>check</Icon>}
            </Pressable>
          ))}
        </View>
      )}
    </>
  );
}

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

export default function Page() {
  const theme = useColorTheme();
  const { session } = useUser();
  const { data } = useSWR(["space/integrations"]);

  const { data: integrationsList } = useSWR("/integrations.json", (t) =>
    fetch(t).then((t) => t.json())
  );

  return (
    <SettingsScrollView>
      <Text style={settingStyles.title}>Integrations</Text>
      <Text style={{ fontSize: 17, opacity: 0.7 }}>
        Connect calendars with Dysperse for a seamless experience
      </Text>
      {process.env.NODE_ENV !== "development" && (
        <Alert
          style={{ marginTop: 20 }}
          emoji="1f6a7"
          title="Coming soon"
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
          integrationsList.map((item) => {
            const Container =
              item.slug === "spotify" ? SpotifyIntegration : Fragment;

            const hasConnected = data.find(
              (i) => item.slug === i.integration?.name
            );

            const showCheck =
              item.slug === "email-forwarding" ||
              (item.slug === "spotify" &&
                session.user?.profile?.spotifyAuthTokens) ||
              hasConnected;

            return (
              <View
                style={{
                  width: "50%",
                  padding: 10,
                }}
              >
                <Container>
                  <Button
                    variant="filled"
                    height={"auto"}
                    containerStyle={{ borderRadius: 20, flex: 1 }}
                    style={{
                      padding: 15,
                      flexDirection: "column",
                      flex: 1,
                      gap: 0,
                      justifyContent: "flex-start",
                      alignItems: "flex-start",
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
          })
        )}
      </View>

      {/* <AllIntegrations connected={data} /> */}
    </SettingsScrollView>
  );
}
