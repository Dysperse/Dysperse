import { JsStack } from "@/components/layout/_stack";
import { ArcSystemBar } from "@/components/layout/arcAnimations";
import { forHorizontalIOS } from "@/components/layout/forHorizontalIOS";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { useColorTheme } from "@/ui/color/theme-provider";
import { TransitionPresets } from "@react-navigation/stack";

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
          detachPreviousScreen: false,
          headerShown: false,
          gestureEnabled: true,
          cardOverlayEnabled: true,
          gestureResponseDistance: 9999,
          cardStyle: { backgroundColor: theme[2], display: "flex" },
          ...TransitionPresets.SlideFromRightIOS,
          cardStyleInterpolator: forHorizontalIOS,
        }}
      />
    </>
  );
}
