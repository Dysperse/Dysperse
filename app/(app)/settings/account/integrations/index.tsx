import { settingStyles } from "@/components/settings/settingsStyles";
import Alert from "@/ui/Alert";
import { Avatar } from "@/ui/Avatar";
import Icon from "@/ui/Icon";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
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

export default function Page() {
  const theme = useColorTheme();
  const { data } = useSWR(["space/integrations"]);

  return (
    <SettingsScrollView>
      <Text style={settingStyles.title}>Integrations</Text>
      <Text style={{ fontSize: 17, opacity: 0.7 }}>
        Introducing more chaos. Continue using all your favorite tools,
        alongside #dysperse.
      </Text>
      <Alert
        style={{ marginTop: 20 }}
        emoji="1f6a7"
        title="Coming soon"
        subtitle="Soon, you'll be able to connect your account to other services like
      Notion, Google Calendar, and more."
      />

      <Pressable
        style={({ pressed, hovered }) => [
          styles.button,
          {
            backgroundColor: theme[pressed ? 4 : hovered ? 3 : 2],
          },
        ]}
      >
        <Avatar icon="email" size={40} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} weight={700} style={styles.name}>
            Email forwarding
          </Text>
          <Text numberOfLines={1} weight={300} style={styles.description}>
            Send emails to tasks@dysperse.com and they'll show up in your list!
          </Text>
        </View>
        <Icon>check</Icon>
      </Pressable>
      <AllIntegrations connected={data} />
    </SettingsScrollView>
  );
}
