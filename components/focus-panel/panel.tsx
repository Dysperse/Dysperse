import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { memo, useEffect } from "react";
import { Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ContentWrapper } from "../layout/content";
import { useFocusPanelContext } from "./context";

const FocusPanel = memo(function FocusPanel() {
  const { isFocused } = useFocusPanelContext();
  const marginRight = useSharedValue(-350);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      marginRight: withSpring(marginRight.value, {
        damping: 30,
        stiffness: 400,
      }),
    };
  });

  useEffect(() => {
    if (isFocused) {
      marginRight.value = 0;
    } else {
      marginRight.value = -350;
    }
  }, [isFocused, marginRight]);

  const breakpoints = useResponsiveBreakpoints();

  return !breakpoints.md ? null : (
    <Animated.View
      style={[
        animatedStyle,
        {
          padding: 10,
          width: 350,
          paddingLeft: 0,
          ...(Platform.OS === "web" &&
            ({
              marginTop: "env(titlebar-area-height,0)",
            } as any)),
        },
      ]}
    >
      <ContentWrapper
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        {isFocused && (
          <>
            <Icon size={40}>magic_button</Icon>
            <Text>Focus panel</Text>
          </>
        )}
      </ContentWrapper>
    </Animated.View>
  );
});

export default FocusPanel;
