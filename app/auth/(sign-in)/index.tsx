import { useSession } from "@/context/AuthProvider";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import { useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import IconButton from "@/ui/IconButton";
import Modal from "@/ui/Modal";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import { cloneElement, useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import Svg, { Path } from "react-native-svg";
import Toast from "react-native-toast-message";
import { GoogleAuth, PasskeyModal } from "./(login)/email";
import { BannerImage } from "./_layout";

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
    <View style={{ marginHorizontal: "auto", marginBottom: 20 }}>
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
function AppleAuth() {
  const isDark = useDarkMode();
  const { signIn } = useSession();

  return (
    <>
      {AppleAuthentication.isAvailableAsync() && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={
            AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
          }
          buttonStyle={
            isDark
              ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
          }
          cornerRadius={19.4}
          style={{
            width: 80,
            height: "100%",
          }}
          onPress={async () => {
            Toast.show({
              type: "loading",
              autoHide: false,
              text1: "Signing in with Apple...",
              props: {
                renderTrailingIcon: () => <Spinner />,
              },
            });
            try {
              const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                  AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                  AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
              });
              const data = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/auth/login/apple`,
                {
                  method: "POST",
                  body: JSON.stringify(credential),
                }
              ).then((r) => r.json());
              if (data?.sessionId) signIn(data.sessionId);
              else if (data.isNew) {
                Toast.show({
                  type: "success",
                  text1: "We couldn't find an account with that email",
                });
                router.push({
                  pathname: "/auth/join",
                  params: {
                    appleAuthFillPassword: true,
                    email: credential.email,
                    name: credential.fullName
                      ? `${credential.fullName?.givenName} ${credential.fullName?.familyName}`
                      : "John Doe",
                  },
                });
              }
            } catch (e) {
              Toast.show({ type: "error" });
              console.log(e);
            }
          }}
        />
      )}
    </>
  );
}

export function PasskeyAuth() {
  const breakpoints = useResponsiveBreakpoints();

  return (
    <PasskeyModal>
      <Button
        large
        bold
        icon="vpn_key"
        text="Continue with Passkey"
        variant="outlined"
        iconSize={undefined}
        height={60}
        containerStyle={[{ flex: 1 }]}
      />
    </PasskeyModal>
  );
}

export default function SignIn() {
  const isDark = useDarkMode();
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        paddingTop: breakpoints.md ? 40 : 10,
        paddingBottom: 0,
        padding: breakpoints.md ? 40 : 20,
        paddingLeft: breakpoints.md ? 40 : undefined,
      }}
    >
      <Text
        style={{
          fontFamily: "serifText700",
          fontSize: breakpoints.md ? 50 : 40,
          color: theme[11],
          textAlign: "center",
        }}
      >
        Oh, hello.
      </Text>
      <Text
        style={{
          opacity: 0.4,
          fontSize: breakpoints.md ? 25 : 20,
          color: theme[11],
          textAlign: "center",
          marginBottom: 17,
          marginTop: Platform.OS === "android" ? 0 : 5,
          marginHorizontal: 20,
        }}
        weight={600}
      >
        We’ll check if you have an account,{"\n"}and help create one if you
        don’t.
      </Text>

      <View
        style={{
          flexDirection: "row",
          gap: 10,
          width: "100%",
          marginHorizontal: "auto",
        }}
      >
        <Button
          large
          bold
          icon="alternate_email"
          text="Email"
          onPress={() => router.push("/auth/email")}
          style={[{ gap: 15 }]}
          iconSize={30}
          height={70}
          containerStyle={{ flex: 1, borderRadius: 20 }}
          variant="filled"
          iconStyle={{ color: !isDark ? "#fff" : "#000" }}
          textStyle={{ color: !isDark ? "#fff" : "#000" }}
          backgroundColors={{
            default: isDark ? "#fff" : "#000",
            hovered: isDark ? "#fff" : "#000",
            pressed: isDark ? "#fff" : "#000",
          }}
          android_ripple={{ color: isDark ? "#000" : "#fff" }}
        />
        {breakpoints.md && (
          <QrModal>
            <Button
              large
              bold
              icon="qr_code"
              text="QR code"
              variant="filled"
              backgroundColors={{
                default: isDark ? "#fff" : "#000",
                hovered: isDark ? "#fff" : "#000",
                pressed: isDark ? "#fff" : "#000",
              }}
              textStyle={{ color: !isDark ? "#fff" : "#000" }}
              iconStyle={{ color: !isDark ? "#fff" : "#000" }}
              android_ripple={{ color: isDark ? "#000" : "#fff" }}
              style={[{ gap: 15 }]}
              iconSize={30}
              height={70}
              containerStyle={[{ flex: 1 }, { borderRadius: 22 }]}
            />
          </QrModal>
        )}
        <AppleAuth />
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
        >
          <Button
            large
            bold
            android_ripple={{ color: isDark ? "#000" : "#fff" }}
            icon={
              (
                <Svg
                  fill={isDark ? "#000" : "#fff"}
                  width={24}
                  height={24}
                  viewBox="0 0 512 512"
                >
                  <Path d="M473.16,221.48l-2.26-9.59H262.46v88.22H387c-12.93,61.4-72.93,93.72-121.94,93.72-35.66,0-73.25-15-98.13-39.11a140.08,140.08,0,0,1-41.8-98.88c0-37.16,16.7-74.33,41-98.78s61-38.13,97.49-38.13c41.79,0,71.74,22.19,82.94,32.31l62.69-62.36C390.86,72.72,340.34,32,261.6,32h0c-60.75,0-119,23.27-161.58,65.71C58,139.5,36.25,199.93,36.25,256S56.83,369.48,97.55,411.6C141.06,456.52,202.68,480,266.13,480c57.73,0,112.45-22.62,151.45-63.66,38.34-40.4,58.17-96.3,58.17-154.9C475.75,236.77,473.27,222.12,473.16,221.48Z" />
                </Svg>
              ) as any
            }
            iconStyle={{ marginBottom: Platform.OS === "web" ? 0 : -5 }}
            style={[
              !breakpoints.md && {
                flexDirection: "column",
                justifyContent: "center",
                gap: 5,
              },
            ]}
            height={70}
            containerStyle={[{ width: 80, borderRadius: 20 }]}
            iconSize={30}
            variant="filled"
            backgroundColors={{
              default: isDark ? "#fff" : "#000",
              hovered: isDark ? "#fff" : "#000",
              pressed: isDark ? "#fff" : "#000",
            }}
          />
        </GoogleAuth>
      </View>

      {!breakpoints.lg && <BannerImage />}
    </View>
  );
}

