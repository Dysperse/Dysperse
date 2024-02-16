import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import Alert from "@/ui/Alert";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { View } from "react-native";

function TwoFactorAuthSection() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
      <View style={{ flex: 1 }}>
        <Text style={settingStyles.heading}>Two-Factor Authentication</Text>
        <Text style={{ opacity: 0.6 }}>
          Two-factor authentication (2FA) is an extra layer of security for your
          account. You can choose to receive 2FA codes via SMS or an
          authenticator app.
        </Text>
      </View>
      <Button style={{ marginTop: 30, padding: 30, gap: 20 }} variant="filled">
        <ButtonText>Enable</ButtonText>
        <Icon>arrow_forward_ios</Icon>
      </Button>
    </View>
  );
}

export default function Page() {
  return (
    <SettingsLayout>
      <Text style={settingStyles.title}>Login Security</Text>
      <TwoFactorAuthSection />
      <Alert
        style={{ marginTop: 20 }}
        emoji="1f6a7"
        title="More coming soon"
        subtitle="We're planning to add more login vulnerabilities soon. Stay tuned! (we're kidding)"
      />
    </SettingsLayout>
  );
}
