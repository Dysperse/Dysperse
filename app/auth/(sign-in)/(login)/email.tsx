import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import Alert from "@/ui/Alert";
import { Button } from "@/ui/Button";
import OtpInput from "@/ui/OtpInput";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Turnstile from "@/ui/turnstile";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import dayjs from "dayjs";
import * as Device from "expo-device";
import { createURL } from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, {
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as passkey from "react-native-passkeys";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { PasskeyAuth } from "..";
import { rp } from "../../../(app)/settings/account/passkeys";
import { authStyles } from "../../../../components/authStyles";
import { useSession } from "../../../../context/AuthProvider";
import { sendApiRequest } from "../../../../helpers/api";

const styles = StyleSheet.create({
  title: { fontSize: 55, width: "100%", lineHeight: 55 },
});

const isIUSDChromebook =
  Platform.OS === "web" &&
  navigator.userAgent.includes("CrOS") &&
  typeof (navigator as any)?.managed?.getHostname === "function" &&
  dayjs.tz.guess() === "America/Los_Angeles" &&
  navigator.language === "en-US";

export function GoogleAuth({
  signup,
  onNewAccount,
  additionalScopes = [],
  redirectPath,
  getRefreshToken,
  children,
  onSuccess,
}: {
  signup?: boolean;
  onNewAccount?: (data) => void;
  additionalScopes?: string[];
  redirectPath?: string;
  getRefreshToken?: boolean;
  children?: any;
  onSuccess?: (data: any) => void;
}) {
  const theme = useColorTheme();
  const { signIn } = useSession();
  const [loading, setLoading] = useState(false);

  const [result, setResult] =
    useState<WebBrowser.WebBrowserAuthSessionResult | null>(null);

  useEffect(() => {
    if (result?.type === "success") {
      const t = new URL(result.url);
      if (!onSuccess && t.searchParams.has("session")) {
        signIn(t.searchParams.get("session"));
      } else if (t.searchParams.get("isNew")) {
        onNewAccount(Object.fromEntries(t.searchParams.entries()));
      } else {
        setLoading(false);
        onSuccess?.(Object.fromEntries(t.searchParams.entries()));
      }
    } else {
      setLoading(false);
    }
  }, [result, signIn, onNewAccount, onSuccess, setLoading]);

  const handleClick = async () => {
    try {
      if (Platform.OS === "web") {
        setLoading(true);
        setResult(
          await WebBrowser.openAuthSessionAsync(
            `https://accounts.google.com/o/oauth2/auth?${new URLSearchParams({
              client_id:
                "990040256661-kf469e9rml2dbq77q6f5g6rprmgjdlkf.apps.googleusercontent.com",
              redirect_uri: `${process.env.EXPO_PUBLIC_API_URL}/${
                redirectPath || "auth/login/google"
              }`,
              ...(getRefreshToken && {
                access_type: "offline",
                prompt: "consent",
              }),
              scope:
                "profile email" +
                (additionalScopes ? " " + additionalScopes.join(" ") : ""),
              response_type: "code",
            }).toString()}`,
            createURL("/auth/google")
          )
        );
      } else {
        setLoading(true);
        GoogleSignin.configure({
          scopes: ["email", "profile", ...additionalScopes],
          webClientId:
            "990040256661-kf469e9rml2dbq77q6f5g6rprmgjdlkf.apps.googleusercontent.com",
          offlineAccess: true,
          forceCodeForRefreshToken: true,
          profileImageSize: 120,
        });
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();
        if (response.type === "success") {
          console.log(response);
        }

        const data = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}${
            redirectPath || "/auth/login/google"
          }?${new URLSearchParams({
            code: response.data.serverAuthCode,
            scope: response.data.scopes.join(" "),
            returnSessionId: "true",
          })}`
        ).then((r) => r.json());

        if (data?.session) {
          if (onSuccess) {
            setLoading(false);
            return onSuccess(data);
          }
          signIn(data.session);
        } else if (data.isNew) {
          onNewAccount(data);
        }

        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.error(e);
      Toast.show({ type: "error" });
    }
  };

  const trigger = cloneElement(children, {
    onPress: handleClick,
    style: loading ? { justifyContent: "center" } : children.props.style,
    isLoading: loading,
    spinnerColor: signup ? undefined : theme[2],
  });

  return trigger;
}

export function PasskeyModal({ children }: { children: any }) {
  const { signIn } = useSession();
  const [loading, setLoading] = useState(false);

  const trigger = cloneElement(children, {
    isLoading: loading,
    style: loading ? { justifyContent: "center" } : children.props.style,
    onPress: async () => {
      try {
        setLoading(true);
        const { challenge } = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/login/passkeys`
        ).then((res) => res.json());

        const json = await passkey.get({
          rpId: rp.id,
          challenge,
        });

        const result = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/login/passkeys`,
          {
            method: "PATCH",
            body: JSON.stringify({
              challenge,
              response: json,
            }),
          }
        ).then((res) => res.json());

        if (!result.session) throw new Error("No session");
        signIn(result.session);
      } catch (e) {
        // setStep(0);
        console.error("Passkey Error!", e);
        Toast.show({ type: "error" });
      } finally {
        setLoading(false);
      }
    },
  });

  return trigger;
}

function Email({
  showPassword,
  control,
  handleSubmit,
  isLoading,
  setStep,
}: {
  showPassword: boolean;
  control: any;
  handleSubmit: any;
  isLoading: boolean;
  setStep: any;
}) {
  const theme = useColorTheme();
  const inputRef = useRef(null);
  const passwordRef = useRef(null);

  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      if (showPassword) passwordRef.current?.focus();
      else inputRef.current?.focus();
    }, 800);
  }, [showPassword]);

  const onFinish = () => setTimeout(handleSubmit, 100);

  useEffect(() => {
    if (Platform.OS === "web") {
      inputRef.current?.setAttribute("name", "email");
      passwordRef.current?.setAttribute("name", "password");
    }
  }, [showPassword, passwordVisible]);

  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <KeyboardAwareScrollView
      bounces={false}
      keyboardShouldPersistTaps="handled"
      style={{
        flex: 1,
        paddingTop: insets.top + 20,
      }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: breakpoints.md ? 60 : 20,
      }}
    >
      <View style={{ gap: 10 }}>
        <Text
          style={[
            {
              fontFamily: "serifText700",
              fontSize: 30,
              color: theme[11],
              marginTop: Platform.OS === "web" ? 100 : "auto",
            },
          ]}
        >
          What's your email?
        </Text>
        <Controller
          control={control}
          rules={{
            required: true,
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "⚠️  Invalid email address",
            },
          }}
          render={({
            field: { value, onChange, onBlur },
            fieldState: { error },
          }) => (
            <View style={{ position: "relative" }}>
              <TextField
                style={{
                  height: 60,
                  fontFamily: "body_600",
                  borderRadius: 20,
                  fontSize: 20,
                  color: theme[11],
                  paddingHorizontal: 20,
                  borderWidth: 0,
                  opacity: showPassword ? 0.4 : 1,
                }}
                editable={!showPassword}
                inputRef={inputRef}
                placeholder="hello@dysperse.com"
                onBlur={onBlur}
                defaultValue={value}
                onChangeText={onChange}
                onSubmitEditing={onFinish}
                variant="filled+outlined"
                autoComplete="email"
                keyboardType="email-address"
              />
              {showPassword && (
                <Button
                  variant="filled"
                  onPress={() => setStep("email")}
                  text="Edit"
                  containerStyle={{
                    position: "absolute",
                    right: 10,
                    top: 10,
                    height: 40,
                    width: 40,
                    borderRadius: 20,
                  }}
                  iconSize={20}
                  backgroundColors={{
                    default: addHslAlpha(theme[11], 0.1),
                    pressed: addHslAlpha(theme[11], 0.2),
                    hovered: addHslAlpha(theme[11], 0.05),
                  }}
                />
              )}
              {error?.message?.trim?.() && (
                <Alert subtitle={error.message} style={{ marginTop: 10 }} />
              )}
            </View>
          )}
          name="email"
        />
        {showPassword && (
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur } }) => (
              <View style={{ position: "relative" }}>
                <TextField
                  style={{
                    height: 60,
                    fontFamily: "body_600",
                    borderRadius: 20,
                    borderWidth: 0,
                    fontSize: 20,
                    color: theme[11],
                    paddingHorizontal: 20,
                  }}
                  autoFocus
                  placeholder="Password..."
                  secureTextEntry={!passwordVisible}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  autoComplete="current-password"
                  onSubmitEditing={onFinish}
                  inputRef={passwordRef}
                  variant="filled+outlined"
                />
                <Button
                  variant="filled"
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  text={passwordVisible ? "Hide" : "Show"}
                  containerStyle={{
                    position: "absolute",
                    right: 10,
                    top: 10,
                    height: 40,
                    width: 40,
                    borderRadius: 20,
                  }}
                  backgroundColors={{
                    default: addHslAlpha(theme[11], 0.1),
                    pressed: addHslAlpha(theme[11], 0.2),
                    hovered: addHslAlpha(theme[11], 0.05),
                  }}
                  iconSize={20}
                />
              </View>
            )}
            name="password"
          />
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 10,
            marginTop: 5,
          }}
        >
          <Button
            variant="filled"
            height={60}
            onPress={onFinish}
            isLoading={isLoading}
            text="Continue"
            icon="east"
            iconPosition="end"
            large
            containerStyle={{ flex: 1 }}
            bold
          />
        </View>
        {showPassword ? (
          <Button
            variant="outlined"
            onPress={() => router.push("/auth/forgot-password")}
            isLoading={false}
            large
            bold
            text="Need help?"
            containerStyle={{ marginTop: "auto" }}
          />
        ) : (
          <PasskeyAuth />
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}

export default function SignIn() {
  const { signIn, session } = useSession();
  const [step, setStep] = useState<
    | "email"
    | "password"
    | "2fa"
    | "success"
    | "credential-loading"
    | "verifying"
    | "redirect"
  >("email");
  const breakpoints = useResponsiveBreakpoints();

  const theme = useColorTheme();

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

  const { control, setValue, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
      twoFactorCode: "",
      captchaToken: "",
    },
  });

  const checkAccountExists = async (e) =>
    sendApiRequest("", "GET", "user/profile", {
      email: e,
      basic: true,
    }).then((data) => !data.error);

  const onSubmit = useCallback(
    async (data) => {
      try {
        if (step === "email") {
          setStep("credential-loading");
          const t = await checkAccountExists(data.email);
          if (!t) {
            setStep("email");
            router.push({
              pathname: "/auth/join",
              params: {
                email: data.email,
              },
            });
            return;
          }
          setStep("password");
        } else if (!data.captchaToken) {
          setStep("verifying");
          return;
        } else {
          setStep("redirect");
          let ip = "";

          await fetch("https://api.ipify.org?format=json")
            .then((res) => res.json())
            .then((res) => (ip = res.ip))
            .catch(() => {
              ip = "";
            });

          const sessionRequest = await sendApiRequest(
            false,
            "POST",
            "auth/login",
            {},
            {
              body: JSON.stringify({
                ...data,
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
          setValue("captchaToken", "");

          if (sessionRequest.twoFactorRequired) {
            if (step === "2fa") {
              Toast.show({
                type: "error",
                text1: "Incorrect 2fa code",
              });
            }
            setStep("2fa");
            return;
          }
          console.log("Session Request", data, sessionRequest);
          if (!sessionRequest.session) {
            Toast.show({
              type: "error",
              text1: sessionRequest.error.includes("captcha")
                ? sessionRequest.error
                : "Incorrect password",
            });
            setStep("password");
            return;
          }
          signIn(sessionRequest.session);
          router.push("/home");
        }
      } catch (e) {
        console.error(e);
        alert(e);
        Toast.show({ type: "error" });
        setStep("email");
      }
    },
    [signIn, step]
  );

  useEffect(() => {
    if (session) {
      router.replace("/home");
    }
  }, [session]);

  return (
    <>
      <View style={{ flex: 1, paddingHorizontal: 25 }}>
        {step === "redirect" ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Spinner />
          </View>
        ) : step === "email" ||
          step === "password" ||
          step === "credential-loading" ? (
          <Email
            setStep={setStep}
            isLoading={step === "credential-loading"}
            showPassword={step === "password"}
            control={control}
            handleSubmit={handleSubmit(onSubmit)}
          />
        ) : step === "verifying" ? (
          <View style={authStyles.container}>
            <View
              style={{
                marginVertical: "auto",
                gap: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={[
                  styles.title,
                  {
                    paddingTop: 10,
                    fontSize: 35,
                    textAlign: "center",
                    fontFamily: "serifText700",
                    color: theme[11],
                    marginBottom: -10,
                  },
                ]}
              >
                Verifying
              </Text>
              <Text
                style={[
                  authStyles.subtitleContainer,
                  {
                    textAlign: "center",
                    opacity: 0.6,
                    color: theme[11],
                    fontSize: 17,
                  },
                ]}
                weight={600}
              >
                Are you human? Let's find out...
              </Text>
              <Turnstile
                setToken={(e) => {
                  setValue("captchaToken", e);
                  handleSubmit(onSubmit)();
                }}
              />
            </View>
          </View>
        ) : (
          <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            bounces={false}
          >
            <View style={{ marginVertical: "auto", gap: 10 }}>
              <Text
                style={[
                  {
                    color: theme[11],
                    fontFamily: "serifText700",
                    fontSize: 40,
                    textAlign: "center",
                  },
                ]}
              >
                Two factor auth
              </Text>
              <Text
                weight={700}
                style={{
                  color: theme[11],
                  fontSize: 17,
                  marginBottom: 10,
                  opacity: 0.6,
                  textAlign: "center",
                }}
              >
                Enter the code from your authenticator app
              </Text>

              <Controller
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange } }) => (
                  <OtpInput
                    onFilled={(t) => {
                      onChange(t);
                      handleSubmit(onSubmit)();
                    }}
                    containerGap={breakpoints.md ? undefined : 5}
                    autoFocus
                    blurOnFilled
                    inputHeight={70}
                    fontSize={26}
                  />
                )}
                name="twoFactorCode"
              />
            </View>
          </KeyboardAwareScrollView>
        )}
      </View>
    </>
  );
}

