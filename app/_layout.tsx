import { WorkboxInitializer } from "@/components/layout/WorkboxInitializer";
import { JsStack } from "@/components/layout/_stack";
import { SidebarContext } from "@/components/layout/sidebar/context";
import { SelectionContextProvider } from "@/context/SelectionContext";
import { ModalStackProvider } from "@/context/modal-stack";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { mint, mintDark } from "@/themes";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Text from "@/ui/Text";
import { addHslAlpha, useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import { Fraunces_300Light } from "@expo-google-fonts/fraunces";
import { JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono";
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
import { TransitionPresets } from "@react-navigation/stack";
import * as Sentry from "@sentry/react-native";
import { ErrorBoundary } from "@sentry/react-native";
import * as FileSystem from "expo-file-system";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { useNavigationContainerRef } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import * as Updates from "expo-updates";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  Appearance,
  InteractionManager,
  Platform,
  StatusBar,
  View,
  useWindowDimensions,
} from "react-native";
import "react-native-gesture-handler";
import { DrawerLayout } from "react-native-gesture-handler";
import { SWRConfig } from "swr";
import { useDebouncedCallback } from "use-debounce";
import { SessionProvider, useSession } from "../context/AuthProvider";

SystemUI.setBackgroundColorAsync(
  Appearance.getColorScheme() === "dark" ? mintDark.mint2 : mint.mint2
);

if (Platform.OS === "android") {
  StatusBar.setBackgroundColor("transparent");
  StatusBar.setBarStyle(
    Appearance.getColorScheme() === "dark" ? "light-content" : "dark-content"
  );
  NavigationBar.setBorderColorAsync("transparent");
  NavigationBar.setBackgroundColorAsync(
    addHslAlpha(
      Appearance.getColorScheme() === "dark" ? mintDark.mint2 : mint.mint2,
      0.01
    )
  );
  NavigationBar.setButtonStyleAsync(
    Appearance.getColorScheme() === "dark" ? "light" : "dark"
  );
  NavigationBar.setBorderColorAsync("transparent");
}

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: "https://3d99ad48c3c8f5ff2642deae447e4a82@o4503985635655680.ingest.sentry.io/4506520845746176",
    enableAutoSessionTracking: true,
    tracesSampleRate: 1.0,

    _experiments: {
      replaysSessionSampleRate: 1.0,
      replaysOnErrorSampleRate: 1.0,
    },

    integrations: [
      Sentry.mobileReplayIntegration({
        maskAllText: false,
        maskAllImages: false,
        maskAllVectors: false,
      }),
      new Sentry.ReactNativeTracing({ routingInstrumentation }),
    ],
  });
}

SplashScreen.preventAutoHideAsync();

function ErrorBoundaryComponent() {
  const theme = useColor("mint");
  const breakpoints = useResponsiveBreakpoints();
  const { width } = useWindowDimensions();

  return (
    <ColorThemeProvider theme={theme}>
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
            width: 450,
            maxWidth: width - 40,
            justifyContent: "center",
            borderWidth: 1,
            borderColor: theme[6],
            padding: 30,
            borderRadius: 20,
            flexDirection: breakpoints.md ? "row" : "column",
            gap: 20,
          }}
        >
          <Emoji size={50} style={{ marginTop: 10 }} emoji="1F62C" />
          <View style={{ flex: breakpoints.md ? 1 : undefined }}>
            <Text style={{ fontSize: 30 }} weight={900}>
              Well, that's embarrassing...
            </Text>
            <Text style={{ fontSize: 20, opacity: 0.6 }}>
              Dysperse unexpectedly crashed, and our team has been notified. Try
              reopening the app to see if that fixes the issue.
            </Text>

            <Button
              onPress={() => {
                if (Platform.OS === "web") {
                  (window as any).disableSaveData = true;
                  localStorage.removeItem("app-cache");
                  window.location.reload();
                  return;
                }
                Updates.reloadAsync();
              }}
              variant="outlined"
              height={60}
              containerStyle={{ marginTop: 10 }}
            >
              <ButtonText>Reload</ButtonText>
            </Button>
          </View>
        </View>
      </View>
    </ColorThemeProvider>
  );
}

function localStorageProvider() {
  // When initializing, we restore the data from `localStorage` into a map.
  const map = new Map(JSON.parse(localStorage.getItem("app-cache") || "[]"));

  const save = () => {
    if ((window as any).disableSaveData) return;
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem("app-cache", appCache);
  };

  // Before unloading the app, we write back all the data into `localStorage`.
  window.addEventListener("beforeunload", save);
  window.addEventListener("visibilitychange", save);

  // We still use the map for write & read for performance.
  return map;
}

async function fileSystemProvider(cacheData) {
  InteractionManager.runAfterInteractions(async () => {
    const cacheDir = FileSystem.cacheDirectory + "dysperse-cache/";
    const file = `${cacheDir}cache.json`;

    async function ensureDirExists() {
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      if (!dirInfo.exists) {
        console.log("Cache directory doesn't exist, creating…");
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      }
    }

    const map = cacheData || new Map();

    if (map.size === 0) {
      console.log("⛔ Cache is empty, not saving to disk.");
      return;
    }
    console.log("💾 Saving cache to disk…");
    await ensureDirExists();
    await FileSystem.writeAsStringAsync(
      file,
      JSON.stringify(Array.from(map.entries()))
    );
    console.log(`💾 Saved ${map.size} API routes to cache! `);
  });
}

function SWRWrapper({ children }) {
  const { session } = useSession();
  const cacheData = useRef(null);
  const [cacheLoaded, setCacheLoaded] = useState(Platform.OS === "web");

  const saveCache = useDebouncedCallback(
    // function
    () => {
      if (Platform.OS !== "web") fileSystemProvider(cacheData.current);
    },
    // delay in ms
    1000
  );

  useEffect(() => {
    const save = () => fileSystemProvider(cacheData.current);
    save();
    const subscription = AppState.addEventListener("change", save);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    (async () => {
      if (cacheLoaded) return;
      const cacheDir = FileSystem.cacheDirectory + "dysperse-cache/";
      const file = `${cacheDir}cache.json`;
      const fileInfo = await FileSystem.getInfoAsync(file);
      if (fileInfo.exists) {
        console.log("📂 Cache file exists, restoring cache…");
        const data = await FileSystem.readAsStringAsync(file);
        const entries = JSON.parse(data);
        cacheData.current = new Map(entries);
        console.log(`📂 Restored ${cacheData.current.size} API routes!`);
      } else {
        console.log("📂 Cache file doesn't exist, creating new cache…");
        cacheData.current = new Map();
      }
      if (!cacheLoaded) setCacheLoaded(true);
    })();
  }, [cacheData, cacheLoaded]);

  return cacheLoaded ? (
    <SWRConfig
      value={{
        fetcher: async ([
          resource,
          params,
          host = process.env.EXPO_PUBLIC_API_URL,
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
          Platform.OS === "web"
            ? localStorageProvider
            : () => cacheData.current,
        isVisible: () => true,
        onSuccess: saveCache,
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
  ) : null;
}

const useWebDevtoolsWarning = () => {
  useEffect(() => {
    if (Platform.OS === "web") {
      setInterval(
        () =>
          (function () {
            const e =
              "This is a browser feature intended for developers. Do not enter or paste code which you don't understand. It may allow attackers to steal your information or impersonate you.\nSee https://en.wikipedia.org/wiki/Self-XSS for more details";
            if (navigator && navigator.userAgent) {
              const o = navigator.userAgent.match(
                /opera|chrome|safari|firefox|msie|trident(?=\/)/i
              );
              if (o && o[0].search(/trident|msie/i) < 0)
                return (
                  window.console.log(
                    "%c🚫 STOP!",
                    "color:red;font-size:100px;font-weight:bold;"
                  ),
                  void window.console.log("%c" + e, "font-size:x-large;")
                );
            }
            window.console.log("🚫STOP!\n" + e);
          })(),
        1000 * 60 * 5
      );
    }
  }, []);
  return null;
};

function Root() {
  const theme = useColor("mint");
  const { width } = useWindowDimensions();
  const breakpoints = useResponsiveBreakpoints();
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref && process.env.NODE_ENV === "production")
      routingInstrumentation.registerNavigationContainer(ref);
  }, [ref]);

  useWebDevtoolsWarning();

  const [fontsLoaded, fontsError] = useFonts({
    body_100: Jost_100Thin,
    body_200: Jost_200ExtraLight,
    body_300: Jost_300Light,
    body_400: Jost_400Regular,
    body_500: Jost_500Medium,
    body_600: Jost_600SemiBold,
    body_700: Jost_700Bold,
    body_800: Jost_800ExtraBold,
    body_900: Jost_900Black,
    serifText800: Fraunces_300Light,
    mono: JetBrainsMono_500Medium,
    symbols_outlined: require("../assets/fonts/symbols/outlined.ttf"),
    symbols_filled: require("../assets/fonts/symbols/filled.ttf"),
    symbols_bold_outlined: require("../assets/fonts/symbols/bold.ttf"),
  });

  const sidebarRef = useRef<DrawerLayout>(null);

  const SIDEBAR_WIDTH = useMemo(
    () => (breakpoints.md ? 220 : Math.min(280, width - 40)),
    [breakpoints, width]
  );

  // idk why it crashes the app on web
  if (Platform.OS !== "web" && !fontsLoaded && !fontsError) return null;

  return (
    <ErrorBoundary showDialog fallback={<ErrorBoundaryComponent />}>
      <SessionProvider>
        <SelectionContextProvider>
          <ModalStackProvider>
            <ColorThemeProvider theme={theme}>
              <SidebarContext.Provider
                value={{
                  sidebarRef: sidebarRef,
                  desktopCollapsed,
                  setDesktopCollapsed,
                  SIDEBAR_WIDTH,
                }}
              >
                <SWRWrapper>
                  {Platform.OS === "web" && <WorkboxInitializer />}
                  <JsStack
                    screenOptions={{
                      header: () => null,
                      cardShadowEnabled: false,
                      freezeOnBlur: true,
                    }}
                    initialRouteName="(app)/index"
                  >
                    <JsStack.Screen
                      name="open"
                      options={{
                        presentation: "modal",
                        animationEnabled: true,
                        gestureEnabled: false,
                        ...TransitionPresets.ModalPresentationIOS,
                      }}
                    />
                    {["search/[id]"].map((p) => (
                      <JsStack.Screen
                        key={p}
                        name={p}
                        options={{
                          presentation: "modal",
                          animationEnabled: !breakpoints.md,
                          detachPreviousScreen: false,
                          gestureResponseDistance: width,
                          cardStyle: { backgroundColor: "transparent" },
                          cardOverlay: (props) => (
                            <View {...props} style={{ flex: 1 }} />
                          ),
                          ...TransitionPresets.ModalPresentationIOS,
                        }}
                      />
                    ))}
                    <JsStack.Screen
                      name="plan"
                      options={{
                        presentation: "modal",
                        detachPreviousScreen: false,
                        animationEnabled: true,
                        gestureEnabled: false,
                        ...TransitionPresets.ModalPresentationIOS,
                        cardStyle: breakpoints.md
                          ? {
                              maxWidth: 500,
                              width: "100%",
                              marginHorizontal: "auto",
                              marginVertical: 30,
                              borderRadius: 25,
                              shadowRadius: 20,
                              shadowColor: "rgba(0,0,0,0.1)",
                              shadowOffset: {
                                width: 0,
                                height: 10,
                              },
                            }
                          : undefined,
                      }}
                    />
                  </JsStack>
                </SWRWrapper>
              </SidebarContext.Provider>
            </ColorThemeProvider>
          </ModalStackProvider>
        </SelectionContextProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}

export default process.env.NODE_ENV === "development"
  ? Root
  : Sentry.wrap(Root);

