import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { router, usePathname } from "expo-router";

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

  return pathname.includes("search") ? (
    <Button
      variant="filled"
      style={{ paddingHorizontal: 20 }}
      onPress={()=>router.back()}
    >
      <ButtonText>Done</ButtonText>
      <Icon>done</Icon>
    </Button>
  ) : (
    <IconButton
      size={40}
      style={[breakpoints.md && { borderRadius: 20 }]}
      icon="search"
      onPress={handleClick}
    />
  );
};
