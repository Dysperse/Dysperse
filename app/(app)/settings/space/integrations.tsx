import { SettingsLayout } from "@/components/settings/layout";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import { View } from "react-native";

const integrations = [
  {
    name: "Notion",
    description: "Connect databases, pages, and more",
    icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
  },
  {
    name: "Google Calendar",
    description: "Sync your calendar events with collections",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/2048px-Google_Calendar_icon_%282020%29.svg.png",
  },
  {
    name: "Canvas LMS",
    description: "Automatically sync assignments and quizzes",
    icon: "https://s6.imgcdn.dev/fZLql.jpg",
  },
];

export default function Page() {
  const theme = useColorTheme();

  return (
    <SettingsLayout>
      <Text heading style={{ fontSize: 50 }}>
        Integrations
      </Text>
      <Text>
        Soon, you'll be able to connect your account to other services like
        Notion, Google Calendar, and more.
      </Text>
      <View style={{ gap: 10 }}>
        {integrations.map((integration) => (
          <View
            key={integration.name}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 20,
              alignItems: "center",
              gap: 20,
              flexDirection: "row",
            }}
          >
            <Image
              source={{ uri: integration.icon }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 10,
              }}
            />
            <View>
              <Text style={{ fontSize: 30 }}>{integration.name}</Text>
              <Text>{integration.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </SettingsLayout>
  );
}
