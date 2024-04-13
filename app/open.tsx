import { CommandPaletteContent } from "@/components/command-palette/palette";
import { useUser } from "@/context/useUser";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import { Redirect, router } from "expo-router";
import { StatusBar, View } from "react-native";

export default function Page() {
  const { session } = useUser();
  const theme = useColor(session?.user?.profile?.theme || "mint");

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

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
