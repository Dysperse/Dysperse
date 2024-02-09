import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import { authStyles } from "./authStyles";

export default function Page() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.push("/");
  }, []);

  return (
    <View
      style={[
        authStyles.container,
        { backgroundColor: theme[1] },
        breakpoints.md && authStyles.containerDesktop,
        breakpoints.md && {
          borderColor: theme[6],
        },
      ]}
    >
      <IconButton
        variant="outlined"
        size={55}
        icon="close"
        onPress={handleBack}
      />
      <Text
        style={{
          marginVertical: "auto",
          textAlign: "center",
          fontSize: 30,
          paddingHorizontal: 30,
          opacity: 0.5,
        }}
        weight={600}
      >
        Coming soon!
      </Text>
    </View>
  );
}
