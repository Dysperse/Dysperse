import { JsStack } from "@/components/layout/_stack";
import { forHorizontalIOS } from "@/components/layout/forHorizontalIOS";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import IconButton from "@/ui/IconButton";
import { TransitionPresets } from "@react-navigation/stack";
import { router } from "expo-router";
import { useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function Navbar() {
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();

  const handleBack = () => router.back();

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          height: 80 + insets.top,
          paddingTop: insets.top,
          alignItems: "center",
          paddingHorizontal: 10,
          zIndex: 1,
          borderBottomWidth: 1,
          borderBlockColor: theme[6],
          backgroundColor: theme[2],
        }}
      >
        <IconButton icon="arrow_back_ios_new" onPress={handleBack} size={55} />
      </View>
    </>
  );
}

export default function Layout() {
  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();
  const theme = useColorTheme();
  const { height } = useWindowDimensions();

  return (
    <View
      style={[
        { flex: 1, paddingBottom: insets.bottom, backgroundColor: theme[2] },
        breakpoints.md && {
          borderWidth: 1,
          borderRadius: 20,
          borderColor: theme[6],
          overflow: "hidden",
          marginVertical: 20,
          height: height - 60,
        },
      ]}
    >
      <JsStack
        id={undefined}
        screenOptions={{
          ...TransitionPresets.SlideFromRightIOS,
          cardStyleInterpolator: forHorizontalIOS,
          header: () =>
            breakpoints.md ? (
              <Navbar />
            ) : (
              <View style={{ height: 10 + insets.top }} />
            ),
          cardStyle: {
            backgroundColor: theme[2],
          },
        }}
      >
        <JsStack.Screen name="index" />
      </JsStack>
    </View>
  );
}

