import { useColorTheme } from "@/ui/color/theme-provider";
import { usePathname } from "expo-router";
import { StyleSheet, View, ViewProps, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getBottomNavigationHeight } from "./bottom-navigation";

interface ContentWrapperProps extends ViewProps {
  enabled?: boolean;
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 20,
  },
});
export function ContentWrapper(props: ContentWrapperProps) {
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pathname = usePathname();

  return props.enabled !== false ? (
    <View
      style={[
        styles.container,
        {
          marginTop: insets.top,
          backgroundColor: theme[1],
          borderWidth: width > 600 ? 1 : 0,
          paddingBottom: getBottomNavigationHeight(pathname),
          borderColor: theme[6],
        },
      ]}
      {...props}
    >
      {props.children}
    </View>
  ) : (
    props.children
  );
}
