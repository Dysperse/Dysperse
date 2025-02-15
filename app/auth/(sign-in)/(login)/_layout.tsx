import { JsStack } from "@/components/layout/_stack";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import { TransitionPresets } from "@react-navigation/stack";

export default function Layout() {
  const breakpoints = useResponsiveBreakpoints();

  const theme = useColorTheme();

  return (
    <JsStack
      screenOptions={{
        header: () => null,
        gestureResponseDistance: 10000,
        cardStyle: {
          backgroundColor: theme[1],
          paddingHorizontal: breakpoints.md ? 40 : 30,
          paddingLeft: breakpoints.md ? 60 : undefined,
        },
        ...TransitionPresets.SlideFromRightIOS,
      }}
    />
  );
}

