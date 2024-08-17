import PWAInstallerPrompt from "@/components/layout/PWAInstaller";
import { settingStyles } from "@/components/settings/settingsStyles";
import { Avatar } from "@/ui/Avatar";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Text, { getFontName } from "@/ui/Text";
import { LinearGradient } from "expo-linear-gradient";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  TextStyle,
  View,
} from "react-native";

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    marginTop: 15,
    marginBottom: 5,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 20,
    paddingRight: 30,
  },
});

export default function Page() {
  const theme = useColorTheme();

  const cardHeading: TextStyle = {
    fontSize: 25,
    fontFamily: getFontName("jost", 700),
    color: theme[11],
  };
  const cardDescription: TextStyle = {
    fontSize: 15,
    fontFamily: getFontName("jost", 400),
    opacity: 0.7,
    color: theme[11],
  };

  return (
    <SettingsScrollView>
      <Text style={settingStyles.title}>Download</Text>
      <Text>
        Stay organized. Anywhere. Download #dysperse on all your favorite
        platforms for a supercharged experience.
      </Text>

      <View>
        {Platform.OS === "web" && (
          <PWAInstallerPrompt
            render={({ onClick }) => (
              <Pressable
                onPress={onClick}
                style={({ pressed, hovered }) => [
                  styles.card,
                  {
                    borderColor: theme[pressed ? 7 : hovered ? 6 : 5],
                    backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
                  },
                ]}
              >
                <Avatar
                  icon="install_desktop"
                  style={{ backgroundColor: addHslAlpha(theme[11], 0.1) }}
                  size={40}
                />
                <View style={{ flex: 1 }}>
                  <Text style={cardHeading}>PWA</Text>
                  <Text style={cardDescription}>
                    Create a lightweight app on your desktop. Works on Windows,
                    Mac, iOS & Android.
                  </Text>
                </View>
                <Icon>north_east</Icon>
              </Pressable>
            )}
          />
        )}
        {[
          {
            icon: "window",
            name: "Windows",
            href: "https://click.dysperse.com/ms",
            description: "Requires Windows 10 or higher",
          },
          {
            icon: "desktop_mac",
            name: "Mac",
            experimental: true,
            href: "https://click.dysperse.com/mac",
            description: "Unstable. Requires macOS Yosemite (10.10) or higher",
          },
          {
            icon: "globe",
            name: "Web",
            href: "https://app.dysperse.com",
            description: "Works on all modern browsers on any device",
          },
          {
            icon: "globe",
            name: "Chrome Extension",
            new: true,
            href: "https://click.dysperse.com/chrome-extension",
            description:
              "Quickly add tasks and save any web page to Dysperse via Chrome & other browsers!",
          },
          {
            icon: "globe",
            name: "Edge Extension",
            href: "https://app.dysperse.com",
            new: true,
            description:
              "Quickly add tasks and save any web page to Dysperse via Microsoft Edge",
          },
          { icon: "ios", name: "iOS", comingSoon: true },
          { icon: "android", name: "Android", comingSoon: true },
        ].map(
          (app) =>
            app && (
              <Pressable
                onPress={() => {
                  if (app.name === "PWA") {
                    window.open(app.href, "_blank");
                    return;
                  }
                  Linking.openURL(app.href);
                }}
                style={({ pressed, hovered }) => [
                  styles.card,
                  {
                    borderColor: theme[pressed ? 7 : hovered ? 6 : 5],
                    backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
                    opacity: app.comingSoon ? 0.7 : 1,
                  },
                ]}
                key={app.name}
                disabled={app.comingSoon}
              >
                <Avatar
                  disabled
                  icon={app.icon}
                  style={{ backgroundColor: addHslAlpha(theme[11], 0.1) }}
                  iconProps={{ filled: true }}
                  size={40}
                />
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Text style={cardHeading}>{app.name}</Text>
                    {app.experimental && (
                      <LinearGradient
                        colors={["#ff0f7b", "#f89b29"]}
                        style={{
                          paddingHorizontal: 10,
                          borderRadius: 99,
                          paddingVertical: 3,
                        }}
                      >
                        <Text style={{ fontSize: 12, color: "#fff" }}>
                          Experimental
                        </Text>
                      </LinearGradient>
                    )}
                    {app.new && (
                      <LinearGradient
                        colors={["#fc9305", "#f24389", "#b01041"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          paddingHorizontal: 10,
                          borderRadius: 99,
                          paddingVertical: 3,
                        }}
                      >
                        <Text style={{ fontSize: 12, color: "#fff" }}>NEW</Text>
                      </LinearGradient>
                    )}
                  </View>
                  <Text style={cardDescription}>
                    {app.comingSoon ? "Coming soon" : app.description}
                  </Text>
                </View>
                <Icon>north_east</Icon>
              </Pressable>
            )
        )}
      </View>
    </SettingsScrollView>
  );
}
