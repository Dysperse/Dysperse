import { SettingsLayout } from "@/components/settings/layout";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { router } from "expo-router";
import { View } from "react-native";

export default function Page() {
  const handleBack = () => router.replace("/settings/space/integrations");
  return (
    <SettingsLayout>
      <View style={{ flexDirection: "row" }}>
        <Button variant="outlined" onPress={handleBack}>
          <Icon>arrow_back_ios_new</Icon>
          <ButtonText>Integrations</ButtonText>
        </Button>
      </View>
      <Text>Integrations page</Text>
    </SettingsLayout>
  );
}
