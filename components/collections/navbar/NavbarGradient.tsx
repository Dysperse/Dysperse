import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const NavbarGradient = ({ children }) => {
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <LinearGradient
      colors={[theme[2], theme[breakpoints.md ? 1 : 3]]}
      style={{
        backgroundColor: theme[3],
        height: 60 + insets.top,
        paddingTop: insets.top,
        paddingHorizontal: 10,
        flexDirection: "row",
        // borderBottomWidth: breakpoints.md ? 2 : 0,
        // borderBottomColor: theme[5],
        alignItems: "center",
        gap: 5,
      }}
    >
      {children}
    </LinearGradient>
  );
};
