import { useSidebarContext } from "@/components/layout/sidebar/context";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
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

  return (
    <Pressable onPress={() => scrollRef.current?.scrollTo({ y: 0 })}>
      <LinearGradient
        colors={[theme[2], theme[3]]}
        style={{
          paddingTop: insets.top,
          borderBottomWidth: 1,
          borderBottomColor: theme[5],
          flexDirection: "row",
          zIndex: 9,
          height: 64,
        }}
      >
        <IconButton
          icon={
            <View
              style={{ alignItems: "center", flexDirection: "row", gap: 15 }}
            >
              <Icon style={{ opacity: 0.6 }}>
                {breakpoints.md ? "arrow_back_ios_new" : "menu"}
              </Icon>
              {breakpoints.md && <Text variant="eyebrow">Home</Text>}
            </View>
          }
          onPress={handleBack}
          style={{
            position: "absolute",
            left: 15,
            top: insets.top + 15,
          }}
        />
      </LinearGradient>
    </Pressable>
  );
}
