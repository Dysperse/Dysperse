import { useUser } from "@/context/useUser";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Redirect, router } from "expo-router";
import { Platform, Pressable, StatusBar } from "react-native";
import { MenuProvider } from "react-native-popup-menu";

export function RouteDialogWrapper({ children }) {
  const { session } = useUser();
  const theme = useColor(session?.user?.profile?.theme || "mint");

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

  if (!session || session?.error) return <Redirect href="/auth" />;

  const handleClose = () =>
    router.canGoBack() ? router.back() : router.replace("/home");

  return (
    <ColorThemeProvider theme={theme}>
      <MenuProvider
        skipInstanceCheck
        customStyles={{
          backdrop: {
            flex: 1,
            opacity: 1,
            ...(Platform.OS === "web" &&
              ({ WebkitAppRegion: "no-drag" } as any)),
          },
        }}
      >
        <BottomSheetModalProvider>
          <StatusBar barStyle="light-content" />
          <Pressable
            onPress={handleClose}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            {children}
          </Pressable>
        </BottomSheetModalProvider>
      </MenuProvider>
    </ColorThemeProvider>
  );
}
