/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-require-imports */

import { ErrorBoundaryComponent } from "@/components/layout/ErrorBoundary";
import { SWRWrapper } from "@/components/layout/SWRWrapper";
import { JsStack } from "@/components/layout/_stack";
import { SidebarContext } from "@/components/layout/sidebar/context";
import { ModalStackProvider } from "@/context/modal-stack";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColor, useDarkMode } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import {
  BricolageGrotesque_300Light,
  BricolageGrotesque_700Bold,
} from "@expo-google-fonts/bricolage-grotesque";
import { JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono";
import {
  Jost_200ExtraLight,
  Jost_300Light,
  Jost_400Regular,
  Jost_500Medium,
  Jost_600SemiBold,
  Jost_700Bold,
  Jost_800ExtraBold,
  Jost_900Black,
} from "@expo-google-fonts/jost";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { ErrorBoundary } from "@sentry/react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { Platform, StatusBar, useWindowDimensions } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useSharedValue } from "react-native-reanimated";
import { SessionProvider } from "../context/AuthProvider";

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
    ],
  });
}

SplashScreen.preventAutoHideAsync();

const useWebDevtoolsWarning = () => {
  useEffect(() => {
    if (Platform.OS === "web" && process.env.NODE_ENV === "production") {
      setInterval(
        () =>
          (function () {
            const e =
              "This is a browser feature intended for developers. Do not enter or paste code which you don't understand. It may allow attackers to steal your information or impersonate you.\nSee https://en.wikipedia.org/wiki/Self-XSS for more details";
            if (navigator?.userAgent) {
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
  const isDark = useDarkMode();
  const theme = useColor("gray");
  const { width } = useWindowDimensions();
  const breakpoints = useResponsiveBreakpoints();
  const [desktopCollapsed, setDesktopCollapsed] = useState(
    Platform.OS === "web"
      ? localStorage.getItem("desktopCollapsed") === "true"
      : false
  );

  const setCollapsed = async () => {
    const _desktopCollapsed = await AsyncStorage.getItem("desktopCollapsed");
    setDesktopCollapsed(_desktopCollapsed === "true");
  };

  useEffect(() => {
    setCollapsed();
  }, [setCollapsed]);

  useWebDevtoolsWarning();

  const [fontsLoaded, fontsError] = useFonts({
    body_200: Jost_200ExtraLight,
    body_300: Jost_300Light,
    body_400: Jost_400Regular,
    body_500: Jost_500Medium,
    body_600: Jost_600SemiBold,
    body_700: Jost_700Bold,
    body_800: Jost_800ExtraBold,
    body_900: Jost_900Black,
    serifText700: BricolageGrotesque_700Bold,
    serifText800: BricolageGrotesque_300Light,
    mono: JetBrainsMono_500Medium,
    symbols_outlined: require("../assets/fonts/symbols/outlined.ttf"),
    symbols_filled: require("../assets/fonts/symbols/filled.ttf"),
    symbols_bold_outlined: require("../assets/fonts/symbols/bold.ttf"),
    symbols_bold_filled: require("../assets/fonts/symbols/boldFilled.ttf"),
  });

  const sidebarRef = useRef<any>(null);

  const ORIGINAL_SIDEBAR_WIDTH = breakpoints.md
    ? 220
    : Math.min(280, width - 40);

  const SIDEBAR_WIDTH = useSharedValue(ORIGINAL_SIDEBAR_WIDTH);
  const sidebarState = useRef(false);

  const sidebarContextValue = {
    sidebarRef: sidebarRef,
    desktopCollapsed: breakpoints.md ? desktopCollapsed : false,
    setDesktopCollapsed,
    SIDEBAR_WIDTH,
    ORIGINAL_SIDEBAR_WIDTH,
    SECONDARY_SIDEBAR_WIDTH: 130,
    sidebarState,
  };

  if (Platform.OS !== "web" && !fontsLoaded && !fontsError) return null;
  if (Platform.OS === "android") StatusBar.setBackgroundColor("transparent");

  return (
    <KeyboardProvider>
      <SessionProvider>
        <ThemeProvider
          value={{
            ...DefaultTheme,
            colors: {
              background: theme[2],
              card: theme[2],
              primary: theme[2],
              border: theme[6],
              text: theme[11],
              notification: theme[9],
            },
            dark: true,
          }}
        >
          <ErrorBoundary showDialog fallback={<ErrorBoundaryComponent />}>
            <ModalStackProvider>
              <ColorThemeProvider theme={theme}>
                <SidebarContext.Provider value={sidebarContextValue}>
                  <SWRWrapper>
                    <SystemBars style={isDark ? "dark" : "light"} />
                    <JsStack
                      id={undefined}
                      screenOptions={{
                        header: () => null,
                        cardShadowEnabled: false,
                        animation: "none",
                        cardOverlayEnabled: true,
                        detachPreviousScreen: true,
                      }}
                    />
                  </SWRWrapper>
                </SidebarContext.Provider>
              </ColorThemeProvider>
            </ModalStackProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </SessionProvider>
    </KeyboardProvider>
  );
}

export default process.env.NODE_ENV === "development"
  ? Root
  : Sentry.wrap(Root);

