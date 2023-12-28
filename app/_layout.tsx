import "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { SessionProvider } from "../context/AuthProvider";

SplashScreen.preventAutoHideAsync();

import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";

import * as serviceWorkerRegistration from "../assets/serviceWorkerRegistration";
import { Platform } from "react-native";

export default function Root() {
  // CHANGE THIS LATER!!!
  const theme = useColor("violet", false);

  // Set up the auth context and render our layout inside of it.

  const [fontsLoaded] = useFonts({
    heading: require("../assets/fonts/heading.ttf"),
    body_100: require("../assets/fonts/WorkSans/WorkSans-Thin.ttf"),
    body_300: require("../assets/fonts/WorkSans/WorkSans-Light.ttf"),
    body_400: require("../assets/fonts/WorkSans/WorkSans-Regular.ttf"),
    body_500: require("../assets/fonts/WorkSans/WorkSans-Medium.ttf"),
    body_600: require("../assets/fonts/WorkSans/WorkSans-SemiBold.ttf"),
    body_700: require("../assets/fonts/WorkSans/WorkSans-Bold.ttf"),
    body_800: require("../assets/fonts/WorkSans/WorkSans-Black.ttf"),
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
    return null;
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
