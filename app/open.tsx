import CommandPaletteContent from "@/components/command-palette/content";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import Spinner from "@/ui/Spinner";
import { Redirect, router } from "expo-router";
import { Suspense } from "react";
import { StatusBar, View } from "react-native";

export default function Page() {
  const { session } = useUser();
  const theme = useColor(session?.user?.profile?.theme || "mint");
  const breakpoints = useResponsiveBreakpoints();

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

  if (breakpoints.md) return <Redirect href="/" />;
  if (!session || session?.error) return <Redirect href="/auth" />;

  const handleClose = () =>
    router.canGoBack() ? router.back() : router.push("/");

  return (
    <ColorThemeProvider theme={theme}>
      <StatusBar barStyle="light-content" />
      <View
        style={{
          backgroundColor: theme[2],
          flex: 1,
        }}
      >
        <Suspense fallback={<Spinner />}>
          <CommandPaletteContent
            defaultFilter={null}
            handleClose={handleClose}
          />
        </Suspense>
      </View>
    </ColorThemeProvider>
  );
}

