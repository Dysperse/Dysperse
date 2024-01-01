import "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { SessionProvider } from "../context/AuthProvider";
import {
  Jost_100Thin,
  Jost_200ExtraLight,
  Jost_300Light,
  Jost_400Regular,
  Jost_500Medium,
  Jost_600SemiBold,
  Jost_700Bold,
  Jost_800ExtraBold,
  Jost_900Black,
} from "@expo-google-fonts/jost";

SplashScreen.preventAutoHideAsync();

import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";

import * as serviceWorkerRegistration from "../assets/serviceWorkerRegistration";
import { Platform } from "react-native";
import { SessionLoadingScreen } from "./(app)/_layout";

export default function Root() {
  // CHANGE THIS LATER!!!
  const theme = useColor("violet", false);

  // Set up the auth context and render our layout inside of it.

  const [fontsLoaded] = useFonts({
    heading: require("../assets/fonts/heading.ttf"),
    body_100: Jost_100Thin,
    body_200: Jost_200ExtraLight,
    body_300: Jost_300Light,
    body_400: Jost_400Regular,
    body_500: Jost_500Medium,
    body_600: Jost_600SemiBold,
    body_700: Jost_700Bold,
    body_800: Jost_800ExtraBold,
    body_900: Jost_900Black,
    symbols_outlined: require("../assets/fonts/symbols/outlined.ttf"),
    symbols_filled: require("../assets/fonts/symbols/filled.ttf"),
    symbols_bold_outlined: require("../assets/fonts/symbols/bold.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <SessionLoadingScreen />;
  }

  return (
    <ColorThemeProvider theme={theme}>
      <SessionProvider>
        <Slot screenOptions={{ onLayoutRootView }} />
      </SessionProvider>
    </ColorThemeProvider>
  );
}

if (Platform.OS === "web") {
  serviceWorkerRegistration.register();
}
