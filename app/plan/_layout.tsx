import { JsStack } from "@/components/layout/_stack";
import { PlanContextProvider } from "@/context/planContext";
import { SelectionContextProvider } from "@/context/SelectionContext";
import { StorageContextProvider } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import ConfirmationModal from "@/ui/ConfirmationModal";
import IconButton from "@/ui/IconButton";
import { toastConfig } from "@/ui/toast.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { TransitionPresets } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router, usePathname } from "expo-router";
import { StyleSheet, View } from "react-native";
import { MenuProvider } from "react-native-popup-menu";
import Toast from "react-native-toast-message";

const styles = StyleSheet.create({
  navbar: {
    paddingTop: 10,
    padding: 20,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
  },
});

const SLIDE_NUM = 4;

function PlanNavbar() {
  const theme = useColorTheme();
  const handleClose = () =>
    router.canGoBack() ? router.back() : router.push("/");

  const route = usePathname();
  const currentSlide = parseInt(route.replace("/plan/", "")) || 0;

  return (
    <View style={{ backgroundColor: theme[2] }}>
      <View
        style={{
          height: 7,
          flexDirection: "row",
          paddingHorizontal: 20,
          marginTop: 10,
          gap: 10,
        }}
      >
        {[...Array(SLIDE_NUM + 1)].map((_, i) => (
          <LinearGradient
            colors={
              i <= currentSlide ? [theme[8], theme[11]] : [theme[5], theme[5]]
            }
            key={i}
            style={{
              flex: 1,
              borderRadius: 99,
            }}
          />
        ))}
      </View>
      <View style={styles.navbar}>
        <ConfirmationModal
          height={400}
          onSuccess={() => router.replace("/")}
          title="Exit?"
          disabled={currentSlide === 0}
          secondary="Are you sure you want to exit? Tasks you've edited will be saved."
        >
          <IconButton
            onPress={handleClose}
            variant="outlined"
            icon="close"
            size={55}
          />
        </ConfirmationModal>
      </View>
    </View>
  );
}

export default function Layout() {
  const { session } = useUser();
  const theme = useColor(session?.user?.profile?.theme || "mint");

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

  if (!session || session?.error) return <Redirect href="/auth" />;

  return (
    <SelectionContextProvider>
      <StorageContextProvider>
        <MenuProvider skipInstanceCheck>
          <BottomSheetModalProvider>
            <PlanContextProvider>
              <ColorThemeProvider theme={theme}>
                <JsStack
                  screenOptions={{
                    ...TransitionPresets.SlideFromRightIOS,
                    header: () => <PlanNavbar />,
                    headerMode: "float",
                    detachPreviousScreen: false,
                    cardStyle: { backgroundColor: theme[1], display: "flex" },
                  }}
                />
              </ColorThemeProvider>
            </PlanContextProvider>
          </BottomSheetModalProvider>
        </MenuProvider>
        <Toast config={toastConfig(theme)} />
      </StorageContextProvider>
    </SelectionContextProvider>
  );
}
