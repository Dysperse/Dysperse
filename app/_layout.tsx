import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { TamaguiProvider } from "tamagui";
import { AuthProvider } from "../context/AuthProvider";
import config from "../tamagui.config";
import Navbar from "../ui/navbar";
import { toastConfig } from "../ui/toast.config";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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

  return (
    <TamaguiProvider config={config}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <AuthProvider>
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
                headerShown: false,
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
        </AuthProvider>
      </SafeAreaView>
    </TamaguiProvider>
  );
}
