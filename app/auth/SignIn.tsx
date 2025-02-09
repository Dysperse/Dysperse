import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import { router } from "expo-router";
import { Linking, Platform, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

export function SignIn() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { width, height } = useWindowDimensions();

  function inIframe() {
    if (Platform.OS !== "web") return false;
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  const handleLoginPress = () => {
    if (Platform.OS === "web" && inIframe())
      window.open("/auth/sign-in", "_blank");
    else router.push("/auth/sign-in");
  };
  const handleSignUpPress = () => {
    if (Platform.OS === "web" && inIframe())
      window.open("/auth/sign-up", "_blank");
    else router.push("/auth/sign-up");
  };
  const openHomePage = () =>
    Linking.openURL("https://dysperse.com?utm_source=app");

  const insets = useSafeAreaInsets();

  const backgroundColors = {
    default: "rgba(0,0,0,0.1)",
    hovered: "rgba(0,0,0,0.2)",
    pressed: "rgba(0,0,0,0.3)",
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
      }}
    >
      <Text style={{ fontFamily: "serifText700", fontSize: 41 }}>
        Welcome back!
      </Text>
      <Text
        style={{
          opacity: 0.6,
          fontSize: 22,
          marginTop: 5,
          marginBottom: 20,
        }}
      >
        Pick a method to sign in.
      </Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button
          large
          bold
          icon={
            <Svg fill="#000" width={24} height={24} viewBox="0 0 512 512">
              <Path d="M473.16,221.48l-2.26-9.59H262.46v88.22H387c-12.93,61.4-72.93,93.72-121.94,93.72-35.66,0-73.25-15-98.13-39.11a140.08,140.08,0,0,1-41.8-98.88c0-37.16,16.7-74.33,41-98.78s61-38.13,97.49-38.13c41.79,0,71.74,22.19,82.94,32.31l62.69-62.36C390.86,72.72,340.34,32,261.6,32h0c-60.75,0-119,23.27-161.58,65.71C58,139.5,36.25,199.93,36.25,256S56.83,369.48,97.55,411.6C141.06,456.52,202.68,480,266.13,480c57.73,0,112.45-22.62,151.45-63.66,38.34-40.4,58.17-96.3,58.17-154.9C475.75,236.77,473.27,222.12,473.16,221.48Z" />
            </Svg>
          }
          text="Google"
          style={{ justifyContent: "flex-start", paddingLeft: 25, gap: 15 }}
          onPress={handleSignUpPress}
          textStyle={{ color: "#000" }}
          containerStyle={{ flex: 1 }}
          backgroundColors={{
            default: theme[11],
            hovered: theme[11],
            pressed: theme[11],
          }}
        />
        <Button
          large
          bold
          icon="alternate_email"
          text="Email"
          onPress={handleSignUpPress}
          style={{ justifyContent: "flex-start", paddingLeft: 25, gap: 15 }}
          containerStyle={{ flex: 1 }}
          variant="filled"
        />
      </View>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <Button
          large
          bold
          icon="vpn_key"
          text="Passkey"
          variant="filled"
          onPress={handleSignUpPress}
          style={{ justifyContent: "flex-start", paddingLeft: 25, gap: 15 }}
          containerStyle={{ flex: 1 }}
        />
        <Button
          large
          bold
          icon="center_focus_weak"
          text="QR code"
          onPress={handleSignUpPress}
          variant="filled"
          style={{ justifyContent: "flex-start", paddingLeft: 25, gap: 15 }}
          containerStyle={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
