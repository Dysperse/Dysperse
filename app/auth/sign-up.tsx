import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import { authStyles } from "./authStyles";

export default function Page() {
  const breakpoints = useResponsiveBreakpoints();
  const handleBack = useCallback(() => router.back(), []);
  const theme = useColorTheme();

  return (
    <View
      style={[
        authStyles.container,
        { backgroundColor: theme[1] },
        breakpoints.md && {
          maxWidth: 500,
          marginHorizontal: "auto",
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme[6],
          marginVertical: 20,
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
        We're slowly rolling out the app to the public. {"\n"} Stay tuned!
      </Text>
    </View>
  );
}
