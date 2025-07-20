import CommandPaletteContent from "@/components/command-palette/content";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { StatusBar, View } from "react-native";

export default function Page() {
  const theme = useColorTheme();

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

  const handleClose = () =>
    router.canGoBack() ? router.back() : router.push("/");

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View
        style={{
          backgroundColor: theme[2],
          flex: 1,
        }}
      >
        <CommandPaletteContent defaultFilter={null} handleClose={handleClose} />
      </View>
    </>
  );
}

