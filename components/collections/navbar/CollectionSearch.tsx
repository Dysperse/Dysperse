import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import IconButton from "@/ui/IconButton";
import { router, useGlobalSearchParams, usePathname } from "expo-router";

export const CollectionSearch = () => {
  const pathname = usePathname();
  const breakpoints = useResponsiveBreakpoints();
  const { id, tab, type } = useGlobalSearchParams();

  const handleClick = (e) => {
    e.preventDefault();
    router.dismissAll();
    router.push({
      pathname: "[tab]/collections/[id]/[view]/search",
      params: { id, tab, view: type },
    });
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

