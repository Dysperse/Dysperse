import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import Text, { getFontName } from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Redirect, router } from "expo-router";
import { ImageBackground, Linking, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authStyles } from "../../components/authStyles";

export default function Page() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();

  const handleLoginPress = () => router.push("/auth/sign-in");
  const handleSignUpPress = () => router.push("/auth/sign-up");
  const openHomePage = () =>
    Linking.openURL("https://dysperse.com?utm_source=app");

  if (breakpoints.md) return <Redirect href="/auth/sign-in" />;

  return (
    <View style={{ flex: 1, backgroundColor: theme[1] }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("@/assets/login.png")}
        style={{
          flex: 1,
        }}
      >
        <View
          style={[
            authStyles.container,
            breakpoints.md && authStyles.containerDesktop,
            breakpoints.md && {
              borderColor: theme[6],
            },
            { backgroundColor: `rgba(0, 0, 0, 0.5)`, padding: 20 },
          ]}
        >
          <Text
            style={{
              fontSize: 50,
              fontFamily: "serifText800",
              color: "#fff",
              marginBottom: -5,
            }}
          >
            Productivity&nbsp;is your&nbsp;domain.
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 5,
            }}
          >
            <Text
              weight={900}
              style={[authStyles.subtitleText, { color: "#fff" }]}
            >
              Let
            </Text>
            <Chip
              onPress={openHomePage}
              label="#dysperse"
              style={({ pressed, hovered }) => ({
                backgroundColor: `rgba(255,255,255,${
                  pressed ? 0.3 : hovered ? 0.25 : 0.2
                })`,
              })}
              textStyle={{
                color: "#fff",
                fontFamily: getFontName("jetBrainsMono", 500),
                fontSize: 20,
              }}
              icon={<Icon style={{ color: "#fff" }}>north_east</Icon>}
              iconPosition="after"
            />
            <Text
              weight={900}
              style={[authStyles.subtitleText, { color: "#fff" }]}
            >
              be the
            </Text>
            <Text
              weight={900}
              style={[authStyles.subtitleText, { color: "#fff" }]}
            >
              catalyst
            </Text>
          </View>
          <Button
            variant="filled"
            style={({ pressed, hovered }) => [
              authStyles.button,
              {
                backgroundColor: `rgba(255, 255, 255, ${
                  pressed ? 0.2 : hovered ? 0.15 : 0.1
                })`,
              },
            ]}
            onPress={handleLoginPress}
          >
            <ButtonText style={[authStyles.buttonText, { color: "#fff" }]}>
              Sign in
            </ButtonText>
          </Button>
          <Button
            variant="filled"
            style={({ pressed, hovered }) => [
              authStyles.button,
              {
                marginBottom: insets.bottom,
                backgroundColor: `rgba(255, 255, 255, ${
                  pressed ? 0.2 : hovered ? 0.15 : 0.1
                })`,
              },
            ]}
            onPress={handleSignUpPress}
          >
            <ButtonText style={[authStyles.buttonText, { color: "#fff" }]}>
              Create an account
            </ButtonText>
          </Button>
        </View>
      </ImageBackground>
    </View>
  );
}
