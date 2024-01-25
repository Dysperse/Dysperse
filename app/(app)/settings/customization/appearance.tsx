import { SettingsLayout } from "@/components/settings/layout";
import Text from "@/ui/Text";

export default function Page() {
  return (
    <SettingsLayout>
      <Text heading style={{ fontSize: 50 }}>
        Appearance
      </Text>
    </SettingsLayout>
  );
}
