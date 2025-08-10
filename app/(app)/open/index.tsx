import CommandPaletteContent from "@/components/command-palette/content";

import { ArcSystemBar } from "@/components/layout/arcAnimations";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

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
      <ArcSystemBar />
      <KeyboardAvoidingView
        behavior="padding"
        style={{
          backgroundColor: theme[2],
          flex: 1,
        }}
      >
        <CommandPaletteContent defaultFilter={null} handleClose={handleClose} />
      </KeyboardAvoidingView>
    </>
  );
}

