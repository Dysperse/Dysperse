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
      colors={[theme[breakpoints.md ? 2 : 3], theme[1]]}
      style={{
        height: breakpoints.md ? 60 : 60 + insets.top,
        paddingTop: breakpoints.md ? undefined : insets.top,
        paddingHorizontal: 10,
        zIndex: 9,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
      }}
    >
      {children}
    </LinearGradient>
  );
};

