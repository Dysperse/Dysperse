import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthProvider";
import { TamaguiProvider, View } from "tamagui";
import config from "../tamagui.config";
import Navbar from "../ui/navbar";

export default function RootLayout() {
  return (
    <TamaguiProvider config={config}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "transparent",
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
    </TamaguiProvider>
  );
}
