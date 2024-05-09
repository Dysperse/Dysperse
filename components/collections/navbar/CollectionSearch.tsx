import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import IconButton from "@/ui/IconButton";
import { router } from "expo-router";
import { useCollectionContext } from "../context";

export const CollectionSearch = () => {
  const breakpoints = useResponsiveBreakpoints();

  const handleOpen = () => {
    router.push(`/search/${collection.data.id || "all"}`);
  };

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
