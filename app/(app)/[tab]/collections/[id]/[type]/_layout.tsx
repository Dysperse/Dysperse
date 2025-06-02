import { JsStack } from "@/components/layout/_stack";
import { arcCard } from "@/components/layout/arcAnimations";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { useColorTheme } from "@/ui/color/theme-provider";
import { ThemeProvider } from "@react-navigation/native";
import { usePathname } from "expo-router";
import { SystemBars } from "react-native-edge-to-edge";

function StatusBarStyling() {
  const theme = useColorTheme();
  const pathname = usePathname();
  const t = ["customize", "search", "share", "reorder"];
  const isModal = t.find((p) => pathname.includes(p));

  useWebStatusBar({
    active: isModal ? "#000" : theme[2],
    cleanup: theme[2],
  });

  return isModal && <SystemBars style="light" />;
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
          fonts: {
            bold: { fontFamily: "body_900", fontWeight: "900" },
            heavy: { fontFamily: "body_700", fontWeight: "700" },
            medium: { fontFamily: "body_500", fontWeight: "500" },
            regular: { fontFamily: "body_400", fontWeight: "400" },
          },
        }}
      >
        {!breakpoints.md && <StatusBarStyling />}
        <JsStack
          id={undefined}
          screenOptions={{
            header: () => null,
            // freezeOnBlur: true,
            gestureEnabled: true,
            detachPreviousScreen: false,
            animation: "none",
          }}
        >
          <JsStack.Screen name="index" />
          {[
            "search",
            "customize",
            "share/index",
            "share/link",
            "reorder",
            "upload",
            "pin-code",
          ].map((t) => (
            <JsStack.Screen
              name={t}
              key={t}
              options={arcCard({
                theme,
                breakpoints,
                maxWidth: 500,
                padding: 0,
              })}
            />
          ))}
        </JsStack>
      </ThemeProvider>
    </>
  );
}

