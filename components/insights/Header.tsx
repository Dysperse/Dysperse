import { MenuButton } from "@/app/(app)/home";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { SystemBars } from "react-native-edge-to-edge";

export function Header({ scrollRef }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { sidebarRef } = useSidebarContext();

  const handleBack = (e) => {
    e.stopPropagation();
    if (breakpoints.md) router.replace("/home");
    else sidebarRef.current.openDrawer();
  };

  useHotkeys("esc", handleBack);

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

  return (
    <>
      <SystemBars style="light" />
      <MenuButton gradient back />
    </>
  );
}

