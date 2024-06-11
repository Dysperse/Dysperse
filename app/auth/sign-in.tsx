import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { Button, ButtonText } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import * as Device from "expo-device";
import { LinearGradient } from "expo-linear-gradient";
import * as Network from "expo-network";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { authStyles } from "../../components/authStyles";
import { useSession } from "../../context/AuthProvider";
import { sendApiRequest } from "../../helpers/api";
import Turnstile from "../../ui/turnstile";

const styles = StyleSheet.create({
  title: { fontSize: 55, width: "100%", lineHeight: 55 },
});

function QrLogin() {
  const theme = useColorTheme();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  const { signIn } = useSession();

  useEffect(() => {
    try {
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/qr`, {
        method: "POST",
      })
        .then((r) => r.json())
        .then(setData)
        .catch(() => setError(true));
    } catch (e) {
      console.error(e);
      Toast.show({ type: "error" });
    }
  }, []);

  useEffect(() => {
    const t: any = () => {
      if (data) {
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/qr?token=${data.token}`)
          .then((r) => r.json())
          .then((r) => {
            if (r.sessionId) {
              signIn(r.sessionId);
            }
          });
      }
    };

    setInterval(t, 5000);
    return () => clearInterval(t);
  }, [signIn, data]);

  return data ? (
    <View style={{ alignItems: "center", padding: 20, gap: 5 }}>
      <View
        style={{
          backgroundColor: theme[5],
          padding: 20,
          borderRadius: 20,
          marginBottom: 10,
        }}
      >
        <QRCode
          size={220}
          logoSize={50}
          color={theme[11]}
          backgroundColor={theme[5]}
          value={`https://api.dysperse.com/auth/qr?token=${data?.token}`}
        />
      </View>
      <View
        style={{
          maxWidth: 300,
          alignItems: "center",
          backgroundColor: theme[3],
          borderRadius: 20,
          padding: 20,
        }}
      >
        <Text
          weight={900}
          style={{ marginBottom: 10, fontSize: 20, textAlign: "center" }}
        >
          Log in with QR Code
        </Text>
        <Text
          style={{
            opacity: 0.7,
            textAlign: "center",
          }}
        >
          Scan this QR code with the Dysperse app to instantly sign in with your
          account.
        </Text>
      </View>
    </View>
  ) : error ? (
    <ErrorAlert message="Couldn't load an instant login QR code. Please try again later" />
  ) : (
    <Spinner />
  );
}

function Credentials({ control, errors, onSubmit, handleSubmit, step }) {
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const [showPassword, setShowPassword] = useState(false);

  const handleForgot = useCallback(
    () => router.push("/auth/forgot-password"),
    []
  );

  const handleCreateAccount = useCallback(
    () => router.push("/auth/sign-up"),
    []
  );

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1, flexDirection: "row" }}
    >
      <ScrollView
        style={{ maxHeight: "100%" }}
        keyboardShouldPersistTaps="handled"
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
        <Text
          style={[
            styles.title,
            {
              paddingTop: 10,
              fontFamily: "serifText800",
            },
            !breakpoints.md && { textAlign: "center" },
          ]}
        >
          Sign in
        </Text>
        <Text
          style={[
            authStyles.subtitleContainer,
            !breakpoints.md && { textAlign: "center", opacity: 0.6 },
          ]}
          weight={800}
        >
          Continue with your Dysperse ID
        </Text>
        <View style={{ gap: 10 }}>
          <Controller
            control={control}
            rules={{ required: true }}
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
          <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                    flex: 1,
                    borderColor: errors.password ? "red" : theme[6],
                    ...(Platform.OS === "web" && { outline: "none" }),
                  }}
                  onSubmitEditing={handleSubmit(onSubmit)}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="password"
            />
            <IconButton
              style={{ marginLeft: -40, transform: [{ translateX: -20 }] }}
              size={40}
              variant="filled"
              icon={showPassword ? "visibility" : "visibility_off"}
              onPress={() => setShowPassword((s) => !s)}
            />
          </View>
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
              style={[
                authStyles.buttonText,
                { opacity: 0.6, fontFamily: "body_500" },
              ]}
            >
              Need help?
            </ButtonText>
          </Button>
          {!breakpoints.md && (
            <Button
              dense
              onPress={handleCreateAccount}
              variant="outlined"
              style={[authStyles.button]}
            >
              <ButtonText
                style={[
                  authStyles.buttonText,
                  { opacity: 0.6, fontFamily: "body_500" },
                ]}
              >
                Create an account
              </ButtonText>
            </Button>
          )}
        </View>
      </ScrollView>
      {breakpoints.md && step === 0 && (
        <View
          style={[
            authStyles.container,
            {
              borderWidth: 0,
              alignItems: "center",
              maxWidth: 310,
              marginLeft: 30,
              justifyContent: "flex-start",
              paddingTop: 80,
            },
          ]}
        >
          <QrLogin />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

export default function SignIn() {
  const { signIn, session } = useSession();
  const [step, setStep] = useState(0);
  const [token, setToken] = useState("");

  const theme = useColorTheme();

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

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
          const ip = await Network.getIpAddressAsync();
          const sessionRequest = await sendApiRequest(
            false,
            "POST",
            "auth/login",
            {},
            {
              body: JSON.stringify({
                ...data,
                captchaToken: token,
                deviceType: Device.deviceType,
                ip,
                deviceName:
                  Device.deviceName ||
                  (Platform.OS === "web"
                    ? navigator.userAgent.split("(")[1].split(";")[0]
                    : "Unknown device"),
              }),
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
              text1: sessionRequest.error.includes("captcha")
                ? sessionRequest.error
                : "Incorrect email or password",
            });
            setToken("");
            setStep(0);
            return;
          }
          signIn(sessionRequest.session);
        }
      } catch (e) {
        console.error(e);
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

  const breakpoints = useResponsiveBreakpoints();

  return (
    <>
      <LinearGradient
        colors={[theme[2], theme[1]]}
        style={[
          authStyles.container,
          breakpoints.md && authStyles.containerDesktop,
          breakpoints.md && step === 0 && { maxWidth: 1000 },
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
          style={{
            margin: 10,
            opacity: breakpoints.md ? 0 : 1,
            pointerEvents: breakpoints.md ? "none" : "auto",
          }}
        />
        {step === 0 || step === 2 ? (
          <Credentials
            control={control}
            errors={errors}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            step={step}
          />
        ) : step === 1 ? (
          <View style={authStyles.container}>
            <View style={{ marginVertical: "auto", gap: 10 }}>
              <Text
                style={[
                  styles.title,
                  {
                    paddingTop: 10,
                    fontFamily: "serifText800",
                  },
                  !breakpoints.md && { textAlign: "center" },
                ]}
              >
                Verifying
              </Text>
              <Text
                style={[
                  authStyles.subtitleContainer,
                  !breakpoints.md && { textAlign: "center", opacity: 0.6 },
                ]}
                weight={800}
              >
                Are you a human!? Let's find out...
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
                  style={[
                    styles.title,
                    { color: theme[11], fontStyle: "italic" },
                  ]}
                >
                  you
                </Text>
                ?
              </Text>
              <Text style={authStyles.subtitleContainer}>
                Enter the code from your authenticator app
              </Text>

              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    onSubmitEditing={handleSubmit(onSubmit)}
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
      </LinearGradient>
    </>
  );
}
