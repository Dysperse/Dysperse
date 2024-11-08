import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import Text, { getFontName } from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Redirect, router } from "expo-router";
import {
  ImageBackground,
  Linking,
  Platform,
  StatusBar,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authStyles } from "../../components/authStyles";

export function inIframe() {
  if (Platform.OS !== "web") return false;
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

export default function Page() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { width, height } = useWindowDimensions();
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
  if (breakpoints.md) return <Redirect href="/auth/sign-in" />;

  return (
    <View style={{ flex: 1, backgroundColor: theme[1] }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("@/assets/login.png")}
        style={{ flex: 1 }}
        imageStyle={{
          resizeMode: "cover",
          width,
          height: height + insets.top + insets.bottom,
        }}
      >
        <View
          style={[
            authStyles.container,
            breakpoints.md && authStyles.containerDesktop,
            breakpoints.md && {
              borderColor: theme[6],
            },
            {
              backgroundColor: `rgba(0, 0, 0, 0.5)`,
              padding: 20,
              paddingBottom: insets.bottom + 10,
            },
          ]}
        >
          <Text
            style={{
              fontSize: 45,
              fontFamily: "serifText800",
              color: "#fff",
              marginBottom: -5,
              // prevent wrapping
            }}
          >
            Productivity is {"\n"}your domain.
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
              weight={500}
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
              weight={500}
              style={[authStyles.subtitleText, { color: "#fff" }]}
            >
              be your
            </Text>
            <Text
              weight={500}
              style={[authStyles.subtitleText, { color: "#fff" }]}
            >
              catalyst.
            </Text>
          </View>
          <Button
            variant="filled"
            height={70}
            backgroundColors={{
              default: "rgba(255, 255, 255, 0.1)",
              hovered: "rgba(255, 255, 255, 0.15)",
              pressed: "rgba(255, 255, 255, 0.2)",
            }}
            android_ripple={{ color: "rgba(255, 255, 255, 0.2)" }}
            onPress={handleLoginPress}
          >
            <ButtonText
              style={[authStyles.buttonText, { color: "#fff" }]}
              weight={900}
            >
              Sign in
            </ButtonText>
          </Button>
          <Button
            variant="outlined"
            borderColors={{
              default: "rgba(255, 255, 255, 0.1)",
              hovered: "rgba(255, 255, 255, 0.15)",
              pressed: "rgba(255, 255, 255, 0.2)",
            }}
            backgroundColors={{
              default: "rgba(255, 255, 255, 0.0)",
              hovered: "rgba(255, 255, 255, 0.1)",
              pressed: "rgba(255, 255, 255, 0.2)",
            }}
            height={70}
            android_ripple={{ color: "rgba(255, 255, 255, 0.2)" }}
            onPress={handleSignUpPress}
          >
            <ButtonText
              style={[authStyles.buttonText, { color: "#fff" }]}
              weight={900}
            >
              Create an account
            </ButtonText>
          </Button>
        </View>
      </ImageBackground>
    </View>
  );
}
