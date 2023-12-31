import { JsStack } from "@/components/layout/_stack";
import AccountNavbar from "@/components/layout/account-navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import Navbar from "@/ui/navbar";
import { toastConfig } from "@/ui/toast.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import {
  StackCardInterpolatedStyle,
  StackCardInterpolationProps,
  TransitionPresets,
} from "@react-navigation/stack";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Redirect } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Animated,
  AppState,
  StatusBar,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { SWRConfig } from "swr";
import { BottomAppBar } from "../../components/layout/bottom-navigation";
import { OpenTabsList } from "../../components/layout/bottom-navigation/tabs/carousel";
import { CommandPaletteProvider } from "@/components/layout/command-palette";
import Spinner from "@/ui/Spinner";
import Logo from "@/ui/logo";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(isoWeek);

const { multiply } = Animated;

function SessionLoadingScreen() {
  const theme = useColorScheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme === "dark" ? "#000" : "#fff",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <View style={{ opacity: 0.6 }}>
        <Logo size={90} color={theme === "dark" ? "#ffffff" : "#000000"} />
      </View>
      <Spinner color={theme === "dark" ? "#ffffff" : "#000000"} />
    </View>
  );
}

function forHorizontalIOS({
  current,
  next,
  inverted,
  layouts: { screen },
}: StackCardInterpolationProps): StackCardInterpolatedStyle {
  const translateFocused = multiply(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [screen.width, 0],
      extrapolate: "clamp",
    }),
    inverted
  );

  const translateUnfocused = next
    ? multiply(
        next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, screen.width * -0.3],
          extrapolate: "clamp",
        }),
        inverted
      )
    : 0;

  const overlayOpacity = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
    extrapolate: "clamp",
  });

  const shadowOpacity = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
    extrapolate: "clamp",
  });

  return {
    cardStyle: {
      transform: [
        // Translation for the animation of the current card
        { translateX: translateFocused },
        // Translation for the animation of the card on top of this
        { translateX: translateUnfocused },
      ],
    },
    overlayStyle: { opacity: overlayOpacity },
    shadowStyle: { shadowOpacity },
  };
}

function DesktopHeader() {
  return (
    <View
      style={{
        height: 64,
        justifyContent: "center",
      }}
    >
      <OpenTabsList />
    </View>
  );
}

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const { session: sessionData, isLoading: isUserLoading } = useUser();
  const { width, height } = useWindowDimensions();
  const isDark = useColorScheme() === "dark";

  const theme = useColor(
    sessionData?.user?.theme || "violet",
    // CHANGE THIS LATER!!!
    isDark
    // sessionData?.user?.darkMode === "dark"
  );
  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading || isUserLoading) {
    return <SessionLoadingScreen />;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/sign-in" />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <ColorThemeProvider theme={theme}>
      <GestureHandlerRootView
        style={{ flex: 1, overflow: "hidden", width, height }}
      >
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

            provider: () => new Map(),
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
          <BottomSheetModalProvider>
            <CommandPaletteProvider>
              <StatusBar
                barStyle={!isDark ? "dark-content" : "light-content"}
              />
              <View
                style={{
                  flexDirection: width > 600 ? "row" : "column",
                  flex: 1,
                  backgroundColor: theme[1],
                }}
              >
                {width > 600 && <Sidebar />}
                <ThemeProvider
                  value={{
                    ...DefaultTheme,
                    colors: {
                      ...DefaultTheme.colors,
                      background: theme[1],
                    },
                  }}
                >
                  <JsStack
                    screenOptions={{
                      header:
                        width > 600
                          ? DesktopHeader
                          : (props: any) => <AccountNavbar {...props} />,
                      headerTransparent: true,
                      gestureResponseDistance: width,
                      cardShadowEnabled: false,
                      gestureEnabled: true,
                      cardStyle: {
                        backgroundColor: theme[1],
                        padding: width > 600 ? 10 : 0,
                        paddingTop: 0,
                      },
                      // change opacity of the previous screen when swipe
                      cardOverlayEnabled: true,
                      animationEnabled: false,
                      gestureVelocityImpact: 0.7,
                    }}
                  >
                    <JsStack.Screen name="index" options={{}} />
                    <JsStack.Screen
                      name="account"
                      options={{
                        header: (props) => (
                          <Navbar icon="arrow_back_ios_new" {...props} />
                        ),
                        animationEnabled: true,
                        ...TransitionPresets.SlideFromRightIOS,
                        cardStyleInterpolator: forHorizontalIOS,
                      }}
                    />
                    <JsStack.Screen
                      name="friends"
                      options={{
                        header: (props) => (
                          <Navbar icon="arrow_back_ios_new" {...props} />
                        ),
                        animationEnabled: true,
                        ...TransitionPresets.SlideFromRightIOS,
                        cardStyleInterpolator: forHorizontalIOS,
                      }}
                    />
                    <JsStack.Screen
                      name="open"
                      options={{
                        header: (props) => <Navbar {...props} />,
                        animationEnabled: true,
                        ...TransitionPresets.SlideFromRightIOS,
                        cardStyleInterpolator: forHorizontalIOS,
                      }}
                    />
                    <JsStack.Screen
                      name="space"
                      options={{
                        header: () => null,
                        animationEnabled: true,
                        presentation: "modal",
                        ...TransitionPresets.ModalPresentationIOS,
                        gestureResponseDistance: height,
                      }}
                    />
                    <JsStack.Screen
                      name="[tab]/perspectives/agenda/[type]/[start]"
                      options={{
                        header: width > 600 ? DesktopHeader : () => null,
                      }}
                    />
                  </JsStack>
                </ThemeProvider>
                {width < 600 && <BottomAppBar />}
              </View>
            </CommandPaletteProvider>
          </BottomSheetModalProvider>
        </SWRConfig>
        <Toast config={toastConfig(theme)} />
      </GestureHandlerRootView>
    </ColorThemeProvider>
  );
}
