import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import IconButton from "@/ui/IconButton";
import { router, usePathname } from "expo-router";
import { useCollectionContext } from "../context";

export const CollectionSearch = () => {
  const pathname = usePathname();
  const breakpoints = useResponsiveBreakpoints();
  const handleClick = (e) => {
    e.preventDefault();
    router.push(
      pathname.includes("search")
        ? pathname.replace("/search", "")
        : pathname + "/search"
    );
  };

  useHotkeys(["ctrl+f", "/"], handleClick, {
    ignoreEventWhen: () => pathname.includes("settings"),
  });

  const collection = useCollectionContext();

  return (
    <IconButton
      size={40}
      style={[breakpoints.md && { borderRadius: 20 }]}
      icon={pathname.includes("search") ? "close" : "search"}
      onPress={handleClick}
      variant={pathname.includes("search") ? "filled" : "text"}
    />
  );
};
