import { SettingsLayout } from "@/components/settings/layout";
import Alert from "@/ui/Alert";
import Text from "@/ui/Text";

export default function Page() {
  return (
    <SettingsLayout>
      <Text heading style={{ fontSize: 50 }}>
        Devices
      </Text>
      <Text style={{ opacity: 0.6 }}>
        Forgot to log out of someone else's device? Seeing any weird activity?
        {"\n"}No worries, you can log out here.
      </Text>
      <Alert style={{ marginTop: 20 }} emoji="1f6a7" title="Coming soon" />
    </SettingsLayout>
  );
}
