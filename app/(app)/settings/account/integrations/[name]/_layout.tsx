import { JsStack } from "@/components/layout/_stack";
import { forHorizontalIOS } from "@/components/layout/forHorizontalIOS";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import IconButton from "@/ui/IconButton";
import { TransitionPresets } from "@react-navigation/stack";
import { router } from "expo-router";
import { useEffect } from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SlideProgressBar = ({ slide, length }) => {
  const theme = useColorTheme();
  const width = useSharedValue(0);

  const widthStyle = useAnimatedStyle(() => ({
    width: withSpring(
      `${((parseInt(slide) || 0) / (parseInt(length) || 1)) * 100}%`,
      {
        damping: 30,
        stiffness: 400,
      }
    ),
  }));

  useEffect(() => {
    width.value = slide;
  }, [slide, width]);

  return (
    <View style={{ backgroundColor: theme[6] }}>
      <Animated.View
        style={[
          widthStyle,
          {
            height: 2,
            backgroundColor: theme[11],
            // shadowColor: theme[11],
            // shadowOffset: { height: 2, width: 0 },
            // borderRadius: 10,
            // shadowRadius: 20,
          },
        ]}
      />
    </View>
  );
};

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
        {/* <ConfirmationModal
          onSuccess={handleBack}
          title="Exit setup?"
          secondary="This integration will not be created"
          height={350}
          //   disabled={slide !== 0}
        > */}
        <IconButton
          icon="arrow_back_ios_new"
          onPress={handleBack}
          size={55}
          // disabled={connectedSuccess}
        />
        {/* </ConfirmationModal> */}
      </View>

      {/* <SlideProgressBar slide={1} length={3} /> */}
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
        screenOptions={{
          animationEnabled: true,
          ...TransitionPresets.SlideFromRightIOS,
          cardStyleInterpolator: forHorizontalIOS,
          header: () => <Navbar />,
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
