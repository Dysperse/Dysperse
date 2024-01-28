import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
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
              variant={pathname === button.href ? "filled" : "default"}
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
                filled={pathname === button.href}
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
          {index !== 3 && <Divider style={{ width: 170, marginTop: 10 }} />}
        </View>
      ))}
    </ScrollView>
  );
}

export function SettingsLayout({ children }) {
  const { session, error } = useUser();
  const { height } = useWindowDimensions();
  // useHotkeys("esc", () => router.back());

  return session ? (
    <>
      <View
        style={{
          maxHeight: height,
          flexDirection: "row",
          maxWidth: 900,
          width: "100%",
          marginHorizontal: "auto",
          gap: 40,
        }}
      >
        <View style={{ width: 200 }}>
          <SettingsSidebar />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            paddingVertical: 50,
            flex: 1,
          }}
        >
          {children}
        </ScrollView>
      </View>
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
          onPress={() => {
            if (router.canGoBack()) return router.back();
            router.replace("/");
          }}
        />
        <Text variant="eyebrow">ESC</Text>
      </View>
    </>
  ) : error ? (
    <View>
      <ErrorAlert />
    </View>
  ) : (
    <Spinner />
  );
}
