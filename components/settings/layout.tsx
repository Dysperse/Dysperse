import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Divider from "@/ui/Divider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router, usePathname } from "expo-router";
import * as Updates from "expo-updates";
import { useState } from "react";
import {
  Linking,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  contentContainer: {
    gap: 15,
    padding: 20,
    paddingTop: 30,
    paddingBottom: 130,
  },
  search: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 15,
    marginTop: -5,
    marginBottom: 10,
  },
  headerButton: { flexGrow: 1, flexBasis: 0 },
  title: { fontSize: 50 },
  sectionContainer: {
    paddingVertical: 10,
  },
  sectionItem: { borderRadius: 99 },
});

function SettingsSidebar() {
  const breakpoints = useResponsiveBreakpoints();
  const pathname = usePathname();
  const theme = useColorTheme();
  const { signOut } = useSession();

  const [search, setSearch] = useState("");

  const settingsOptions = [
    {
      name: "Preferences",
      settings: [
        {
          name: "Account",
          icon: "person",
          href: "/settings/account",
          keywords: [
            "account",
            "email",
            "password",
            "account",
            "login",
            "security",
            "password",
            "2fa",
            "two",
            "factor",
          ],
        },
        {
          name: "Profile",
          icon: "alternate_email",
          href: "/settings/account/profile",
          keywords: ["profile", "account", "user", "personal"],
        },
        {
          name: "Integrations",
          icon: "interests",
          href: "/settings/account/integrations",
          keywords: [
            "integrations",
            "services",
            "connect",
            "notion",
            "canvas",
            "google",
          ],
        },
      ],
    },
    {
      name: "Customization",
      settings: [
        {
          name: "Appearance",
          icon: "palette",
          href: "/settings/customization/appearance",
          keywords: ["appearance", "theme", "color", "dark", "light"],
        },
        {
          name: "Notifications",
          icon: "notifications",
          href: "/settings/customization/notifications",
          keywords: ["notifications", "alerts", "emails"],
        },
      ],
    },
    {
      name: "Security",
      settings: [
        {
          name: "Scan QR code",
          icon: "qr_code_2",
          href: "/settings/login/scan",
          keywords: ["login", "scan", "qr", "mobile"],
        },
        {
          name: "Devices",
          icon: "home_max",
          href: "/settings/login/devices",
          keywords: ["devices", "sessions", "logins"],
        },
        {
          name: "Sign out",
          icon: "logout",
          callback: signOut,
          confirm: {
            title: "Sign out?",
            secondary: "You'll have to sign in again.",
            height: 360,
            onSuccess: signOut,
          },
        },
      ],
    },
    {
      name: "Other",
      settings: [
        {
          name: "Get the app",
          icon: "download",
          href: "/settings/other/apps",
        },
        {
          name: "Keybinds",
          icon: "keyboard_command_key",
          href: "/settings/shortcuts",
        },
        {
          name: "Restart app",
          icon: "refresh",
          callback: () => {
            if (Platform.OS === "web") {
              (window as any).disableSaveData = true;
              localStorage.removeItem("app-cache");
            }
            if (Platform.OS == "web") {
              window.location.reload();
            } else {
              Updates.reloadAsync();
            }
          },
        },
      ],
    },
    {
      name: "About us",
      settings: [
        {
          name: "Website",
          icon: "captive_portal",
          callback: () => Linking.openURL("https://dysperse.com"),
        },
        {
          name: "Terms of Service",
          icon: "info",
          callback: () =>
            Linking.openURL("https://blog.dysperse.com/terms-of-service"),
        },
        {
          name: "Privacy Policy",
          icon: "info",
          callback: () =>
            Linking.openURL("https://blog.dysperse.com/privacy-policy"),
        },
        {
          name: "Open Source",
          icon: "open_in_new",
          callback: () => Linking.openURL("https://github.com/Dysperse"),
        },
      ],
    },
  ]
    .filter(
      (section) =>
        section.settings.some((button) =>
          button.keywords?.some((keyword) =>
            keyword.toLowerCase().includes(search.toLowerCase())
          )
        ) ||
        !search ||
        section.name.toLowerCase().includes(search.toLowerCase())
    )
    .map((section) => ({
      ...section,
      settings: section.settings.filter(
        (button) =>
          button.keywords?.some((keyword) =>
            keyword.toLowerCase().includes(search.toLowerCase())
          ) ||
          !search ||
          section.name.toLowerCase().includes(search.toLowerCase())
      ),
    }));

  return (
    <ScrollView
      style={{ maxHeight: "100%" }}
      contentContainerStyle={{
        paddingVertical: breakpoints.md ? 50 : 0,
        paddingBottom: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          paddingHorizontal: breakpoints.md ? 10 : 20,
          marginBottom: 20,
        }}
      >
        {!breakpoints.md && (
          <Text
            style={{
              marginTop: 20,
              fontSize: 40,
              marginBottom: 10,
            }}
            weight={900}
          >
            Settings
          </Text>
        )}
        <TextField
          variant="filled+outlined"
          style={{
            paddingVertical: breakpoints.md ? undefined : 15,
            paddingHorizontal: breakpoints.md ? undefined : 25,
            marginTop: 0,
          }}
          onChangeText={setSearch}
          value={search}
          placeholder="Search..."
        />
      </View>
      {settingsOptions.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 20, opacity: 0.6 }}>
          No results found
        </Text>
      )}
      {settingsOptions.map((section, index) => (
        <View key={index} style={styles.sectionContainer}>
          <Text
            variant="eyebrow"
            style={{
              fontSize: 12,
              marginLeft: breakpoints.md ? 15 : 25,
              marginBottom: 5,
            }}
            weight={700}
          >
            {section.name}
          </Text>
          <View
            style={
              !breakpoints.md && {
                backgroundColor: theme[3],
                marginBottom: 5,
                borderRadius: 20,
                marginHorizontal: 20,
                overflow: "hidden",
              }
            }
          >
            {section.settings.map((button: any) => (
              <ConfirmationModal
                disabled={!button.confirm}
                key={button.name}
                {...button.confirm}
              >
                <ListItemButton
                  variant={
                    breakpoints.md && (pathname === button.href ||
                    (pathname.includes("integrations") &&
                      button.href?.includes("integrations")))
                      ? "filled"
                      : "default"
                  }
                  style={[
                    styles.sectionItem,
                    !breakpoints.md && {
                      paddingVertical: 15,
                      borderRadius: 0,
                    },
                  ]}
                  key={button.name}
                  onPress={() =>
                    router[breakpoints.md ? "replace" : "navigate"](
                      button.href ||
                        `/settings/${button.name
                          .toLowerCase()
                          .replaceAll(" ", "-")}`
                    )
                  }
                  {...(button.callback && { onPress: button.callback })}
                >
                  <Icon
                    filled={
                      breakpoints.md && (pathname === button.href ||
                    (pathname.includes("integrations") &&
                      button.href?.includes("integrations")))
                    }
                    style={{ color: theme[11] }}
                    size={!breakpoints.md ? 30 : 24}
                  >
                    {button.icon}
                  </Icon>
                  <ListItemText
                    primary={button.name}
                    primaryProps={{ style: { color: theme[11] } }}
                  />
                </ListItemButton>
              </ConfirmationModal>
            ))}
          </View>
          {index !== settingsOptions.length - 1 && breakpoints.md && (
            <Divider style={{ width: "90%", marginTop: 10 }} />
          )}
        </View>
      ))}
    </ScrollView>
  );
}

export function SettingsLayout({
  children,
  hideBack,
  noScroll = false,
}: {
  children?: React.ReactNode;
  hideBack?: boolean;
  noScroll?: boolean;
}) {
  const { session, error } = useUser();
  const { height } = useWindowDimensions();
  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const isHome = pathname === "/settings";
  const theme = useColorTheme();

  const handleBack = () => {
    if (router.canGoBack()) return router.back();
    router.replace(isHome || breakpoints.md ? "/" : "/settings");
  };

  useHotkeys("esc", handleBack, {
    enabled: breakpoints.md,
    ignoreEventWhen: () =>
      document.querySelectorAll('[aria-modal="true"]').length > 0,
  });

  const ScrollComponent = (props) =>
    noScroll ? (
      <View
        {...props}
        style={{
          flex: 1,
          height,
          paddingHorizontal: hideBack ? 0 : 20,
        }}
      />
    ) : (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: hideBack ? 0 : 50,
          paddingTop: breakpoints.md ? 50 : 20,
          paddingHorizontal: hideBack ? 0 : 20,
        }}
        {...props}
      />
    );

  return session ? (
    <View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: theme[2],
        },
        Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
      ]}
    >
      {!breakpoints.md && !hideBack && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            margin: 20,
            marginTop: insets.top + 20,
            zIndex: 99,
            justifyContent: "space-between",
          }}
        >
          <IconButton
            variant="outlined"
            onPress={handleBack}
            size={55}
            icon="arrow_back_ios_new"
          />
        </View>
      )}
      <View
        style={{
          maxHeight: height,
          flexDirection: "row",
          maxWidth: 900,
          width: "100%",
          marginHorizontal: "auto",
          gap: 40,
          flex: 1,
        }}
      >
        {(isHome || breakpoints.md || !children) && (
          <View style={{ width: breakpoints.md ? 200 : "100%" }}>
            <SettingsSidebar />
          </View>
        )}
        <ScrollComponent>{children}</ScrollComponent>
      </View>
      {breakpoints.md && (
        <View
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            margin: 50,
            marginRight: 100,
            gap: 5,
            alignItems: "center",
          }}
        >
          <IconButton
            icon="close"
            variant="filled"
            size={55}
            onPress={handleBack}
          />
          <Text variant="eyebrow">ESC</Text>
        </View>
      )}
    </View>
  ) : error ? (
    <View>
      <ErrorAlert />
    </View>
  ) : (
    <Spinner />
  );
}
