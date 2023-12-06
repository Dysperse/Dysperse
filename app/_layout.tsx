import { Slot } from "expo-router";
import { SessionProvider } from "../context/AuthProvider";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { useFonts } from "expo-font";
import "./styles.css";

SplashScreen.preventAutoHideAsync();
import { NativeWindStyleSheet } from "nativewind";

NativeWindStyleSheet.setOutput({
  default: "native",
});

export default function Root() {
  // Set up the auth context and render our layout inside of it.

  const [fontsLoaded] = useFonts({
    heading: require("../assets/fonts/league-gothic.otf"),
    body_100: require("../assets/fonts/WorkSans/WorkSans-Thin.ttf"),
    body_300: require("../assets/fonts/WorkSans/WorkSans-Light.ttf"),
    body_400: require("../assets/fonts/WorkSans/WorkSans-Regular.ttf"),
    body_500: require("../assets/fonts/WorkSans/WorkSans-Medium.ttf"),
    body_600: require("../assets/fonts/WorkSans/WorkSans-SemiBold.ttf"),
    body_700: require("../assets/fonts/WorkSans/WorkSans-Bold.ttf"),
    body_800: require("../assets/fonts/WorkSans/WorkSans-Black.ttf"),
    symbols_outlined: require("../assets/fonts/symbols/outlined.ttf"),
    symbols_filled: require("../assets/fonts/symbols/filled.ttf"),
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
    <SessionProvider>
      <Slot screenOptions={{ onLayoutRootView }} />
    </SessionProvider>
  );
}
