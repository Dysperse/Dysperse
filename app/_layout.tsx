import { GluestackUIProvider } from "@gluestack-ui/themed";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { config } from "../config/gluestack-ui.config"; // Optional if you want to use default theme
import { useAuth } from "../context/AuthProvider";
import * as themes from "../themes";
import Navbar from "../ui/navbar";
import { toastConfig } from "../ui/toast.config";
import { TransitionPresets } from "@react-navigation/stack";

import { ParamListBase, StackNavigationState } from "@react-navigation/native";
import {
  StackNavigationEventMap,
  StackNavigationOptions,
  createStackNavigator,
} from "@react-navigation/stack";
import { withLayoutContext } from "expo-router";
import { Platform } from "react-native";

SplashScreen.preventAutoHideAsync();

const { Navigator } = createStackNavigator();
export const JsStack = withLayoutContext<
  StackNavigationOptions,
  typeof Navigator,
  StackNavigationState<ParamListBase>,
  StackNavigationEventMap
>(Navigator);

export default function RootLayout() {
  const { session } = useAuth();

  const [fontsLoaded] = useFonts({
    heading: require("../assets/fonts/league-gothic.otf"),
    body_100: require("../assets/fonts/WorkSans/WorkSans-Thin.ttf"),
    body_300: require("../assets/fonts/WorkSans/WorkSans-Light.ttf"),
    body_400: require("../assets/fonts/WorkSans/WorkSans-Regular.ttf"),
    body_500: require("../assets/fonts/WorkSans/WorkSans-Medium.ttf"),
    body_600: require("../assets/fonts/WorkSans/WorkSans-SemiBold.ttf"),
    body_700: require("../assets/fonts/WorkSans/WorkSans-Bold.ttf"),
    body_800: require("../assets/fonts/WorkSans/WorkSans-Black.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  console.log(session);

  return (
    <GluestackUIProvider
      config={{
        ...config,
        tokens: {
          ...config.tokens,
          colors: {
            ...config.tokens.colors,
            ...Object.fromEntries(
              Object.entries(themes["mint"]).map(([key, value]) => {
                const match = key.match(/([a-zA-Z]+)(\d+)/);
                return match ? [`primary${match[2]}`, value] : [key, value];
              })
            ),
          },
        },
      }}
    >
      <StatusBar style="light" backgroundColor="#000" />
      <SafeAreaView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <JsStack
          screenOptions={{
            ...TransitionPresets.ModalPresentationIOS,
            gestureEnabled: true,
            headerStyle: {
              backgroundColor: "transparent",
            },
            cardStyle: {
              backgroundColor: "#fff",
            },
            header: (props: any) => <Navbar {...props} icon="expand-more" />,
          }}
        >
          <JsStack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <JsStack.Screen
            name="(auth)/auth/login"
            options={{
              headerTitle: "Sign in",
              presentation: "modal",
            }}
          />
          <JsStack.Screen
            name="(auth)/auth/signup"
            options={{
              headerTitle: "Signup",
            }}
          />
        </JsStack>
        <Toast topOffset={20} config={toastConfig} />
      </SafeAreaView>
    </GluestackUIProvider>
  );
}
