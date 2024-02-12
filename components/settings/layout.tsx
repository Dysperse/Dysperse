import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
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
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { useSidebarContext } from "../layout/sidebar/context";

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
  const pathname = usePathname();
  const theme = useColorTheme();
  const { signOut } = useSession();

  return (
    <ScrollView
      style={{ maxHeight: "100%" }}
      contentContainerStyle={{ paddingVertical: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <TextField
        variant="filled+outlined"
        style={{
          margin: 10,
          marginTop: 0,
        }}
        editable={false}
        onFocus={() => Toast.show({ type: "success", text1: "Coming soon!" })}
        placeholder="Search..."
      />
      {[
        {
          name: "Space settings",
          settings: [
            { name: "Space", icon: "communities", href: "/settings/space" },
            {
              name: "Integrations",
              icon: "interests",
              href: "/settings/space/integrations",
            },
          ],
        },
        {
          name: "Customization",
          settings: [
            {
              name: "Profile",
              icon: "person",
              href: "/settings/customization/profile",
            },
            {
              name: "Appearance",
              icon: "palette",
              href: "/settings/customization/appearance",
            },
            {
              name: "Notifications",
              icon: "notifications",
              href: "/settings/customization/notifications",
            },
          ],
        },
        {
          name: "Privacy settings",
          settings: [
            {
              name: "Login security",
              icon: "vpn_key",
              href: "/settings/privacy/login-security",
            },
            {
              name: "Devices",
              icon: "home_max",
              href: "/settings/privacy/devices",
            },
            {
              name: "Sign out",
              icon: "logout",
              callback: () => {
                if (confirm("Are you sure you want to sign out?")) signOut();
              },
            },
          ],
        },
        {
          name: "Other",
          settings: [
            { name: "Terms of Service", icon: "info" },
            { name: "Privacy Policy", icon: "info" },
            { name: "Open Source", icon: "open_in_new" },
            {
              name: "Restart app",
              icon: "refresh",
              callback: () => {
                if (Platform.OS === "web") {
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
      ].map((section, index) => (
        <View key={index} style={styles.sectionContainer}>
          <Text
            variant="eyebrow"
            style={{ fontSize: 12, marginLeft: 15, marginBottom: 5 }}
            weight={700}
          >
            {section.name}
          </Text>
          {section.settings.map((button) => (
            <ListItemButton
              variant={
                pathname === button.href ||
                (pathname.includes("integrations") &&
                  button.href?.includes("integrations"))
                  ? "filled"
                  : "default"
              }
              style={styles.sectionItem}
              key={button.name}
              onPress={() =>
                router.replace(
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
                  pathname === button.href ||
                  (pathname.includes("integrations") &&
                    button.href?.includes("integrations"))
                }
                style={{ color: theme[11] }}
              >
                {button.icon}
              </Icon>
              <ListItemText
                primary={button.name}
                primaryProps={{ style: { color: theme[11] } }}
              />
            </ListItemButton>
          ))}
          {index !== 3 && <Divider style={{ width: "90%", marginTop: 10 }} />}
        </View>
      ))}
    </ScrollView>
  );
}

export function SettingsLayout({
  children,
  hideBack,
}: {
  children?: React.ReactNode;
  hideBack?: boolean;
}) {
  const { session, error } = useUser();
  const { height } = useWindowDimensions();
  const breakpoints = useResponsiveBreakpoints();
  const { openSidebar } = useSidebarContext();
  const pathname = usePathname();
  const isHome = pathname !== "/settings";

  const handleBack = () => {
    if (router.canGoBack()) return router.back();
    router.replace("/");
  };
  useHotkeys("esc", handleBack, {
    enabled: breakpoints.md,
    ignoreEventWhen: (event) =>
      document.querySelectorAll('[aria-modal="true"]').length > 0,
  });

  return session ? (
    <>
      {!breakpoints.md && !hideBack && (
        <IconButton
          variant="outlined"
          onPress={() => {
            if (!isHome) return openSidebar();
            else router.push("/settings");
          }}
          size={55}
          icon="arrow_back_ios_new"
          style={{
            margin: 12,
            zIndex: 99,
            marginBottom: -70,
          }}
        />
      )}
      <View
        style={{
          ...(!breakpoints.md && { marginTop: hideBack ? 0 : 30 }),
          maxHeight: height,
          flexDirection: "row",
          maxWidth: 900,
          width: "100%",
          marginHorizontal: "auto",
          gap: 40,
          height: "100%",
        }}
      >
        {(!isHome || breakpoints.md) && (
          <View style={{ width: children ? 200 : "100%" }}>
            <SettingsSidebar />
          </View>
        )}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            paddingVertical: hideBack ? 0 : 50,
            paddingHorizontal: hideBack ? 0 : 20,
            flex: 1,
          }}
          contentContainerStyle={{ height: "100%" }}
        >
          {children}
        </ScrollView>
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
    </>
  ) : error ? (
    <View>
      <ErrorAlert />
    </View>
  ) : (
    <Spinner />
  );
}
