import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname } from "expo-router";
import { Platform, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getBottomNavigationHeight } from "./bottom-navigation";

export function ContentWrapper(props) {
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  return (
    <View
      style={{
        marginTop: insets.top + 64,
        backgroundColor: theme[1],
        flex: 1,
        overflow: "hidden",
        borderRadius: 15,
        borderWidth: width > 600 ? 1 : 0,
        borderColor: theme[6],
      }}
      {...props}
    >
      {Platform.OS !== "ios" && (
        <LinearGradient
          colors={[addHslAlpha(theme[1], 0.5), "transparent"]}
          style={{ height: 20, marginBottom: -20, zIndex: 9 }}
        />
      )}
      {props.children}
    </View>
  );
}
