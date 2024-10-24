import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import IconButton from "@/ui/IconButton";
import { router, usePathname } from "expo-router";

export const CollectionSearch = () => {
  const pathname = usePathname();
  const breakpoints = useResponsiveBreakpoints();
  const handleClick = (e) => {
    e.preventDefault();
    router.push(pathname + "/search");
  };

  useHotkeys(["ctrl+f", "/"], handleClick, {
    ignoreEventWhen: () => pathname.includes("settings"),
  });

  return (
    <IconButton
      size={40}
      style={[breakpoints.md && { borderRadius: 20 }]}
      icon="search"
      onPress={handleClick}
    />
  );
};

