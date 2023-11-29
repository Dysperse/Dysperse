import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthProvider";
import { TamaguiProvider, View } from "tamagui";
import config from "../tamagui.config";
import Navbar from "../ui/navbar";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <TamaguiProvider config={config}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }}>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: "transparent",
              },
              contentStyle: {
                backgroundColor: "#fff",
              },
              header: (props) => <Navbar {...props} />,
            }}
          >
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="(auth)/auth/login"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="(auth)/auth/signup"
              options={{
                headerTitle: "Signup",
              }}
            />
            {/* <Stack.Screen
          name="other"
          options={{
            title: "",
            headerShown: true,
            headerTransparent: Platform.OS === "ios",
            headerBlurEffect: "regular",
          }}
        /> */}
          </Stack>
        </AuthProvider>
      </SafeAreaView>
    </TamaguiProvider>
  );
}
