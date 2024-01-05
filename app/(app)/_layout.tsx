import { JsStack } from "@/components/layout/_stack";
import AccountNavbar from "@/components/layout/account-navbar";
import { forHorizontalIOS } from "@/components/layout/forHorizontalIOS";
import { Sidebar } from "@/components/layout/sidebar";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Spinner from "@/ui/Spinner";
import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import Navbar from "@/ui/navbar";
import { toastConfig } from "@/ui/toast.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider } from "@gorhom/portal";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { TransitionPresets } from "@react-navigation/stack";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import {
  Platform,
  StatusBar,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { BottomAppBar } from "../../components/layout/bottom-navigation";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(isoWeek);

export function SessionLoadingScreen() {
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

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const { session: sessionData, isLoading: isUserLoading } = useUser();
  const { width, height } = useWindowDimensions();
  const isDark = useColorScheme() === "dark";
  const breakpoints = useResponsiveBreakpoints();
  const { bottom } = useSafeAreaInsets();

  const theme = useColor(
    sessionData?.user?.profile?.theme || "violet",
    // CHANGE THIS LATER!!!
    isDark
    // sessionData?.user?.darkMode === "dark"
  );

  useEffect(() => {
    if (Platform.OS === "web") {
      document
        .querySelector(`meta[name="theme-color"]`)
        .setAttribute("content", theme[2]);
    }
  }, [theme]);

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading || isUserLoading) {
    return <SessionLoadingScreen />;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/auth" />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <ColorThemeProvider theme={theme}>
      <GestureHandlerRootView
        style={{ flex: 1, overflow: "hidden", width, height }}
      >
        <BottomSheetModalProvider>
          <PortalProvider>
            <StatusBar barStyle={!isDark ? "dark-content" : "light-content"} />
            <View
              style={{
                flexDirection: breakpoints.lg ? "row" : "column",
                flex: 1,
                backgroundColor: theme[1],
              }}
            >
              {breakpoints.lg && <Sidebar />}
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
                    header: () => null,
                    headerTransparent: true,
                    gestureResponseDistance: width,
                    gestureEnabled: true,
                    cardStyle: {
                      backgroundColor: theme[breakpoints.sm ? 2 : 1],
                      padding: breakpoints.lg ? 10 : 0,
                      marginBottom: bottom,
                    },
                    // change opacity of the previous screen when swipe
                    cardOverlayEnabled: true,
                    animationEnabled: true,
                    gestureVelocityImpact: 0.7,
                  }}
                >
                  <JsStack.Screen
                    name="index"
                    options={{
                      header: breakpoints.lg
                        ? () => null
                        : (props: any) => <AccountNavbar {...props} />,
                    }}
                  />
                  {[
                    "settings/index",
                    "settings/appearance",
                    "settings/personal-information",
                  ].map((d) => (
                    <JsStack.Screen
                      name={d}
                      key={d}
                      options={{
                        headerTitle: d !== "settings/index" && "Settings",
                        header: (props) => (
                          <Navbar icon="arrow_back_ios_new" {...props} />
                        ),
                        ...TransitionPresets.SlideFromRightIOS,
                        cardStyleInterpolator: forHorizontalIOS,
                      }}
                    />
                  ))}
                  <JsStack.Screen
                    name="friends"
                    options={{
                      header: (props) => (
                        <Navbar icon="arrow_back_ios_new" {...props} />
                      ),
                      ...TransitionPresets.SlideFromRightIOS,
                      cardStyleInterpolator: forHorizontalIOS,
                    }}
                  />
                  <JsStack.Screen
                    name="clock"
                    options={{
                      ...TransitionPresets.SlideFromRightIOS,
                      gestureResponseDistance: width,
                      cardStyleInterpolator: forHorizontalIOS,
                      cardStyle: { marginBottom: 0 },
                    }}
                  />
                  <JsStack.Screen
                    name="open"
                    options={{
                      presentation: "modal",
                      ...TransitionPresets.ModalPresentationIOS,
                      gestureResponseDistance: 100,
                      cardStyle: { marginBottom: 0 },
                    }}
                  />
                  <JsStack.Screen
                    name="space"
                    options={{
                      presentation: "modal",
                      ...TransitionPresets.ModalPresentationIOS,
                      gestureResponseDistance: height,
                      cardStyle: { marginBottom: 0 },
                    }}
                  />
                  <JsStack.Screen name="[tab]/perspectives/agenda/[type]/[start]" />
                </JsStack>
              </ThemeProvider>
              {!breakpoints.md && <BottomAppBar />}
            </View>
          </PortalProvider>
        </BottomSheetModalProvider>
        <Toast config={toastConfig(theme)} />
      </GestureHandlerRootView>
    </ColorThemeProvider>
  );
}
