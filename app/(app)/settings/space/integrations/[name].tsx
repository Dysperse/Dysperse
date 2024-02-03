import integrations from "@/components/settings/integrations.json";
import { SettingsLayout } from "@/components/settings/layout";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function Page() {
  const theme = useColorTheme();

  const handleBack = () => router.replace("/settings/space/integrations");
  const { name } = useLocalSearchParams();

  const integration = integrations.find(
    (integration) => integration.slug === name
  );

  return (
    <SettingsLayout>
      <View style={{ flexDirection: "row" }}>
        <Button variant="outlined" onPress={handleBack}>
          <Icon>arrow_back_ios_new</Icon>
          <ButtonText>Integrations</ButtonText>
        </Button>
      </View>
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
          source={{ uri: integration.icon }}
          style={{
            width: 80,
            height: 80,
          }}
        />
        <Text weight={900} style={{ fontSize: 30, marginTop: 15 }}>
          {integration.name}
        </Text>
        <Text
          style={{ fontSize: 16, marginBottom: 20, opacity: 0.6, marginTop: 5 }}
        >
          {integration.description}
        </Text>
        <Button
          large
          variant="filled"
          icon="add"
          iconSize={30}
          text="Connect"
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
          style={{ fontSize: 16, marginBottom: 10, opacity: 0.6, marginTop: 5 }}
        >
          {integration.about?.text}
        </Text>
      </View>
    </SettingsLayout>
  );
}
