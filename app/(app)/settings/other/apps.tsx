import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import { Avatar } from "@/ui/Avatar";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { Linking, Pressable, TextStyle, View } from "react-native";

export default function Page() {
  const theme = useColorTheme();

  const cardHeading: TextStyle = {
    fontSize: 25,
    fontFamily: "body_700",
    color: theme[11],
  };
  const cardDescription: TextStyle = {
    fontSize: 15,
    fontFamily: "body_400",
    color: theme[11],
    opacity: 0.7,
  };

  return (
    <SettingsLayout>
      <Text style={settingStyles.title}>Download</Text>
      <Text>
        Stay organized. Anywhere. Download #dysperse on all your favorite
        platforms for a supercharged experience.
      </Text>

      <View>
        {[
          {
            icon: "install_desktop",
            filled: true,
            name: "PWA",
            description: "Install #dysperse on your desktop",
          },
          {
            icon: "window",
            filled: true,
            name: "Windows",
            href: "https://click.dysperse.com/ms",
            description: "Works on Windows 8 & higher",
          },
          {
            icon: "language",
            name: "Web",
            href: "https://app.dysperse.com",
            description: "Use #dysperse in your browser. Works on any device.",
          },
          { icon: "ios", name: "iOS", comingSoon: true },
          { icon: "android", name: "Android", comingSoon: true },
        ].map((app) => (
          <Pressable
            onPress={() => {
              Linking.openURL(app.href);
            }}
            style={({ pressed, hovered }) => ({
              backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
              borderWidth: 1,
              borderColor: theme[pressed ? 7 : hovered ? 6 : 5],
              marginTop: 15,
              marginBottom: 5,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              padding: 20,
              gap: 20,
              paddingRight: 30,
              opacity: app.comingSoon ? 0.7 : 1,
            })}
            key={app.name}
            disabled={app.comingSoon}
          >
            <Avatar
              icon={app.icon}
              style={{ backgroundColor: addHslAlpha(theme[11], 0.1) }}
              iconProps={{ filled: app.filled }}
              size={40}
            />
            <View style={{ flex: 1 }}>
              <Text style={cardHeading}>{app.name}</Text>
              <Text style={cardDescription}>
                {app.comingSoon ? "Coming soon" : app.description}
              </Text>
            </View>
            <Icon>north_east</Icon>
          </Pressable>
        ))}
      </View>
    </SettingsLayout>
  );
}
