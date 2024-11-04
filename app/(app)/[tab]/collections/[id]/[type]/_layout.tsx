import { JsStack } from "@/components/layout/_stack";
import {
  arcAnimation,
  arcAnimationSpec,
} from "@/components/layout/arcAnimations";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { useColorTheme } from "@/ui/color/theme-provider";
import { ThemeProvider } from "@react-navigation/native";
import { TransitionPresets } from "@react-navigation/stack";
import { usePathname } from "expo-router";
import { StatusBar } from "react-native";

function StatusBarStyling() {
  const theme = useColorTheme();
  const pathname = usePathname();
  const t = ["customize", "search", "share"];
  const isModal = t.find((p) => pathname.includes(p));

  useWebStatusBar({
    active: isModal ? "#000" : theme[2],
    cleanup: theme[2],
  });

  return isModal && <StatusBar barStyle="light-content" />;
}

export default function Layout() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <>
      <ThemeProvider
        value={{
          colors: {
            background: theme[2],
            card: "transparent",
            primary: theme[2],
            border: theme[6],
            text: theme[11],
            notification: theme[9],
          },
          dark: true,
        }}
      >
        <StatusBarStyling />
        <JsStack
          screenOptions={{
            header: () => null,
            animationEnabled: true,
            freezeOnBlur: true,
            gestureEnabled: true,
            detachPreviousScreen: false,
          }}
        >
          <JsStack.Screen name="index" options={{ animationEnabled: false }} />
          {["search", "customize", "share/index", "share/link"].map((t) => (
            <JsStack.Screen
              name={t}
              key={t}
              options={{
                ...TransitionPresets.ModalPresentationIOS,
                ...(breakpoints.md && {
                  cardStyleInterpolator: arcAnimation,
                  transitionSpec: arcAnimationSpec,
                }),
                cardStyle: breakpoints.md
                  ? {
                      maxWidth: 600,
                      width: "100%",
                      marginHorizontal: "auto",
                      borderRadius: 25,
                      borderWidth: 2,
                      borderColor: theme[5],
                    }
                  : undefined,
              }}
            />
          ))}
        </JsStack>
      </ThemeProvider>
    </>
  );
}
