import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Alert from "@/ui/Alert";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useCallback, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

function TwoFactorAuthSection() {
  const breakpoints = useResponsiveBreakpoints();
  const { session, sessionToken, mutate } = useUser();
  const isEnabled = session.user.twoFactorSecret;

  return (
    <View
      style={{
        flexDirection: breakpoints.md ? "row" : "column",
        alignItems: "center",
        gap: 20,
      }}
    >
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
        height={440}
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
            router.push("/settings/login/account/two-factor-authentication");
          }
        }}
        disabled={!isEnabled}
      >
        <Button
          style={[
            { padding: 30, gap: 20 },
            breakpoints.md ? { marginTop: 30 } : { width: "100%" },
          ]}
          variant="filled"
        >
          <ButtonText>Enable{isEnabled && "d"}</ButtonText>
          <Icon>{isEnabled ? "check" : "arrow_forward_ios"}</Icon>
        </Button>
      </ConfirmationModal>
    </View>
  );
}

function EmailSection() {
  const theme = useColorTheme();
  const { session, sessionToken } = useUser();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: session.user.email,
      token: "",
    },
  });

  const sheetRef = useRef<BottomSheetModal>(null);

  const onSubmit = (values) => {
    if (!values.token) {
      sheetRef.current.present();
      sendApiRequest(sessionToken, "POST", "user/account/email", {
        email: values.email,
      });
      return;
    }
  };

  const handleClose = useCallback(() => sheetRef.current.close(), []);

  return (
    <>
      <Text style={settingStyles.heading}>Email</Text>
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <>
              <TextField
                style={{ flex: 1 }}
                variant="filled+outlined"
                {...field}
              />
              <IconButton
                disabled={session.user.email === field.value}
                icon="check"
                size={40}
                variant="filled"
                onPress={handleSubmit(onSubmit)}
                style={{ borderWidth: 1, borderColor: theme[5] }}
              />
            </>
          )}
        />
      </View>

      <BottomSheet
        onClose={handleClose}
        snapPoints={[300]}
        disableBackToClose
        disableBackdropPressToClose
        disableEscapeToClose
        enablePanDownToClose={false}
        sheetRef={sheetRef}
      >
        <View style={{ padding: 20 }}>
          <Text weight={800} style={{ fontSize: 20 }}>
            Verify your email
          </Text>
          <Text style={{ marginVertical: 10 }}>
            We sent a verification email to your new email address. Please enter
            the code to confirm your new email.
          </Text>
          <TextField
            placeholder="Verification code"
            variant="filled+outlined"
          />
          <Button>
            <ButtonText>Confirm</ButtonText>
            <Icon>check</Icon>
          </Button>
        </View>
      </BottomSheet>
    </>
  );
}

export default function Page() {
  return (
    <SettingsLayout>
      <Text style={settingStyles.title}>Account</Text>
      <EmailSection />
      <TwoFactorAuthSection />
      <Alert
        style={{ marginTop: 20 }}
        emoji="1f6a7"
        title="More coming soon"
        subtitle="We're improving our defenses. Stay tuned!"
      />
    </SettingsLayout>
  );
}
