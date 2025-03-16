import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { Redirect, router, useGlobalSearchParams } from "expo-router";
import { View } from "react-native";
import useSWR from "swr";

function IntegrationList({ integrations, about }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { name } = useGlobalSearchParams();

  return (
    <FlashList
      data={integrations}
      keyExtractor={(i: any) => i.integration.id}
      ListHeaderComponent={() => (
        <>
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              gap: 20,
              paddingHorizontal: 5,
              marginBottom: 20,
            }}
          >
            <Image
              source={about.icon}
              style={{ width: 45, height: 45 }}
              contentFit="contain"
            />
            <View>
              <Text weight={900} style={{ fontSize: 20 }}>
                {about.name}
              </Text>
              <Text style={{ opacity: 0.7 }}>{about.description}</Text>
            </View>
          </View>
          <ListItemButton
            onPress={() =>
              router.push(`/settings/account/integrations/${name}/create`)
            }
            variant="filled"
            style={{ marginBottom: 5 }}
          >
            <ListItemText
              primary={"Connect another account"}
              secondary={`Connect another account to ${about.name}`}
            />
            <Icon>add_circle</Icon>
          </ListItemButton>
        </>
      )}
      contentContainerStyle={{ padding: breakpoints.md ? 40 : 20 }}
      renderItem={({ item, index }) => (
        <ListItemButton
          style={{ marginBottom: 5 }}
          variant="filled"
          onPress={() =>
            router.push(
              `/settings/account/integrations/${name}/${item.integration.id}`
            )
          }
        >
          {item.integration?.params?.account ? (
            <Image
              source={{ uri: item.integration.params.account.picture }}
              style={{ width: 40, height: 40, borderRadius: 999 }}
            />
          ) : (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme[4],
              }}
            >
              <Icon style={{ color: theme[11] }}>person</Icon>
            </View>
          )}
          <ListItemText
            primary={
              item.integration?.params?.account?.email ||
              `Account #${index + 1}`
            }
            secondary={`Last synced ${dayjs(item.lastSynced).fromNow()}`}
          />

          <Icon>arrow_forward_ios</Icon>
        </ListItemButton>
      )}
    />
  );
}

export default function Page() {
  const { name } = useGlobalSearchParams();
  const { data, error } = useSWR(["space/integrations"]);

  const existingIntegrations =
    data?.filter((i) => i.integration.name === name);

  return !data ? (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {error ? <ErrorAlert /> : <Spinner />}
    </View>
  ) : existingIntegrations.length > 0 ? (
    <IntegrationList
      about={existingIntegrations[0].about || {}}
      integrations={existingIntegrations}
    />
  ) : (
    <Redirect href={`/settings/account/integrations/${name}/create`} />
  );
}

