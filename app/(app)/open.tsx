import CommandPaletteContent from "@/components/command-palette/content";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { useColorTheme } from "@/ui/color/theme-provider";
import Spinner from "@/ui/Spinner";
import { router } from "expo-router";
import { Suspense } from "react";
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
    </>
  );
}

