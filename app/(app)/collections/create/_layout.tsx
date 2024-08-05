import { JsStack } from "@/components/layout/_stack";
import ContentWrapper from "@/components/layout/content";
import { forHorizontalIOS } from "@/components/layout/forHorizontalIOS";
import { TransitionPresets } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Layout() {
  const insets = useSafeAreaInsets();

  return (
    <ContentWrapper noPaddingTop style={{ paddingTop: insets.top }}>
      <JsStack
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
          freezeOnBlur: true,
          ...TransitionPresets.SlideFromRightIOS,
          cardStyleInterpolator: forHorizontalIOS,
        }}
      >
        <JsStack.Screen name="index" />
        <JsStack.Screen name="scratch" />
        <JsStack.Screen name="templates" />
      </JsStack>
    </ContentWrapper>
  );
}
