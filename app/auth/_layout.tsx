import { JsStack } from "@/components/layout/_stack";
import { useUser } from "@/context/useUser";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import { toastConfig } from "@/ui/toast.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider } from "@gorhom/portal";
import { Redirect } from "expo-router";
import { View, useWindowDimensions } from "react-native";
import { MenuProvider } from "react-native-popup-menu";
import Toast from "react-native-toast-message";

export default function Layout() {
  const theme = useColorTheme();
  const { width } = useWindowDimensions();

  const { sessionToken } = useUser();
  if (sessionToken) return <Redirect href="/(app)" />;

  return (
    <BottomSheetModalProvider>
      <MenuProvider>
        <ColorThemeProvider theme={theme} setHTMLAttributes>
          <PortalProvider>
            <JsStack
              screenOptions={{
                header: () => <View />,
                headerTransparent: true,
                gestureResponseDistance: width,
                gestureEnabled: true,
                cardStyle: {
                  backgroundColor: theme[1],
                },
                // change opacity of the previous screen when swipe
                cardOverlayEnabled: true,
                gestureVelocityImpact: 0.7,
              }}
            />
            <Toast config={toastConfig(theme)} />
          </PortalProvider>
        </ColorThemeProvider>
      </MenuProvider>
    </BottomSheetModalProvider>
  );
}

