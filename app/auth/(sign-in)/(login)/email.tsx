import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { Button } from "@/ui/Button";
import OtpInput from "@/ui/OtpInput";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
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
import { Path, Svg } from "react-native-svg";
import Toast from "react-native-toast-message";
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
}: {
  signup?: boolean;
  onNewAccount?: (data) => void;
  additionalScopes?: string[];
  redirectPath?: string;
  getRefreshToken?: boolean;
  children?: any;
}) {
  const theme = useColorTheme();
  const { signIn } = useSession();
  const [loading, setLoading] = useState(false);

  const [result, setResult] =
    useState<WebBrowser.WebBrowserAuthSessionResult | null>(null);

  useEffect(() => {
    if (result?.type === "success") {
      const t = new URL(result.url);
      if (t.searchParams.has("session")) {
        signIn(t.searchParams.get("session"));
      } else {
        setLoading(false);
        onNewAccount?.(Object.fromEntries(t.searchParams.entries()));
      }
    } else {
      setLoading(false);
    }
  }, [result, signIn, onNewAccount, setLoading]);

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
        const userInfo = await GoogleSignin.signIn();
        //  LOG  {"idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImIyZjgwYzYzNDYwMGVkMTMwNzIxMDFhOGI0MjIwNDQzNDMzZGIyODIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI5OTAwNDAyNTY2NjEtcWE0bmJqZTlmY2kwbzJzcGJjOTZ0cnA3bzZlZmYxdjUuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5OTAwNDAyNTY2NjEta2Y0NjllOXJtbDJkYnE3N3E2ZjVnNnJwcm1namRsa2YuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTE3MTAwNjM4NDU1MTcyNjY5MTgiLCJlbWFpbCI6Im1hbnVzdmF0aGd1cnVkYXRoQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiTWFudSBHdXJ1ZGF0aCAoTWFudXN2YXRoKSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLbUc1U241WG1EMkxnWkdKSXZFNWRPeXlhMnd6V0h1bmx0bkxXYmJLb2NxNENfbzFtZD1zOTYtYyIsImdpdmVuX25hbWUiOiJNYW51IiwiZmFtaWx5X25hbWUiOiJHdXJ1ZGF0aCIsImlhdCI6MTcyNTQ5MDI2OSwiZXhwIjoxNzI1NDkzODY5fQ.win7PIMbdqk-nWG2e0EknHUyso8vIGw2t7SD1VqsFr2E-xeZ2tYpM4KG9vTKyCvHze_Vvk7KXDLsTXrkELrelDZ5yiLG-9NnLbkY94Dpn_34NkgY0znA1e231YPYbfOznKARfIr-tCKrNDq3vDx7JmgmoaaFd5X7_6nNXfw2xf_tGz6h-v5YLhPotn6XAPsBvevl4hptWMznjlJoOXsVssD-eMpff22J_iswbDW-BteQC7VxqQEc-FPLhQ_QrXDOaIpNPDSW163bWz8GBd-repeKva_IeOFZ_u6fpAdZlx9xF4k1fCIYDfS0rgjGCndXRa4pNm8JdEaerIfhvTD1oQ", "scopes": ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "openid", "profile", "https://www.googleapis.com/auth/calendar.readonly", "https://www.googleapis.com/auth/calendar.events.readonly", "email"], "serverAuthCode": "4/0AQlEd8wjICnjQA850BbJEZkAd2RGGj5483d46Wix0CfSVmdbi8XOjLbfFRBaWXxVkKgacQ", "user": {"email": "manusvathgurudath@gmail.com", "familyName": "Gurudath", "givenName": "Manu", "id": "111710063845517266918", "name": "Manu Gurudath (Manusvath)", "photo": "https://lh3.googleusercontent.com/a/ACg8ocKmG5Sn5XmD2LgZGJIvE5dOyya2wzWHunltnLWbbKocq4C_o1md=s96-c"}}

        const data = await fetch(
          `${
            process.env.EXPO_PUBLIC_API_URL
          }/auth/login/google?${new URLSearchParams({
            code: userInfo.serverAuthCode,
            scope: userInfo.scopes.join(" "),
            returnSessionId: "true",
          })}`
        ).then((r) => r.json());

        if (data?.session) signIn(data.session);

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

  return isIUSDChromebook ? null : children ? (
    trigger
  ) : (
    <>
      <Button
        height={60}
        variant="filled"
        isLoading={loading}
        spinnerColor={signup ? undefined : theme[2]}
        onPress={handleClick}
        containerStyle={{ width: "100%" }}
        textStyle={signup ? undefined : { color: theme[2] }}
        iconStyle={signup ? undefined : { color: theme[2] }}
        backgroundColors={
          signup
            ? undefined
            : {
                default: theme[11],
                hovered: theme[11],
                pressed: theme[11],
              }
        }
        text="Continue with Google"
        icon={
          (
            <Svg
              fill={theme[signup ? 11 : 2]}
              width={24}
              height={24}
              viewBox="0 0 512 512"
            >
              <Path d="M473.16,221.48l-2.26-9.59H262.46v88.22H387c-12.93,61.4-72.93,93.72-121.94,93.72-35.66,0-73.25-15-98.13-39.11a140.08,140.08,0,0,1-41.8-98.88c0-37.16,16.7-74.33,41-98.78s61-38.13,97.49-38.13c41.79,0,71.74,22.19,82.94,32.31l62.69-62.36C390.86,72.72,340.34,32,261.6,32h0c-60.75,0-119,23.27-161.58,65.71C58,139.5,36.25,199.93,36.25,256S56.83,369.48,97.55,411.6C141.06,456.52,202.68,480,266.13,480c57.73,0,112.45-22.62,151.45-63.66,38.34-40.4,58.17-96.3,58.17-154.9C475.75,236.77,473.27,222.12,473.16,221.48Z" />
            </Svg>
          ) as any
        }
        bold
        large
      />
    </>
  );
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
              // publicKey: bufferToBase64URLString(
              //   json.response?.getPublicKey().toString()
              // ),
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

function Email({ control, handleSubmit }: { control: any; handleSubmit }) {
  const theme = useColorTheme();
  const inputRef = useRef(null);
  const passwordRef = useRef(null);

  const onFinish = () => {
    setTimeout(handleSubmit, 100);
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      inputRef.current.setAttribute("name", "email");
      passwordRef.current.setAttribute("name", "password");
    }
  });

  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <KeyboardAwareScrollView
      bounces={false}
      keyboardShouldPersistTaps="handled"
      style={{
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: insets.top + 20,
      }}
      contentContainerStyle={{
        justifyContent: "center",
        flexGrow: 1,
      }}
    >
      <View style={{ gap: 10 }}>
        <Text
          style={[
            {
              fontFamily: "serifText700",
              fontSize: 30,
              color: theme[11],
              marginTop: "auto",
            },
            !breakpoints.md && {
              textAlign: "center",
              marginBottom: 10,
            },
          ]}
        >
          Sign in with email
        </Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur } }) => (
            <TextField
              style={{
                height: 60,
                fontFamily: "body_600",
                borderRadius: 20,
                fontSize: 20,
                color: theme[11],
                paddingHorizontal: 20,
                borderWidth: 0,
              }}
              inputRef={inputRef}
              placeholder="Email or username..."
              onBlur={onBlur}
              onChangeText={onChange}
              onSubmitEditing={onFinish}
              variant="filled+outlined"
              autoComplete="email"
              keyboardType="email-address"
            />
          )}
          name="email"
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur } }) => (
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
              placeholder="Password..."
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              autoComplete="current-password"
              onSubmitEditing={onFinish}
              inputRef={passwordRef}
              variant="filled+outlined"
            />
          )}
          name="password"
        />
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
            isLoading={false}
            text="Continue"
            icon="east"
            iconPosition="end"
            large
            containerStyle={{ flex: 1 }}
            bold
          />
        </View>
        <Button
          height={50}
          onPress={() => router.push("/auth/forgot-password")}
          isLoading={false}
          text="Need help?"
          containerStyle={{ marginTop: "auto" }}
        />
      </View>
    </KeyboardAwareScrollView>
  );
}

export default function SignIn() {
  const { signIn, session } = useSession();
  const [step, setStep] = useState<any>(0);
  const breakpoints = useResponsiveBreakpoints();
  const [token, setToken] = useState("");

  const theme = useColorTheme();

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
      twoFactorCode: "",
    },
  });

  const onSubmit = useCallback(
    async (data) => {
      try {
        if (step === "email" || step === 0 || step === 3) {
          setStep(1);
        } else {
          setStep(step === 3 ? 4 : 2);
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
            setToken(null);
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
          router.push("/home");
        }
      } catch (e) {
        console.error(e);
        alert(e);
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
      router.replace("/home");
    }
  }, [session]);

  return (
    <>
      <View style={{ flex: 1 }}>
        {step === 4 || step === 2 ? (
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
        ) : step === 0 ? (
          <Email control={control} handleSubmit={handleSubmit(onSubmit)} />
        ) : step === 1 ? (
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
                    fontSize: 15,
                  },
                ]}
              >
                Are you human? Let's find out...
              </Text>
              <Turnstile setToken={setToken} />
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
                  },
                ]}
              >
                Two factor auth
              </Text>
              <Text
                weight={700}
                style={{ color: theme[11], fontSize: 20, opacity: 0.6 }}
              >
                Enter the code from your authenticator app
              </Text>

              <Controller
                control={control}
                rules={{
                  required: true,
                }}
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

