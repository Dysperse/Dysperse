import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import * as Device from "expo-device";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useSession } from "../../context/AuthProvider";
import { sendApiRequest } from "../../helpers/api";
import Turnstile from "../../ui/turnstile";
import { authStyles } from "./authStyles";

const styles = StyleSheet.create({
  title: { fontSize: 55, width: "100%", lineHeight: 55 },
});

export default function SignIn() {
  const { signIn, session } = useSession();
  const [step, setStep] = useState(0);
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      twoFactorCode: "",
    },
  });

  const onSubmit = useCallback(
    async (data) => {
      try {
        if (step === 0) {
          setStep(1);
        } else {
          setStep(step === 3 ? 4 : 2);
          console.log(data);
          const sessionRequest = await sendApiRequest(
            false,
            "POST",
            "auth/login",
            {},
            {
              body: JSON.stringify({
                ...data,
                token,
                deviceType: Device.deviceType,
                deviceName:
                  Device.deviceName ||
                  (Platform.OS === "web"
                    ? navigator.userAgent.split("(")[1].split(";")[0]
                    : "Unknown device"),
              }),
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (sessionRequest.twoFactorRequired) {
            if (step === 3) {
              Toast.show({
                type: "error",
                text1: "Incorrect 2fa code",
              });
            }
            setStep(3);
            return;
          }
          if (!sessionRequest.session) {
            Toast.show({
              type: "error",
              text1: "Incorrect email or password",
            });
            setToken("");
            setStep(0);
            return;
          }
          signIn(sessionRequest.session);
        }
      } catch (e) {
        Toast.show({ type: "error" });
        setToken("");
        setStep(0);
      }
    },
    [signIn, step, token]
  );

  useEffect(() => {
    if (step == 1 && token) {
      setStep(0);
      handleSubmit(onSubmit)();
    }
  }, [step, token, onSubmit, handleSubmit]);

  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [session]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.push("/");
  }, []);

  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const handleForgot = useCallback(
    () => router.push("/auth/forgot-password"),
    []
  );

  return (
    <View
      style={[
        authStyles.container,
        { backgroundColor: theme[1] },
        breakpoints.md && authStyles.containerDesktop,
        breakpoints.md && {
          borderColor: theme[6],
        },
      ]}
    >
      <IconButton
        variant="outlined"
        size={55}
        icon="close"
        onPress={handleBack}
        style={{ margin: 10 }}
      />
      {step === 0 || step === 2 ? (
        <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
          <ScrollView
            style={{ maxHeight: "100%" }}
            contentContainerStyle={[
              authStyles.container,
              {
                justifyContent: "flex-start",
                flex: undefined,
                paddingBottom: insets.top + 40,
                paddingTop: 40,
              },
            ]}
          >
            <Text weight={600} style={[styles.title, { color: theme[11] }]}>
              Sign in
            </Text>
            <Text weight={300} style={authStyles.subtitleContainer}>
              Use your Dysperse ID to continue
            </Text>
            <View style={{ gap: 10 }}>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    variant="filled+outlined"
                    style={{
                      paddingHorizontal: 30,
                      paddingVertical: 20,
                      fontSize: 20,
                      borderColor: errors.email ? "red" : theme[6],
                      ...(Platform.OS === "web" && { outline: "none" }),
                    }}
                    placeholder="Email or username"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="email"
              />
              <Controller
                control={control}
                rules={{
                  maxLength: 100,
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    variant="filled+outlined"
                    style={{
                      paddingHorizontal: 30,
                      paddingVertical: 20,
                      fontSize: 20,
                      borderColor: errors.password ? "red" : theme[6],
                      ...(Platform.OS === "web" && { outline: "none" }),
                    }}
                    onSubmitEditing={handleSubmit(onSubmit)}
                    placeholder="Password"
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="password"
              />
              <Button
                variant="filled"
                style={[authStyles.button, { marginTop: 20 }]}
                onPress={handleSubmit(onSubmit)}
                isLoading={step === 2}
              >
                <ButtonText style={authStyles.buttonText}>Continue</ButtonText>
              </Button>
              <Button
                dense
                onPress={handleForgot}
                variant="outlined"
                style={[authStyles.button]}
              >
                <ButtonText
                  style={[authStyles.buttonText, { fontFamily: "body_200" }]}
                >
                  Need help?
                </ButtonText>
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : step === 1 ? (
        <View style={authStyles.container}>
          <View style={{ marginVertical: "auto", gap: 10 }}>
            <Text weight={600} style={[styles.title, { color: theme[11] }]}>
              Verifying...
            </Text>
            <Text weight={300} style={authStyles.subtitleContainer}>
              Checking if you're actually human 🤨
            </Text>
            <Turnstile setToken={setToken} />
          </View>
        </View>
      ) : (
        <View style={authStyles.container}>
          <View style={{ marginVertical: "auto", gap: 10 }}>
            <Text weight={600} style={[styles.title, { color: theme[11] }]}>
              Are you{" "}
              <Text
                weight={600}
                style={[
                  styles.title,
                  { color: theme[11], fontStyle: "italic" },
                ]}
              >
                you
              </Text>
              ?
            </Text>
            <Text weight={300} style={authStyles.subtitleContainer}>
              Enter the code from your authenticator app
            </Text>

            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  variant="filled+outlined"
                  style={{
                    paddingHorizontal: 30,
                    paddingVertical: 20,
                    fontSize: 20,
                    borderColor: errors.email ? "red" : theme[6],
                    ...(Platform.OS === "web" && { outline: "none" }),
                  }}
                  placeholder="2fa code"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="twoFactorCode"
            />
            <Button
              variant="filled"
              style={[authStyles.button, { marginTop: 20 }]}
              onPress={handleSubmit(onSubmit)}
              isLoading={step === 4}
            >
              <ButtonText style={authStyles.buttonText}>Continue</ButtonText>
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}
