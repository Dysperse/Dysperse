import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import Alert from "@/ui/Alert";
import { Button, ButtonText } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { router } from "expo-router";
import { View } from "react-native";

function TwoFactorAuthSection() {
  const { session, sessionToken, mutate } = useUser();
  const isEnabled = session.user.twoFactorSecret;

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
      <ConfirmationModal
        title="Disable 2FA?"
        secondary="Your account won't be as secure anymore. Are you sure?"
        height={400}
        onSuccess={async () => {
          if (isEnabled) {
            await sendApiRequest(sessionToken, "DELETE", "user/2fa/setup");
            mutate(
              (d) => ({
                ...d,
                user: { ...d.user, twoFactorSecret: null },
              }),
              {
                revalidate: false,
              }
            );
          } else {
            router.push(
              "/settings/privacy/login-security/two-factor-authentication"
            );
          }
        }}
        disabled={!isEnabled}
      >
        <Button
          style={{ marginTop: 30, padding: 30, gap: 20 }}
          variant="filled"
        >
          <ButtonText>Enable{isEnabled && "d"}</ButtonText>
          <Icon>arrow_forward_ios</Icon>
        </Button>
      </ConfirmationModal>
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
