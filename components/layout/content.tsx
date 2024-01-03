import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, View, ViewProps, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ContentWrapperProps extends ViewProps {
  enabled?: boolean;
}
export function ContentWrapper(props: ContentWrapperProps) {
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  return props.enabled !== false ? (
    <View
      style={{
        marginTop: insets.top,
        backgroundColor: theme[1],
        flex: 1,
        overflow: "hidden",
        borderRadius: 20,
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
  ) : (
    props.children
  );
}
