import { JsStack } from "@/components/layout/_stack";
import { useUser } from "@/context/useUser";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Redirect } from "expo-router";
import { Dimensions, Platform } from "react-native";
import { MenuProvider } from "react-native-popup-menu";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";

export default function Layout() {
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();

  const { sessionToken } = useUser();
  if (sessionToken) return <Redirect href="/(app)" />;

  return (
    <BottomSheetModalProvider>
      <MenuProvider>
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
        <Toaster />
      </MenuProvider>
    </BottomSheetModalProvider>
  );
}

