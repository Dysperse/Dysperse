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
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import "react-native-gesture-handler";
import { SessionProvider, useSession } from "../context/AuthProvider";

if (Platform.OS === "android") {
  NavigationBar.setPositionAsync("absolute");
  NavigationBar.setBackgroundColorAsync("transparent");
  NavigationBar.setBackgroundColorAsync("transparent");
  NavigationBar.setBorderColorAsync("transparent");
}

SplashScreen.preventAutoHideAsync();

import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";

import { AppState, Platform } from "react-native";
import { SWRConfig } from "swr";
import * as serviceWorkerRegistration from "../assets/serviceWorkerRegistration";
import { SessionLoadingScreen } from "./(app)/_layout";

function localStorageProvider() {
  // When initializing, we restore the data from `localStorage` into a map.
  const map = new Map(JSON.parse(localStorage.getItem("app-cache") || "[]"));

  // Before unloading the app, we write back all the data into `localStorage`.
  window.addEventListener("beforeunload", () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem("app-cache", appCache);
  });

  // On window change focus, we write back all the data into `localStorage`.
  window.addEventListener("blur", () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem("app-cache", appCache);
  });

  // We still use the map for write & read for performance.
  return map;
}

function SWRWrapper({ children }) {
  const { session } = useSession();
  return (
    <SWRConfig
      value={{
        fetcher: async ([
          resource,
          params,
          host = "https://api.dysperse.com",
          init = {},
        ]) => {
          const url = `${host}/${resource}?${new URLSearchParams(
            params
          ).toString()}`;
          const res = await fetch(url, {
            headers: {
              Authorization: `Bearer ${session}`,
            },
            ...init,
          });
          return await res.json();
        },

        provider:
          Platform.OS === "web" ? localStorageProvider : () => new Map(),
        isVisible: () => true,
        initFocus(callback) {
          let appState = AppState.currentState;

          const onAppStateChange = (nextAppState) => {
            /* If it's resuming from background or inactive mode to active one */
            if (
              appState.match(/inactive|background/) &&
              nextAppState === "active"
            ) {
              callback();
            }
            appState = nextAppState;
          };

          // Subscribe to the app state change events
          const subscription = AppState.addEventListener(
            "change",
            onAppStateChange
          );

          return () => {
            subscription.remove();
          };
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}

export default function Root() {
  // CHANGE THIS LATER!!!
  const theme = useColor("violet", true);

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
        <SWRWrapper>
          <Slot screenOptions={{ onLayoutRootView }} />
        </SWRWrapper>
      </SessionProvider>
    </ColorThemeProvider>
  );
}

if (Platform.OS === "web") {
  serviceWorkerRegistration.register();
}
