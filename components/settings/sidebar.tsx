import { useSession } from "@/context/AuthProvider";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Divider from "@/ui/Divider";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { TEMPORARY_CONTENT_INSET_FIX } from "@/utils/temporary-scrolling-bug-fix";
import { cacheDirectory, deleteAsync } from "expo-file-system";
import { router, usePathname } from "expo-router";
import * as Updates from "expo-updates";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Linking,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { settingStyles } from "./settingsStyles";

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

function EscapeSettings() {
  const breakpoints = useResponsiveBreakpoints();

  const handleBack = () => {
    // if (router.canGoBack()) return router.back();
    router.replace("/");
  };

  useHotkeys("esc", handleBack, {
    enabled: breakpoints.md,
    ignoreEventWhen: () =>
      document.querySelectorAll('[aria-modal="true"]').length > 0,
  });

  return (
    breakpoints.md && (
      <View style={{ marginTop: -30, marginBottom: 15 }}>
        <IconButton
          icon="west"
          size={45}
          variant="filled"
          onPress={handleBack}
        />
      </View>
    )
  );
}

export function SettingsSidebar({ forceShow }: { forceShow?: boolean }) {
  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const theme = useColorTheme();
  const { height } = useWindowDimensions();
  const { signOut } = useSession();

  const [search, setSearch] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    if (
      inputRef.current &&
      breakpoints.md &&
      Platform.OS === "web" &&
      pathname === "/settings/account"
    ) {
      inputRef.current.focus();
    }
  }, [breakpoints.md, pathname]);

  useHotkeys(["ctrl+f", "/"], (event) => {
    event.preventDefault();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

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
            "profile",
            "account",
            "user",
            "personal",
          ],
        },
        {
          name: "Tasks",
          icon: "verified",
          href: "/settings/tasks",
          keywords: [],
        },
        {
          name: "Sidekick",
          icon: "raven",
          href: "/settings/sidekick",
          keywords: ["ai", "artificial", "intelligence", "machine", "dysperse"],
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
          name: "Scan to login",
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
          name: "Get the apps",
          icon: "download",
          href: "/settings/other/apps",
        },
        {
          show: breakpoints.md,
          name: "Keybinds",
          keywords: ["keybinds", "shortcuts", "keyboard"],
          icon: "keyboard_command_key",
          href: "/settings/shortcuts",
        },
        {
          name: "Updates",
          icon: "campaign",
          href: "/release",
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
              try {
                deleteAsync(cacheDirectory + "/dysperse-cache/cache.json");
              } catch (e) {
                console.error(e);
              }
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
          name: "Terms",
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

  return !breakpoints.md && !forceShow ? null : (
    <ScrollView
      contentInset={TEMPORARY_CONTENT_INSET_FIX()}
      onScrollBeginDrag={Keyboard.dismiss}
      style={[
        {
          maxHeight: breakpoints.md
            ? "100%"
            : Platform.OS === "web"
            ? height - 85
            : undefined,
          zIndex: breakpoints.md ? 99999999999 : undefined,
          maxWidth: breakpoints.md ? 200 : undefined,
        },
        Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
      ]}
      contentContainerStyle={{
        paddingVertical: breakpoints.md ? 50 : 120,
        paddingBottom: 20 + insets.bottom,
        paddingHorizontal: 10,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          paddingHorizontal: breakpoints.md ? 10 : 20,
          marginBottom: 20,
        }}
      >
        <EscapeSettings />
        {!breakpoints.md && (
          <Text
            style={[
              settingStyles.title,
              {
                marginTop: -30,
                fontSize: 35,
                fontFamily: "serifText700",
              },
            ]}
          >
            Settings
          </Text>
        )}
        <TextField
          variant="filled+outlined"
          style={{
            paddingVertical: breakpoints.md ? 10 : 15,
            paddingHorizontal: breakpoints.md ? 15 : 20,
            marginTop: 0,
            fontSize: breakpoints.md ? 15 : 20,
            borderRadius: breakpoints.md ? 15 : 999,
          }}
          inputRef={inputRef}
          weight={700}
          onChangeText={setSearch}
          onKeyPress={(e) => {
            if (e.nativeEvent.key === "Escape") {
              setSearch("");
              e.target.blur();
            }
          }}
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
            {section.settings
              .filter((button) => button.show !== false)
              .map((button: any) => (
                <ConfirmationModal
                  disabled={!button.confirm}
                  key={button.name}
                  {...button.confirm}
                >
                  <ListItemButton
                    variant={
                      breakpoints.md &&
                      (pathname === button.href ||
                        (pathname.includes("integrations") &&
                          button.href?.includes("integrations")))
                        ? "filled"
                        : "default"
                    }
                    pressableStyle={[
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
                        breakpoints.md &&
                        (pathname === button.href ||
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

