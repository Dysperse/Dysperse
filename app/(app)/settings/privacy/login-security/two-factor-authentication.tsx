import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export default function Page() {
  const breakpoints = useResponsiveBreakpoints();
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
      Toast.show({ type: "success", text1: "2FA enabled!" });
      router.push("/settings/privacy/login-security");
    } catch (err) {
      Toast.show({ type: "error", text2: "Check your code?" });
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsLayout>
      <View style={{ flexDirection: "row" }}>
        <Button
          variant="outlined"
          text="Login security"
          icon="arrow_back_ios"
          onPress={() => router.back()}
        />
      </View>
      {!data ? (
        error ? (
          <ErrorAlert />
        ) : (
          <Spinner />
        )
      ) : (
        <View style={{ marginTop: 30 }}>
          <Text style={settingStyles.title}>Two-factor authentication</Text>
          <Text
            style={{
              marginTop: 5,
              opacity: 0.6,
              fontSize: 20,
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
              <Image
                source={{ uri: data.qr }}
                style={{ width: 200, height: 200, borderRadius: 5 }}
              />
              <Button
                style={{ marginVertical: 5 }}
                onPress={async () => {
                  await Clipboard.setStringAsync(data.secret);

                  Toast.show({
                    type: "success",
                    text1: "Copied setup key!",
                    text2: "Paste it into your authenticator app.",
                  });
                }}
              >
                <ButtonText>Can't scan?</ButtonText>
              </Button>
            </View>
            <View
              style={{
                flexDirection: breakpoints.md ? "row" : "column",
                gap: 10,
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
                      fontFamily: "body_900",
                      height: 60,
                    }}
                  />
                )}
                name="code"
                control={control}
              />
              <Button
                isLoading={loading}
                onPress={handleSubmit(onSubmit)}
                style={{
                  height: 60,
                  borderRadius: 10,
                }}
              >
                {!breakpoints.md && <ButtonText>Continue</ButtonText>}
                <Icon>{breakpoints.md ? "arrow_forward_ios" : "check"}</Icon>
              </Button>
            </View>
          </View>
        </View>
      )}
    </SettingsLayout>
  );
}
