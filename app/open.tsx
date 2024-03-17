import { CommandPaletteContent } from "@/components/command-palette/palette";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import { Redirect, router } from "expo-router";
import { useEffect } from "react";
import { Platform, StatusBar, View } from "react-native";

export default function Page() {
  const { session } = useUser();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColor(session?.user?.profile?.theme || "mint");

  useEffect(() => {
    if (Platform.OS === "web") {
      document
        .querySelector(`meta[name="theme-color"]`)
        .setAttribute("content", "#000");
      return () => {
        document
          .querySelector(`meta[name="theme-color"]`)
          .setAttribute("content", theme[2]);
      };
    }
  }, [theme, breakpoints.md]);

  if (!session || session?.error) return <Redirect href="/auth" />;

  const handleClose = () =>
    router.canGoBack() ? router.back() : router.push("/");

  return (
    <ColorThemeProvider theme={theme}>
      <StatusBar barStyle="light-content" />
      <View style={{ backgroundColor: theme[2], flex: 1 }}>
        <CommandPaletteContent handleClose={handleClose} />
      </View>
    </ColorThemeProvider>
  );
}
