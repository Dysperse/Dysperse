import { ErrorBoundaryComponent } from "@/components/layout/ErrorBoundary";
import { SWRWrapper } from "@/components/layout/SWRWrapper";
import { WorkboxInitializer } from "@/components/layout/WorkboxInitializer";
import { JsStack } from "@/components/layout/_stack";
import { SidebarContext } from "@/components/layout/sidebar/context";
import { SelectionContextProvider } from "@/context/SelectionContext";
import { ModalStackProvider } from "@/context/modal-stack";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { mint, mintDark } from "@/themes";
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
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { useNavigationContainerRef } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Appearance,
  Platform,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import "react-native-gesture-handler";
import { DrawerLayout } from "react-native-gesture-handler";
import { SessionProvider } from "../context/AuthProvider";

const isDark = Appearance.getColorScheme() === "dark";

SystemUI.setBackgroundColorAsync(isDark ? mintDark.mint2 : mint.mint2);

if (Platform.OS === "android") {
  StatusBar.setBackgroundColor("transparent");
  StatusBar.setBarStyle(isDark ? "light-content" : "dark-content");
  NavigationBar.setBorderColorAsync("transparent");
  NavigationBar.setBackgroundColorAsync(
    addHslAlpha(isDark ? mintDark.mint2 : mint.mint2, 0.01)
  );
  NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
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

  const sidebarContextValue = useMemo(
    () => ({
      sidebarRef: sidebarRef,
      desktopCollapsed,
      setDesktopCollapsed,
      SIDEBAR_WIDTH,
    }),
    [desktopCollapsed, SIDEBAR_WIDTH]
  );

  // idk why it crashes the app on web
  if (Platform.OS !== "web" && !fontsLoaded && !fontsError) return null;

  return (
    <ErrorBoundary showDialog fallback={<ErrorBoundaryComponent />}>
      <SessionProvider>
        <SelectionContextProvider>
          <ModalStackProvider>
            <ColorThemeProvider theme={theme}>
              <SidebarContext.Provider value={sidebarContextValue}>
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
