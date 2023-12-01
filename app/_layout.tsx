import { GluestackUIProvider } from "@gluestack-ui/themed";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { createContext, useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { config } from "../config/gluestack-ui.config"; // Optional if you want to use default theme
import Navbar from "../ui/navbar";
import { toastConfig } from "../ui/toast.config";
import { AuthProvider, useAuth } from "../context/AuthProvider";
import * as themes from "../themes";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session } = useAuth();

  const [fontsLoaded] = useFonts({
    heading: require("../assets/fonts/league-gothic.otf"),
    Inter: require("../assets/fonts/inter/Inter-Regular.ttf"),
    InterBold: require("../assets/fonts/inter/Inter-Bold.ttf"),
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
