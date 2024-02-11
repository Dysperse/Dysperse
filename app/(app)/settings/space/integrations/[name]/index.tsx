import { SettingsLayout } from "@/components/settings/layout";
import { useSession } from "@/context/AuthProvider";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Linking, View } from "react-native";
import useSWR from "swr";

export default function Page() {
  const theme = useColorTheme();
  const { session } = useSession();
  const { name } = useLocalSearchParams();

  const { data } = useSWR(
    name ? ["space/integrations/about", { id: name }] : null
  );

  const { data: integrations } = useSWR(["space/integrations"]);

  const handleBack = () => router.replace("/settings/space/integrations");
  const handleOpen = () => {
    if (isConnected) {
      return;
    }
    Linking.openURL(
      `${process.env.EXPO_PUBLIC_API_URL}/space/integrations/redirect?session=${session}&id=${name}`
    );
  };

  const isConnected = integrations.find((i) => i.integration.name === name);

  return (
    <SettingsLayout>
      <View style={{ flexDirection: "row" }}>
        <Button variant="outlined" onPress={handleBack}>
          <Icon>arrow_back_ios_new</Icon>
          <ButtonText>Integrations</ButtonText>
        </Button>
      </View>
      {data ? (
        <>
          <View
            style={{
              alignItems: "center",
              marginTop: 50,
              backgroundColor: addHslAlpha(theme[3], 0.5),
              borderColor: theme[4],
              borderWidth: 2,
              borderRadius: 20,
              padding: 20,
              paddingVertical: 40,
            }}
          >
            <Image
              source={{ uri: data.icon }}
              style={{
                borderRadius: 10,
                width: 80,
                height: 80,
              }}
            />
            <Text weight={900} style={{ fontSize: 30, marginTop: 15 }}>
              {data.name}
            </Text>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 20,
                opacity: 0.6,
                marginTop: 5,
              }}
            >
              {data.description}
            </Text>
            <Button
              large
              variant={isConnected ? "outlined" : "filled"}
              icon={isConnected ? "check" : "add"}
              iconSize={30}
              text={isConnected ? "Connected" : "Connect"}
              onPress={handleOpen}
            />
          </View>
          <View
            style={{
              marginTop: 20,
              justifyContent: "space-between",
              backgroundColor: addHslAlpha(theme[3], 0.5),
              borderColor: theme[4],
              borderWidth: 2,
              borderRadius: 20,
              padding: 20,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Text weight={700} style={{ fontSize: 20, paddingBottom: 10 }}>
                About
              </Text>
              <Button
                dense
                iconPosition="end"
                icon="north_east"
                text="Source"
                style={{ marginLeft: "auto" }}
              />
            </View>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 10,
                opacity: 0.6,
                marginTop: 5,
              }}
            >
              {data.about?.text}
            </Text>
          </View>
        </>
      ) : (
        <View
          style={{
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spinner />
        </View>
      )}
    </SettingsLayout>
  );
}
