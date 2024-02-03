import { SettingsLayout } from "@/components/settings/layout";
import Alert from "@/ui/Alert";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import useSWR from "swr";

export default function Page() {
  const theme = useColorTheme();
  const { data } = useSWR(["space/integrations"]);

  return (
    <SettingsLayout>
      <Text heading style={{ fontSize: 50 }}>
        Integrations
      </Text>
      <Text>
        Introducing more chaos. Connect everything to your workspace, so you can
        see everything in one place.
      </Text>
      <Alert
        style={{ marginTop: 20 }}
        emoji="1f6a7"
        title="Coming soon"
        subtitle="Soon, you'll be able to connect your account to other services like
      Notion, Google Calendar, and more."
      />

      {!data ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Spinner />
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {data.map((integration) => (
            <Pressable
              key={integration.name}
              style={({ pressed, hovered }: any) => ({
                flex: 1,
                padding: 10,
                paddingHorizontal: 20,
                borderRadius: 20,
                alignItems: "center",
                gap: 20,
                flexDirection: "row",
                backgroundColor: theme[pressed ? 4 : hovered ? 3 : 2],
              })}
              onPress={() =>
                router.replace(
                  `/settings/space/integrations/${integration.slug}`
                )
              }
            >
              <Image
                source={{ uri: integration.icon }}
                style={{
                  width: 30,
                  height: 30,
                }}
              />
              <View>
                <Text weight={700} style={{ fontSize: 16 }}>
                  {integration.name}
                </Text>
                <Text weight={300} style={{ opacity: 0.6 }}>
                  {integration.description}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </SettingsLayout>
  );
}
