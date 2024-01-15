import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import { usePathname } from "expo-router";
import { StyleSheet, View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getBottomNavigationHeight } from "./bottom-navigation";

interface ContentWrapperProps extends ViewProps {
  enabled?: boolean;
  noPaddingTop?: boolean;
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    //  borderRadius: 20,
  },
});
export function ContentWrapper(props: ContentWrapperProps) {
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();
  const pathname = usePathname();

  return props.enabled !== false ? (
    <View
      style={[
        styles.container,
        {
          borderRadius: breakpoints.md ? 20 : 0,
          marginTop: props.noPaddingTop
            ? 0
            : breakpoints.md
            ? insets.top
            : insets.top + 64,
          backgroundColor: theme[1],
          borderWidth: breakpoints.md ? 1 : 0,
          paddingBottom: breakpoints.md
            ? 0
            : getBottomNavigationHeight(pathname),
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
