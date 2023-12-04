import { GluestackUIProvider } from "@gluestack-ui/themed";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { config } from "../config/gluestack-ui.config"; // Optional if you want to use default theme
import { useAuth } from "../context/AuthProvider";
import * as themes from "../themes";
import Navbar from "../ui/navbar";
import { toastConfig } from "../ui/toast.config";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session } = useAuth();

  const [fontsLoaded] = useFonts({
    heading: require("../assets/fonts/league-gothic.otf"),
    body_100: require("../assets/fonts/WorkSans/WorkSans-Thin.ttf"),
    body_300: require("../assets/fonts/WorkSans/WorkSans-Light.ttf"),
    body_400: require("../assets/fonts/WorkSans/WorkSans-Regular.ttf"),
    body_500: require("../assets/fonts/WorkSans/WorkSans-Medium.ttf"),
    body_600: require("../assets/fonts/WorkSans/WorkSans-SemiBold.ttf"),
    body_700: require("../assets/fonts/WorkSans/WorkSans-Bold.ttf"),
    body_800: require("../assets/fonts/WorkSans/WorkSans-Black.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  console.log(session);

  return (
    <GluestackUIProvider
      config={{
        ...config,
        tokens: {
          ...config.tokens,
          colors: {
            ...config.tokens.colors,
            ...Object.fromEntries(
              Object.entries(themes["mint"]).map(([key, value]) => {
                const match = key.match(/([a-zA-Z]+)(\d+)/);
                return match ? [`primary${match[2]}`, value] : [key, value];
              })
            ),
          },
        },
      }}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "transparent",
            },
            contentStyle: {
              backgroundColor: "#fff",
            },
            header: (props) => <Navbar {...props} />,
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(auth)/auth/login"
            options={{
              headerTitle: "Sign in",
            }}
          />
          <Stack.Screen
            name="(auth)/auth/signup"
            options={{
              headerTitle: "Signup",
            }}
          />
        </Stack>
        <Toast topOffset={20} config={toastConfig} />
      </SafeAreaView>
    </GluestackUIProvider>
  );
}
