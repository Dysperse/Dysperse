import { SettingsSidebar } from "@/components/settings/sidebar";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { router } from "expo-router";

export default function Page() {
  const breakpoints = useResponsiveBreakpoints();
  if (breakpoints.md) router.replace("/settings/account");

  return <SettingsSidebar forceShow />;
}

