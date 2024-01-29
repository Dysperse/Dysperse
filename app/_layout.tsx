import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
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
import * as Sentry from "@sentry/react-native";
import { ErrorBoundary } from "@sentry/react-native";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { Slot, useNavigationContainerRef } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import * as Updates from "expo-updates";
import React, { useCallback } from "react";
import { AppState, Platform, View } from "react-native";
import "react-native-gesture-handler";
import { SWRConfig } from "swr";
import * as serviceWorkerRegistration from "../assets/serviceWorkerRegistration";
import { SessionProvider, useSession } from "../context/AuthProvider";
import { SessionLoadingScreen } from "./(app)/_layout";

SystemUI.setBackgroundColorAsync("black");

if (Platform.OS === "android") {
  NavigationBar.setPositionAsync("absolute");
  NavigationBar.setBackgroundColorAsync("rgba(255,255,255,0.005)");
  NavigationBar.setBorderColorAsync("transparent");
}

declare global {
  interface Window {
    Mousetrap?: any;
  }
}

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();
Sentry.init({
  dsn: "https://3d99ad48c3c8f5ff2642deae447e4a82@o4503985635655680.ingest.sentry.io/4506520845746176",
  enableAutoSessionTracking: true,
  debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.ReactNativeTracing({
      // Pass instrumentation to be used as `routingInstrumentation`
      routingInstrumentation,
      // ...
    }),
  ],
});

SplashScreen.preventAutoHideAsync();

function ErrorBoundaryComponent() {
  const theme = useColorTheme();
  return (
    <View
      style={{
        backgroundColor: theme[1],
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}
    >
      <View
        style={{
          maxWidth: 350,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: theme[6],
          padding: 30,
          borderRadius: 20,
        }}
      >
        <Emoji size={50} emoji="1F62C" />
        <Text
          heading
          style={{ fontSize: 40, marginTop: 10, textAlign: "center" }}
        >
          Well, that's embarrassing...
        </Text>
        <Text style={{ textAlign: "center", opacity: 0.6 }}>
          Dysperse unexpectedly crashed, and our team has been notified. Try
          reopening the app to see if that fixes the issue.
        </Text>

        <Button
          onPress={() => {
            if (Platform.OS === "web") return window.location.reload();
            Updates.reloadAsync();
          }}
          variant="outlined"
          style={{ marginTop: 10 }}
        >
          <ButtonText>Reload</ButtonText>
        </Button>
      </View>
    </View>
  );
}

function localStorageProvider() {
  // When initializing, we restore the data from `localStorage` into a map.
  const map = new Map(JSON.parse(localStorage.getItem("app-cache") || "[]"));

  const save = () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem("app-cache", appCache);
  };

  // Before unloading the app, we write back all the data into `localStorage`.
  window.addEventListener("beforeunload", save);
  window.addEventListener("visibilitychange", save);

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

function Root() {
  // CHANGE THIS LATER!!!
  const theme = useColor("violet", true);
  const ref = useNavigationContainerRef();

  React.useEffect(() => {
    if (ref) {
      routingInstrumentation.registerNavigationContainer(ref);
    }
  }, [ref]);

  // Set up the auth context and render our layout inside of it.

  const [fontsLoaded, fontsError] = useFonts({
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
    if (fontsLoaded || fontsError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded) {
    return <SessionLoadingScreen />;
  }

  return (
    <ColorThemeProvider theme={theme}>
      <ErrorBoundary showDialog fallback={<ErrorBoundaryComponent />}>
        <SessionProvider>
          <SWRWrapper>
            <Slot screenOptions={{ onLayoutRootView }} />
          </SWRWrapper>
        </SessionProvider>
      </ErrorBoundary>
    </ColorThemeProvider>
  );
}

if (Platform.OS === "web") {
  serviceWorkerRegistration.register();
}

export default Sentry.wrap(Root);
