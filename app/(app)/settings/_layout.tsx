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
import type {
  StackCardInterpolatedStyle,
  StackCardInterpolationProps,
} from "@react-navigation/stack";
import { TransitionPresets } from "@react-navigation/stack";
import { BlurView } from "expo-blur";
import { router, usePathname } from "expo-router";
import {
  Animated,
  Easing,
  Platform,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function conditional(condition, main, fallback) {
  return add(
    multiply(condition, main),
    multiply(
      condition.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
      }),
      fallback
    )
  );
}

const { add, multiply } = Animated;

const ScaleFromCenterAndroidSpec = {
  animation: "timing",
  config: {
    duration: 400,
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  },
};
export function forScaleFromCenterAndroid({
  current,
  next,
  closing,
}: StackCardInterpolationProps): StackCardInterpolatedStyle {
  const progress = add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: "clamp",
        })
      : 0
  );

  const opacity = progress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1, 0],
  });

  const translateY = conditional(
    closing,
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 1],
      extrapolate: "clamp",
    }),
    progress.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [50, 0, 0],
      extrapolate: "clamp",
    })
  );

  return {
    cardStyle: { opacity, transform: [{ translateY }] },
  };
}

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

/**
 * Simple fade animation for the header elements.
 */
export function forFade({ current, next }) {
  const progress = add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: "clamp",
        })
      : 0
  );

  const opacity = progress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1, 0],
  });

  return {
    leftButtonStyle: { opacity },
    rightButtonStyle: { opacity },
    titleStyle: { opacity },
    backgroundStyle: {
      opacity: progress.interpolate({
        inputRange: [0, 1, 1.9, 2],
        outputRange: [0, 1, 1, 0],
      }),
    },
  };
}

export default function Layout() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { height, width } = useWindowDimensions();

  return (
    <BlurView
      intensity={Platform.OS === "web" ? 10 : 0}
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
                  background: Platform.OS === "web" ? "transparent" : theme[2],
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
                  "tasks",
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
                      animationEnabled: true,
                      // !breakpoints.md && d !== "settings/index",
                      detachPreviousScreen:
                        d === "settings/index" ||
                        d === "login/account/two-factor-authentication" ||
                        d === "login/account/passkeys",

                      ...(breakpoints.md
                        ? {
                            gestureDirection: "horizontal",
                            transitionSpec: {
                              open: ScaleFromCenterAndroidSpec,
                              close: ScaleFromCenterAndroidSpec,
                            },
                            cardStyleInterpolator: forScaleFromCenterAndroid,
                            headerStyleInterpolator: forFade,
                          }
                        : {
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

