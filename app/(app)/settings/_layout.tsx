import { JsStack } from "@/components/layout/_stack";
import { ArcSystemBar } from "@/components/layout/arcAnimations";
import ContentWrapper from "@/components/layout/content";
import { forHorizontalIOS } from "@/components/layout/forHorizontalIOS";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import { ThemeProvider } from "@react-navigation/native";
import type {
  StackCardInterpolatedStyle,
  StackCardInterpolationProps,
} from "@react-navigation/stack";
import { TransitionPresets } from "@react-navigation/stack";
import { Animated, Easing, useWindowDimensions, View } from "react-native";
import { MenuButton } from "../home";

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

export const ScaleFromCenterAndroidSpec = {
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
    inputRange: [0, 1, 1, 1.1, 1.1, 2],
    outputRange: [0, 1, 1, 0, 0, 0],
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
  const { session } = useUser();
  const { width } = useWindowDimensions();

  return (
    <ContentWrapper style={{ overflow: "hidden" }} noPaddingTop>
      <View style={{ flex: 1 }}>
        <ThemeProvider
          value={{
            colors: {
              primary: theme[1],
              background: breakpoints.md ? "transparent" : theme[2],
              card: theme[1],
              text: theme[4],
              border: theme[5],
              notification: theme[2],
            },
            dark: true,
          }}
        >
          <ArcSystemBar />
          <JsStack
            initialRouteName={breakpoints.md ? "account/index" : "index"}
            id={undefined}
            screenOptions={{
              headerShown: true,
              cardOverlayEnabled: true,
              gestureResponseDistance: width,
              header: ({ route }) =>
                !breakpoints.md && (
                  <MenuButton
                    back
                    gradient
                    gradientColors={
                      route.name === "login/scan" ||
                      (route.name === "sidekick" && !session.user?.betaTester)
                        ? ["rgba(0,0,0,0.5)", "transparent"]
                        : undefined
                    }
                    iconColor={
                      route.name === "login/scan" ||
                      (route.name === "sidekick" && !session.user?.betaTester)
                        ? "#fff"
                        : null
                    }
                    iconBackgroundColor={
                      route.name === "login/scan" ||
                      (route.name === "sidekick" && !session.user?.betaTester)
                        ? "rgba(0,0,0,0.2)"
                        : null
                    }
                    left={route.name !== "index"}
                    icon={route.name === "index" ? "close" : "west"}
                  />
                ),
            }}
          >
            {[
              "customization/appearance",
              "customization/notifications",
              "login/scan",
              "login/account/index",
              "login/account/two-factor-authentication",
              "account/passkeys",
              "login/devices",
              "index",
              "tasks",
              "sidekick",
              "shortcuts",
              "personal-information",
              "account/index",
              "other/apps",
              "account/integrations/index",
              "account/integrations/[name]",
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
                  detachPreviousScreen: true,
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
    </ContentWrapper>
  );
}

