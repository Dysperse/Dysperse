import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { toast } from "sonner-native";

export default function Page() {
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const { session, sessionToken } = useUser();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sendApiRequest(
      sessionToken,
      "GET",
      "user/2fa/setup",
      {},
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    )
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err);
      });
  }, [session, sessionToken]);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (t) => {
    try {
      setLoading(true);
      await sendApiRequest(
        sessionToken,
        "POST",
        "user/2fa/setup",
        {
          secret: data.secret,
          code: t.code,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      setLoading(false);
      toast.success("2FA enabled!");
      router.push("/settings/account");
    } catch (err) {
      toast.error("Check your code?");
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsScrollView>
      {!data ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
          }}
        >
          {error ? <ErrorAlert /> : <Spinner />}
        </View>
      ) : (
        <View>
          <Text style={settingStyles.title}>Two-factor authentication</Text>
          <Text
            style={{
              marginTop: 5,
              opacity: 0.6,
              marginBottom: 20,
            }}
          >
            2FA is an extra layer of security for your account. Scan the QR code
            below with an authenticator app to get started, and enter the code
            it gives you.
          </Text>
          <View
            style={{
              alignItems: "center",
              marginTop: 30,
              gap: 50,
              flexDirection: breakpoints.md ? "row" : "column",
            }}
          >
            <View>
              <View
                style={{
                  backgroundColor: theme[3],
                  padding: 10,
                  borderRadius: 20,
                }}
              >
                <QRCode
                  size={220}
                  logoSize={50}
                  color={theme[11]}
                  backgroundColor={theme[3]}
                  value={
                    `otpauth://totp/Dysperse:${session.user.profile.name}?` +
                    new URLSearchParams({
                      secret: data.secret,
                      issuer: "Dysperse",
                    })
                  }
                />
              </View>
              <Button
                containerStyle={{ marginVertical: 5 }}
                onPress={async () => {
                  await Clipboard.setStringAsync(data.secret);
                  toast.info("Copied!", {
                    description: "Paste it into your authenticator app.",
                  });
                }}
              >
                <ButtonText>Can't scan?</ButtonText>
              </Button>
            </View>
            <View
              style={{
                flexDirection: "column",
                gap: 10,
                width: breakpoints.md ? undefined : "100%",
              }}
            >
              <Controller
                rules={{ required: true, maxLength: 6 }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="number-pad"
                    variant="filled+outlined"
                    placeholder="Enter code"
                    style={{
                      fontSize: 20,
                      textAlign: "center",
                      height: 60,
                    }}
                    weight={900}
                  />
                )}
                name="code"
                control={control}
              />
              <Button
                isLoading={loading}
                onPress={handleSubmit(onSubmit)}
                variant="filled"
                height={60}
                style={{
                  flexDirection: "row",
                  gap: 20,
                  borderRadius: 20,
                  borderWidth: 1,
                  width: "100%",
                  borderColor: theme[5],
                }}
              >
                <ButtonText weight={900}>Continue</ButtonText>
                <Icon>{breakpoints.md ? "arrow_forward_ios" : "check"}</Icon>
              </Button>
            </View>
          </View>
        </View>
      )}
    </SettingsScrollView>
  );
}

