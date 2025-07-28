import { JsStack } from "@/components/layout/_stack";
import { ArcSystemBar } from "@/components/layout/arcAnimations";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { useColorTheme } from "@/ui/color/theme-provider";
import { TransitionPresets } from "@react-navigation/stack";
import { MenuButton } from "../home";

export default function Layout() {
  const theme = useColorTheme();

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

  return (
    <>
      <ArcSystemBar />
      <JsStack
        id={undefined}
        screenOptions={{
          ...TransitionPresets.SlideFromRightIOS,
          header: ({ navigation, route }) => (
            <MenuButton
              gradient
              back
              left={route.name !== "index"}
              icon={route.name === "index" ? "close" : "west"}
            />
          ),
          headerMode: "screen",
          detachPreviousScreen: false,
          gestureEnabled: true,
          cardOverlayEnabled: true,
          gestureResponseDistance: 9999,
          cardStyle: { backgroundColor: theme[2], display: "flex" },
        }}
      />
    </>
  );
}
