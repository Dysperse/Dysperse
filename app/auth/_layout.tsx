import { JsStack } from "@/components/layout/_stack";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import { TransitionPresets } from "@react-navigation/stack";
import { View, useWindowDimensions } from "react-native";

export default function Layout() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { height, width } = useWindowDimensions();

  return (
    <JsStack
      screenOptions={{
        header: () => <View />,
        headerTransparent: true,
        gestureResponseDistance: width,
        gestureEnabled: true,
        cardStyle: {
          backgroundColor: theme[breakpoints.sm ? 2 : 1],
          padding: breakpoints.md ? 10 : 0,
        },
        // change opacity of the previous screen when swipe
        cardOverlayEnabled: true,
        animationEnabled: false,
        gestureVelocityImpact: 0.7,
      }}
    >
      <JsStack.Screen
        name="sign-in"
        options={{
          header: () => null,
          animationEnabled: true,
          presentation: "modal",
          ...TransitionPresets.ModalPresentationIOS,
          gestureResponseDistance: height,
        }}
      />
    </JsStack>
  );
}
