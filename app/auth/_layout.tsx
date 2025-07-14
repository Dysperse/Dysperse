import { JsStack } from "@/components/layout/_stack";
import { useUser } from "@/context/useUser";
import { useColorTheme } from "@/ui/color/theme-provider";
import { toastConfig } from "@/ui/toast.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider } from "@gorhom/portal";
import { Redirect } from "expo-router";
import { Dimensions, Platform } from "react-native";
import { MenuProvider } from "react-native-popup-menu";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Layout() {
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();

  const { sessionToken } = useUser();
  if (sessionToken) return <Redirect href="/(app)" />;

  return (
    <BottomSheetModalProvider>
      <MenuProvider>
        <PortalProvider>
          <JsStack
            id={undefined}
            screenOptions={{
              header: () => null,
              headerTransparent: true,
              gestureResponseDistance:
                Platform.OS === "ios" ? Dimensions.get("window").width : 50,
              gestureEnabled: true,
              cardStyle: { backgroundColor: theme[1] },
              cardOverlayEnabled: true,
            }}
          />
          <Toast topOffset={insets.top + 15} config={toastConfig(theme)} />
        </PortalProvider>
      </MenuProvider>
    </BottomSheetModalProvider>
  );
}

