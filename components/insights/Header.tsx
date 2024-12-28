import { MenuButton } from "@/app/(app)/home";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Header({ scrollRef }) {
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();
  const { sidebarRef } = useSidebarContext();

  const handleBack = (e) => {
    e.stopPropagation();
    if (breakpoints.md) router.replace("/home");
    else sidebarRef.current.openDrawer();
  };

  useHotkeys("esc", handleBack);

  return <MenuButton gradient />;
}

