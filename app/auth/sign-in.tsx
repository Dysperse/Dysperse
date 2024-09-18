import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Modal from "@/ui/Modal";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import dayjs from "dayjs";
import * as Device from "expo-device";
import { LinearGradient } from "expo-linear-gradient";
import { createURL } from "expo-linking";
import * as Network from "expo-network";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { cloneElement, useCallback, useEffect, useRef, useState } from "react";
import { Control, Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import * as passkey from "react-native-passkeys";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Path, Svg } from "react-native-svg";
import Toast from "react-native-toast-message";
import { rp } from "../(app)/settings/account/passkeys";
import { authStyles } from "../../components/authStyles";
import { useSession } from "../../context/AuthProvider";
import { sendApiRequest } from "../../helpers/api";
import Turnstile from "../../ui/turnstile";

const styles = StyleSheet.create({
  title: { fontSize: 55, width: "100%", lineHeight: 55 },
});

const isIUSDChromebook =
  Platform.OS === "web" &&
  navigator.userAgent.includes("CrOS") &&
  typeof navigator?.managed?.getHostname === "function" &&
  dayjs.tz.guess() === "America/Los_Angeles" &&
  navigator.language === "en-US";

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
        fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/qr?token=${data.token}`,
          {
            method: "PATCH",
          }
        )
          .then((r) => r.json())
          .then((r) => {
            // console.log(r);
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
    <View style={{ marginHorizontal: "auto" }}>
      <Spinner />
    </View>
  );
}

function QrModal({ children }: { children: any }) {
  const ref = useRef<BottomSheetModal>(null);
  const trigger = cloneElement(children, {
    onPress: () => ref.current.present(),
  });

  return (
    <>
      {trigger}
      <Modal animation="SCALE" sheetRef={ref} maxWidth={300}>
        <IconButton
          icon="close"
          size={50}
          onPress={() => ref.current.forceClose({ duration: 0.00001 })}
          variant="outlined"
          style={{ margin: 20, marginBottom: 0 }}
        />
        <QrLogin />
      </Modal>
    </>
  );
}

function Email({
  control,
  setStep,
  handleSubmit,
}: {
  control: any;
  setStep: any;
  handleSubmit;
}) {
  const theme = useColorTheme();
  const inputRef = useRef(null);

  const onFinish = () => {
    setTimeout(handleSubmit, 100);
  };

  return (
    <View style={{ flex: 1 }}>
      <IconButton
        icon="arrow_back"
        size={55}
        onPress={() => setStep(0)}
        variant="outlined"
        style={{ marginBottom: 0 }}
      />
      <View style={{ padding: 20, gap: 10 }}>
        <Emoji emoji="2709" size={60} style={{ alignSelf: "center" }} />
        <Text
          style={{
            fontFamily: "serifText800",
            fontSize: 40,
            color: theme[11],
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Enter your email
        </Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              style={{
                height: 60,
                fontFamily: "body_900",
                borderRadius: 99,
                fontSize: 20,
                color: theme[11],
                paddingHorizontal: 20,
              }}
              inputRef={inputRef}
              placeholder="Email or username..."
              onBlur={onBlur}
              onChangeText={onChange}
              autoFocus
              onSubmitEditing={onFinish}
              value={value}
              variant="filled+outlined"
            />
          )}
          name="email"
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              style={{
                height: 60,
                fontFamily: "body_900",
                borderRadius: 99,
                fontSize: 20,
                color: theme[11],
                paddingHorizontal: 20,
              }}
              placeholder="Password"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              onSubmitEditing={onFinish}
              value={value}
              variant="filled+outlined"
            />
          )}
          name="password"
        />
        <Button
          variant="filled"
          height={70}
          onPress={onFinish}
          isLoading={false}
          text="Continue"
          icon="east"
          iconPosition="end"
          large
          bold
        />
        <Button
          variant="outlined"
          height={50}
          onPress={() => router.push("/auth/forgot-password")}
          isLoading={false}
          text="Forgot password?"
          icon="east"
          iconPosition="end"
          large
        />
      </View>
    </View>
  );
}

export function GoogleAuth({
  signup,
  onNewAccount,
}: {
  signup?: boolean;
  onNewAccount?: (data) => void;
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
              redirect_uri: `${process.env.EXPO_PUBLIC_API_URL}/auth/login/google`,
              scope: "profile email",
              response_type: "code",
            }).toString()}`,
            createURL("/auth/google")
          )
        );
      } else {
        setLoading(true);
        GoogleSignin.configure({
          scopes: ["email", "profile"],
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

        console.log(data);

        if (data?.session) signIn(data.session);

        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.error(e);
      Toast.show({ type: "error" });
    }
  };

  return isIUSDChromebook ? null : (
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

function PasskeyModal({ setStep }) {
  const { signIn } = useSession();
  const [loading, setLoading] = useState(false);
  return (
    <Button
      height={60}
      variant="filled"
      isLoading={loading}
      onPress={async () => {
        try {
          setLoading(true);
          const { challenge } = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/auth/login/passkeys`
          ).then((res) => res.json());

          const json = await passkey.get({
            rpId: rp.id,
            challenge,
          });

          setStep(2);

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
          setStep(0);
          console.error("Passkey Error!", e);
          Toast.show({ type: "error" });
        } finally {
          setLoading(false);
        }
      }}
      containerStyle={{ width: "100%" }}
      text="Continue with Passkey"
      icon="key"
      bold
      large
    />
  );
}

function Credentials({
  control,
  errors,
  setStep,
  onSubmit,
  handleSubmit,
  step,
}: {
  control: Control<any>;
  errors: any;
  setStep: any;
  onSubmit: any;
  handleSubmit: any;
  step: number;
}) {
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();

  const handleCreateAccount = useCallback(
    () => router.push("/auth/sign-up"),
    []
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.push("/");
  }, []);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IconButton
        variant="outlined"
        size={55}
        icon={step === 0 ? "close" : "arrow_back"}
        onPress={handleBack}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          display: router.canGoBack() && !breakpoints.md ? "flex" : "none",
          zIndex: 100,
        }}
      />
      <View
        style={{
          maxHeight: "100%",
          flex: 1,
          alignItems: "center",
          width: "100%",
        }}
      >
        <View style={{ marginTop: "auto" }} />
        <View style={{ marginTop: 20 }} />
        <Logo size={80} />
        <Text
          style={[
            styles.title,
            {
              paddingTop: 10,
              fontSize: 40,
              color: theme[11],
              textAlign: "center",
              fontFamily: "serifText800",
            },
            !breakpoints.md && { textAlign: "center" },
          ]}
        >
          Sign in to Dysperse
        </Text>

        <View style={{ maxWidth: 350, width: "100%", gap: 10, marginTop: 20 }}>
          <GoogleAuth
            onNewAccount={(d) => {
              Toast.show({
                type: "success",
                text1: "We couldn't find an account with that email",
                props: {
                  renderTrailingIcon: () => (
                    <Button
                      onPress={() => {
                        router.push(`/auth/sign-up?${new URLSearchParams(d)}`);
                      }}
                    >
                      <ButtonText
                        style={{
                          color: theme[11],
                          fontSize: 15,
                          fontWeight: "bold",
                        }}
                      >
                        Sign up
                      </ButtonText>
                    </Button>
                  ),
                },
              });
            }}
          />
          <Button
            height={60}
            variant="filled"
            onPress={() => setStep("email")}
            {...(isIUSDChromebook && {
              textStyle: { color: theme[2] },
              iconStyle: { color: theme[2] },
              backgroundColors: {
                default: theme[11],
                hovered: theme[11],
                pressed: theme[11],
              },
            })}
            containerStyle={{ width: "100%" }}
            text="Continue with Email"
            icon="email"
            bold
            large
          />
          {/* </EmailModal> */}
          <PasskeyModal setStep={setStep} />
          <QrModal>
            <Button
              height={60}
              variant="filled"
              onPress={() => {}}
              containerStyle={{ width: "100%" }}
              text="Continue with QR Code"
              icon="center_focus_weak"
              bold
              large
            />
          </QrModal>
        </View>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            marginTop: "auto",
            marginBottom: 10 + insets.bottom,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            height={20}
            onPress={handleCreateAccount}
            containerStyle={{
              opacity: 0.5,
            }}
            textStyle={{ fontSize: 13 }}
            iconSize={20}
            iconPosition="end"
            text="Create an account"
            icon="celebration"
            large
          />
          {breakpoints.md && (
            <Button
              height={20}
              containerStyle={{
                opacity: 0.5,
              }}
              onPress={() => Linking.openURL("https://dysperse.com")}
              textStyle={{ fontSize: 13 }}
              iconSize={20}
              iconPosition="end"
              text="What's Dysperse?"
              icon="info"
              large
            />
          )}
        </View>
      </View>
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
        if (step === "email" || step === 0 || step === 3) {
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
          breakpoints.md && {
            borderColor: theme[6],
          },
        ]}
      >
        {!breakpoints.md && (
          <IconButton
            icon="close"
            size={55}
            onPress={handleBack}
            variant="outlined"
            style={{ position: "absolute", top: 10, left: 10 }}
          />
        )}
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
        ) : step === "email" ? (
          <Email
            setStep={setStep}
            control={control}
            handleSubmit={handleSubmit(onSubmit)}
          />
        ) : step === 0 ? (
          <Credentials
            control={control}
            errors={errors}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            step={step}
            setStep={setStep}
          />
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
                    textAlign: "center",
                    fontFamily: "serifText800",
                  },
                ]}
              >
                Verifying
              </Text>
              <Text
                style={[
                  authStyles.subtitleContainer,
                  { textAlign: "center", opacity: 0.6 },
                ]}
                weight={800}
              >
                Are you a human!? {"\n"} Let's find out...
              </Text>
              <Turnstile setToken={setToken} />
            </View>
          </View>
        ) : (
          <View style={authStyles.container}>
            <View style={{ marginVertical: "auto", gap: 10 }}>
              <Text
                weight={600}
                style={[
                  styles.title,
                  { color: theme[11], fontFamily: "serifText800" },
                ]}
              >
                Are you{" "}
                <Text
                  style={[
                    styles.title,
                    {
                      color: theme[11],
                      fontStyle: "italic",
                      fontFamily: "serifText800",
                    },
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
                    keyboardType="number-pad"
                    variant="filled+outlined"
                    style={{
                      paddingHorizontal: 30,
                      paddingVertical: 20,
                      fontSize: 20,
                      borderColor: errors.email ? "red" : theme[6],
                      ...(Platform.OS === "web" && { outline: "none" }),
                    }}
                    autoFocus
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
                height={70}
                onPress={handleSubmit(onSubmit)}
                isLoading={step === 4}
              >
                <ButtonText
                  weight={900}
                  style={{
                    ...authStyles.buttonText,
                    flex: undefined,
                    margin: undefined,
                  }}
                >
                  Continue
                </ButtonText>
                <Icon>east</Icon>
              </Button>
            </View>
          </View>
        )}
      </LinearGradient>
    </>
  );
}

