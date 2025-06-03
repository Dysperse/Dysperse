import PWAInstallerPrompt from "@/components/layout/PWAInstaller";
import { settingStyles } from "@/components/settings/settingsStyles";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Text, { getFontName } from "@/ui/Text";
import { LinearGradient } from "expo-linear-gradient";
import { Linking, Platform, StyleSheet, TextStyle, View } from "react-native";

const styles = StyleSheet.create({
  card: {
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
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();

  const cardHeading: TextStyle = {
    fontSize: breakpoints.md ? 25 : 18,
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
      <Text style={settingStyles.title}>Get the apps</Text>
      <Text style={{ opacity: 0.6, marginBottom: 20 }}>
        Download Dysperse on all of your devices!
      </Text>

      <View>
        {Platform.OS === "web" && (
          <PWAInstallerPrompt
            render={({ onClick }) => (
              <Button variant="filled" onPress={onClick}>
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
              </Button>
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
            href: "https://go.dysperse.com",
            description: "Works on all modern browsers on any device",
          },
          { icon: "ios", name: "iOS", comingSoon: true },
          { icon: "android", name: "Android", comingSoon: true },
          {
            text: "Browser extensions",
            description:
              "Quickly create tasks and save web\npages to your collections",
          },
          {
            name: "Chrome",
            href: "https://click.dysperse.com/chrome-extension",
          },
          {
            name: "Edge",
            href: "https://microsoftedge.microsoft.com/addons/detail/dysperse/jholcbknkbnmaceagionfohdjhkpnpjd",
          },
          {
            name: "Firefox",
            href: "https://addons.mozilla.org/en-US/firefox/addon/dysperse",
          },
        ].map((app) =>
          app && app.text ? (
            <View
              style={{
                marginTop: 40,
                marginBottom: 20,
                paddingHorizontal: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "serifText700",
                  marginBottom: 5,
                  color: theme[11],
                }}
              >
                {app.text}
              </Text>
              <Text style={{ color: theme[11], opacity: 0.6, fontSize: 18 }}>
                {app.description}
              </Text>
            </View>
          ) : (
            <Button
              onPress={() => {
                if (app.name === "PWA") {
                  window.open(app.href, "_blank");
                  return;
                }
                Linking.openURL(app.href);
              }}
              key={app.name}
              variant="filled"
              height={"auto" as any}
              style={{ paddingHorizontal: 20, gap: 15, paddingVertical: 20 }}
              containerStyle={{
                marginTop: 10,
                borderRadius: 30,
                opacity: app.comingSoon ? 0.6 : 1,
              }}
              disabled={app.comingSoon}
            >
              {app.icon && (
                <Avatar
                  disabled
                  icon={app.icon}
                  style={{ backgroundColor: addHslAlpha(theme[11], 0.1) }}
                  iconProps={{ filled: true }}
                  size={40}
                />
              )}
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
                {(app.description || app.comingSoon) && (
                  <Text style={cardDescription}>
                    {app.comingSoon ? "Coming soon" : app.description}
                  </Text>
                )}
              </View>
              <Icon>north_east</Icon>
            </Button>
          )
        )}
      </View>
    </SettingsScrollView>
  );
}

