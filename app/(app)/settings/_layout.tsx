import { JsStack } from "@/components/layout/_stack";
import { forHorizontalIOS } from "@/components/layout/forHorizontalIOS";
import { SettingsSidebar } from "@/components/settings/sidebar";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { ThemeProvider } from "@react-navigation/native";
import { TransitionPresets } from "@react-navigation/stack";
import { BlurView } from "expo-blur";
import { router, usePathname } from "expo-router";
import { Platform, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function EscapeSettings() {
  const breakpoints = useResponsiveBreakpoints();

  const handleBack = () => {
    if (router.canGoBack()) return router.back();
    router.replace("/");
  };

  useHotkeys("esc", handleBack, {
    enabled: breakpoints.md,
    ignoreEventWhen: () =>
      document.querySelectorAll('[aria-modal="true"]').length > 0,
  });

  return (
    <>
      {breakpoints.md && (
        <View
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            margin: 50,
            marginRight: 100,
            gap: 5,
            zIndex: 99,
            alignItems: "center",
          }}
        >
          <IconButton
            icon="close"
            variant="filled"
            size={55}
            onPress={handleBack}
          />
          <Text variant="eyebrow">ESC</Text>
        </View>
      )}
    </>
  );
}

function SettingsHeader() {
  const insets = useSafeAreaInsets();
  const path = usePathname();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
        paddingTop: insets.top + 15,
        gap: 15,
        display: path.includes("/integrations/") ? "none" : "flex",
      }}
    >
      <IconButton
        icon="arrow_back_ios_new"
        variant="outlined"
        size={55}
        onPress={router.back}
      />
    </View>
  );
}

export default function Layout() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { height, width } = useWindowDimensions();

  return (
    <BlurView
      intensity={Platform.OS === "web" ? 20 : 0}
      style={{
        ...(Platform.OS === "web" &&
          ({
            WebkitAppRegion: "no-drag",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 999999,
            width: "100%",
            height: "100%",
          } as any)),
      }}
    >
      <View
        style={{
          height: "100%",
          backgroundColor:
            Platform.OS === "web"
              ? addHslAlpha(theme[2], Platform.OS === "web" ? 0.9 : 1)
              : theme[1],
        }}
      >
        <EscapeSettings />
        <View
          style={{
            maxHeight: Platform.OS === "web" ? height : undefined,
            flexDirection: "row",
            maxWidth: 900,
            width: "100%",
            marginHorizontal: "auto",
            gap: 40,
            flex: 1,
            height,
            ...(Platform.OS === "web" &&
              ({ WebkitAppRegion: "no-drag" } as any)),
          }}
        >
          <SettingsSidebar />
          <View style={{ flex: 1 }}>
            <ThemeProvider
              value={{
                colors: {
                  primary: theme[1],
                  background:
                    Platform.OS == "web" && breakpoints.md
                      ? "transparent"
                      : theme[2],
                  card: theme[1],
                  text: theme[4],
                  border: theme[5],
                  notification: theme[2],
                },
                dark: true,
              }}
            >
              <JsStack
                screenOptions={{
                  header: () => (breakpoints.md ? null : <SettingsHeader />),
                  animationEnabled: !breakpoints.md,
                  headerMode: "screen",
                  freezeOnBlur: true,
                  gestureResponseDistance: width,
                }}
              >
                {[
                  "customization/appearance",
                  "customization/notifications",
                  "login/scan",
                  "login/account/index",
                  "login/account/two-factor-authentication",
                  "login/account/passkeys",
                  "login/devices",
                  "index",
                  "shortcuts",
                  "personal-information",
                  "account/index",
                  "other/apps",
                  "account/integrations/index",
                  "account/integrations/[name]/index",
                  "account/integrations/[name]/[id]",
                ].map((d) => (
                  <JsStack.Screen
                    name={d}
                    key={d}
                    options={{
                      gestureEnabled:
                        d !== "settings/index" &&
                        !d.includes("/integrations/[name]"),
                      headerTitle: d !== "settings/index" && "Settings",
                      animationEnabled:
                        !breakpoints.md && d !== "settings/index",
                      detachPreviousScreen:
                        d === "settings/index" ||
                        d === "login/account/two-factor-authentication" ||
                        d === "login/account/passkeys",

                      ...(!breakpoints.md && {
                        ...TransitionPresets.SlideFromRightIOS,
                        cardStyleInterpolator: forHorizontalIOS,
                      }),
                    }}
                  />
                ))}
              </JsStack>
            </ThemeProvider>
          </View>
        </View>
      </View>
    </BlurView>
  );
}
