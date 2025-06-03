import { useSession } from "@/context/AuthProvider";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
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
export default function SignIn() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const handleSignUpPress = () => {
    router.push("/auth/join");
  };
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: breakpoints.md ? 40 : 20,
        paddingBottom: 0,
        paddingLeft: breakpoints.md ? 60 : undefined,
      }}
    >
      <Text
        style={{
          fontFamily: "serifText700",
          fontSize: breakpoints.md ? 45 : 35,
          color: theme[11],
          paddingTop: 60,
          marginTop: "auto",
        }}
      >
        Welcome back!
      </Text>
      <Text
        style={{
          opacity: 0.4,
          fontSize: breakpoints.md ? 25 : 20,
          marginTop: 5,
          marginBottom: 20,
          color: theme[11],
        }}
        weight={600}
      >
        Pick a method to sign in
      </Text>
      {Platform.OS === "ios" && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={5}
          style={{ marginBottom: 10 }}
          onPress={async () => {
            try {
              const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                  AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                  AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
              });
              // signed in
              alert(JSON.stringify(credential));
            } catch (e) {
              if (e.code === "ERR_REQUEST_CANCELED") {
                // handle that the user canceled the sign-in flow
              } else {
                // handle other errors
              }
            }
          }}
        />
      )}

      <View style={{ flexDirection: "row", gap: 10 }}>
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
            icon={
              (
                <Svg
                  fill={theme[3]}
                  width={24}
                  height={24}
                  viewBox="0 0 512 512"
                >
                  <Path d="M473.16,221.48l-2.26-9.59H262.46v88.22H387c-12.93,61.4-72.93,93.72-121.94,93.72-35.66,0-73.25-15-98.13-39.11a140.08,140.08,0,0,1-41.8-98.88c0-37.16,16.7-74.33,41-98.78s61-38.13,97.49-38.13c41.79,0,71.74,22.19,82.94,32.31l62.69-62.36C390.86,72.72,340.34,32,261.6,32h0c-60.75,0-119,23.27-161.58,65.71C58,139.5,36.25,199.93,36.25,256S56.83,369.48,97.55,411.6C141.06,456.52,202.68,480,266.13,480c57.73,0,112.45-22.62,151.45-63.66,38.34-40.4,58.17-96.3,58.17-154.9C475.75,236.77,473.27,222.12,473.16,221.48Z" />
                </Svg>
              ) as any
            }
            text="Google"
            iconStyle={{ marginBottom: Platform.OS === "web" ? 0 : -5 }}
            style={[
              { justifyContent: "flex-start", paddingLeft: 25, gap: 15 },
              !breakpoints.md && {
                flexDirection: "column",
                justifyContent: "center",
                gap: 5,
              },
            ]}
            height={breakpoints.md ? undefined : 90}
            onPress={handleSignUpPress}
            textStyle={{ color: theme[3] }}
            containerStyle={[
              { flex: 1 },
              !breakpoints.md && { borderRadius: 30 },
            ]}
            iconSize={30}
            backgroundColors={{
              default: theme[11],
              hovered: theme[11],
              pressed: theme[11],
            }}
          />
        </GoogleAuth>
        <Button
          large
          bold
          icon="alternate_email"
          text="Email"
          onPress={() => router.push("/auth/email")}
          style={[
            { justifyContent: "flex-start", paddingLeft: 25, gap: 15 },
            !breakpoints.md && {
              flexDirection: "column",
              justifyContent: "center",
              gap: 5,
            },
          ]}
          iconSize={30}
          height={breakpoints.md ? undefined : 90}
          containerStyle={[
            { flex: 1 },
            !breakpoints.md && { borderRadius: 30 },
          ]}
          variant="filled"
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          marginVertical: 10,
        }}
      >
        <PasskeyModal>
          <Button
            large
            bold
            icon="vpn_key"
            text="Passkey"
            variant="filled"
            onPress={handleSignUpPress}
            style={[
              { justifyContent: "flex-start", paddingLeft: 25, gap: 15 },
              !breakpoints.md && {
                flexDirection: "column",
                justifyContent: "center",
                gap: 5,
              },
            ]}
            iconSize={30}
            height={breakpoints.md ? undefined : 90}
            containerStyle={[
              { flex: 1 },
              !breakpoints.md && { borderRadius: 30 },
            ]}
          />
        </PasskeyModal>
        <QrModal>
          <Button
            large
            bold
            icon="center_focus_weak"
            text="QR code"
            onPress={handleSignUpPress}
            variant="filled"
            style={[
              { justifyContent: "flex-start", paddingLeft: 25, gap: 15 },
              !breakpoints.md && {
                flexDirection: "column",
                justifyContent: "center",
                gap: 5,
              },
            ]}
            iconSize={30}
            height={breakpoints.md ? undefined : 90}
            containerStyle={[
              { flex: 1 },
              !breakpoints.md && { borderRadius: 30 },
            ]}
          />
        </QrModal>
      </View>
      <Button
        large
        bold
        iconPosition="end"
        icon="arrow_forward_ios"
        text="Join Dysperse"
        onPress={handleSignUpPress}
        containerStyle={{ flex: 1, marginTop: "auto" }}
      />
    </View>
  );
}

