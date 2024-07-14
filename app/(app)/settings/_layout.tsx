import { JsStack } from "@/components/layout/_stack";
import { forHorizontalIOS } from "@/components/layout/forHorizontalIOS";
import { SettingsSidebar } from "@/components/settings/sidebar";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { TransitionPresets } from "@react-navigation/stack";
import { router } from "expo-router";
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
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
        gap: 15,
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
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom, flex: 1 }}
    >
      <EscapeSettings />
      <View
        style={{
          maxHeight: height,
          flexDirection: "row",
          maxWidth: 900,
          width: "100%",
          marginHorizontal: "auto",
          gap: 40,
          flex: 1,
          ...(Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any)),
        }}
      >
        <SettingsSidebar />
        <View style={{ flex: 1 }}>
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
              "login/devices",
              "account/profile",
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
                  cardStyle: { padding: 0 },
                  gestureEnabled: d !== "settings/index",
                  headerTitle: d !== "settings/index" && "Settings",
                  ...TransitionPresets.SlideFromRightIOS,
                  cardStyleInterpolator: forHorizontalIOS,
                  animationEnabled: !breakpoints.md && d !== "settings/index",
                  detachPreviousScreen: d === "settings/index",
                }}
              />
            ))}
          </JsStack>
        </View>
      </View>
    </View>
  );
}
