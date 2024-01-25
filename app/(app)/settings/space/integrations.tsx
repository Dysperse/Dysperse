import { SettingsLayout } from "@/components/settings/layout";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Text from "@/ui/Text";

export default function Page() {
  const breakpoints = useResponsiveBreakpoints();

  return (
    <SettingsLayout>
      <Text heading style={{ fontSize: 50 }}>
        Integrations
      </Text>
    </SettingsLayout>
  );
}
