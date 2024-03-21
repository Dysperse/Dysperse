import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { omit } from "@/helpers/omit";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Alert from "@/ui/Alert";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import Toast from "react-native-toast-message";

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
  const { session, mutate, sessionToken } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: session.user.email,
      token: "",
    },
  });

  const sheetRef = useRef<BottomSheetModal>(null);

  const onSubmit = async (values) => {
    if (!values.token) {
      try {
        setIsLoading(true);
        const data = await sendApiRequest(
          sessionToken,
          "POST",
          "user/account/email",
          {
            email: values.email,
          }
        );
        if (data.error) {
          Toast.show({ type: "error", text1: data.error });
          return;
        }
        sheetRef.current.present();
      } catch (e) {
        Toast.show({ type: "error" });
      } finally {
        setIsLoading(false);
      }

      return;
    }

    try {
      setIsLoading(true);
      const data = await sendApiRequest(
        sessionToken,
        "PUT",
        "user/account/email",
        {
          token: values.token,
        }
      );
      if (data.error) {
        Toast.show({
          type: "error",
          text1: "Incorrect code. Please try again",
        });
        return;
      }
      sheetRef.current.close();
      Toast.show({ type: "success", text1: "Email updated!" });
      mutate((d) => ({ ...d, user: { ...d.user, email: values.email } }), {
        revalidate: false,
      });
    } catch (e) {
      Toast.show({ type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = useCallback(() => sheetRef.current?.close(), []);

  return (
    <>
      <Text style={settingStyles.heading}>Email</Text>
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <Controller
          name="email"
          control={control}
          rules={{
            required: "Email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Invalid email",
            },
          }}
          render={({ field }) => (
            <>
              <TextField
                style={{ flex: 1 }}
                editable={!isLoading}
                onSubmitEditing={handleSubmit(onSubmit, () =>
                  Toast.show({ type: "error", text1: "Please enter an email" })
                )}
                variant="filled+outlined"
                {...omit(["ref"], field)}
              />
              <IconButton
                disabled={session.user.email === field.value}
                icon={isLoading ? <Spinner size={24} /> : "check"}
                size={40}
                variant="filled"
                onPress={handleSubmit(onSubmit, () =>
                  Toast.show({ type: "error", text1: "Please enter an email" })
                )}
                style={{ borderWidth: 1, borderColor: theme[5] }}
              />
            </>
          )}
        />
      </View>

      <BottomSheet onClose={handleClose} snapPoints={[400]} sheetRef={sheetRef}>
        <BottomSheetScrollView contentContainerStyle={{ padding: 30 }}>
          <Text weight={800} style={{ fontSize: 30 }}>
            Verify your email
          </Text>
          <Text style={{ marginVertical: 10, fontSize: 20, opacity: 0.7 }}>
            We sent a verification email to your new email address. Please enter
            the code to confirm your new email.
          </Text>
          <Controller
            name="token"
            control={control}
            rules={{
              required: true,
              minLength: 8,
            }}
            render={({ field }) => (
              <TextField
                placeholder="Verification code"
                variant="filled+outlined"
                {...omit(["ref"], field)}
              />
            )}
          />
          <Button
            style={{ height: 60, marginTop: 10 }}
            variant="filled"
            isLoading={isLoading}
            onPress={handleSubmit(onSubmit, () =>
              Toast.show({ type: "error", text1: "Please enter a code" })
            )}
          >
            <ButtonText weight={700} style={{ fontSize: 20 }}>
              Confirm
            </ButtonText>
            <Icon>check</Icon>
          </Button>
        </BottomSheetScrollView>
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
