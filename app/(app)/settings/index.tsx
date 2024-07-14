import { SettingsSidebar } from "@/components/settings/sidebar";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Redirect } from "expo-router";

export default function Page() {
  const breakpoints = useResponsiveBreakpoints();
  if (breakpoints.md) return <Redirect href="/settings/account" />;

  return <SettingsSidebar forceShow />;
}
