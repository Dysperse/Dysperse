import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import IconButton from "@/ui/IconButton";
import { router, usePathname } from "expo-router";
import { useCollectionContext } from "../context";

export const CollectionSearch = () => {
  const pathname = usePathname();
  const breakpoints = useResponsiveBreakpoints();

  const handleOpen = (e) => {
    e.preventDefault();
    router.push(`/search/${collection.data.id || "all"}`);
  };

  useHotkeys(["ctrl+f", "/"], handleOpen, {
    ignoreEventWhen: () => pathname.includes("settings"),
  });

  const collection = useCollectionContext();

  return (
    <IconButton
      size={40}
      style={[breakpoints.md && { borderRadius: 20 }]}
      icon="search"
      onPress={handleOpen}
      variant="text"
    />
  );
};
