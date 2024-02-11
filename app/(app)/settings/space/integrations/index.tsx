import { SettingsLayout } from "@/components/settings/layout";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import Alert from "@/ui/Alert";
import { ButtonGroup } from "@/ui/ButtonGroup";
import ConfirmationModal from "@/ui/ConfirmationModal";
import ErrorAlert from "@/ui/Error";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import useSWR from "swr";

function AllIntegrations() {
  const theme = useColorTheme();
  const { data } = useSWR(["space/integrations/about"]);

  return (
    <>
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
                  borderRadius: 5,
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
    </>
  );
}

function Connected() {
  const theme = useColorTheme();
  const { session } = useSession();
  const { data, mutate, error } = useSWR(["space/integrations"]);

  const handleDelete = (id) => async () => {
    mutate(
      data.filter((i) => i.integration.id !== id),
      { revalidate: false }
    );

    sendApiRequest(session, "DELETE", "space/integrations/", { id });
  };

  return (
    <>
      {data ? (
        data.length === 0 ? (
          <Alert
            title="No integrations connected"
            emoji="1f9d0"
            subtitle="Connect your workspace to other services to see them here."
          />
        ) : (
          <View style={{ paddingBottom: 50, paddingTop: 20 }}>
            {data.map(({ integration, about }) => (
              <View
                key={integration.id}
                style={{
                  flexDirection: "row",
                  padding: 20,
                  paddingHorizontal: 30,
                  borderRadius: 20,
                  gap: 20,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: theme[4],
                  alignItems: "center",
                }}
              >
                <Image
                  source={{ uri: about.icon }}
                  style={{ width: 30, height: 30, marginTop: 5 }}
                />
                <View>
                  <Text style={{ fontSize: 20 }} weight={600}>
                    {about.name}
                  </Text>
                </View>
                <ConfirmationModal
                  title="Disconnect?"
                  secondary="All tasks connected to this integration will be removed"
                  onSuccess={handleDelete(integration.id)}
                  height={400}
                >
                  <IconButton
                    icon="remove_circle"
                    style={{ marginLeft: "auto" }}
                  />
                </ConfirmationModal>
              </View>
            ))}
          </View>
        )
      ) : error ? (
        <ErrorAlert />
      ) : (
        <Spinner />
      )}
    </>
  );
}

export default function Page() {
  const [filter, setFilter] = useState("All");

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

      <ButtonGroup
        state={[filter, setFilter]}
        buttonStyle={{ width: 130 }}
        containerStyle={{
          justifyContent: "center",
          width: "100%",
          marginBottom: 10,
        }}
        scrollContainerStyle={{ width: "100%" }}
        options={[
          { value: "All", label: "All" },
          { value: "Connected", label: "Connected" },
        ]}
      />
      {filter === "All" && <AllIntegrations />}
      {filter === "Connected" && <Connected />}
    </SettingsLayout>
  );
}
