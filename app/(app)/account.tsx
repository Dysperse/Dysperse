import { ContentWrapper } from "@/components/layout/content";
import { createTab } from "@/components/layout/openTab";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { Avatar } from "@/ui/Avatar";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import { router } from "expo-router";
import * as Updates from "expo-updates";
import { useState } from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  contentContainer: {
    gap: 15,
    padding: 15,
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
  title: { fontSize: 50, marginTop: 30 },
  sectionContainer: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  sectionItem: { borderRadius: 0 },
});

function ProfileButton() {
  const { session, sessionToken } = useUser();
  const [loading, setLoading] = useState(false);
  return (
    <ListItemButton
      style={styles.headerButton}
      variant="filled"
      onPress={() => {
        if (loading) return;
        setLoading(true);
        createTab(sessionToken, {
          slug: "/[tab]/users/[id]",
          params: { id: session.user.email },
        });
      }}
    >
      {loading ? (
        <View
          style={{
            height: "100%",
            width: "100%",
            alignItems: "center",
            paddingTop: 13,
          }}
        >
          <Spinner />
        </View>
      ) : (
        <>
          <Image
            source={{
              uri: session?.user?.profile?.picture,
            }}
            style={{ width: 40, height: 40, borderRadius: 99 }}
          />
          <ListItemText
            truncate
            primary="Profile"
            secondary={session?.user?.profile?.name}
          />
        </>
      )}
    </ListItemButton>
  );
}

export default function Index() {
  const { signOut } = useSession();
  const { session, error } = useUser();
  const insets = useSafeAreaInsets();
  const theme = useColorTheme();

  const spaceTheme = useColor(
    session?.space?.space?.color,
    useColorScheme() === "dark"
  );

  return session ? (
    <ContentWrapper>
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          {
            marginTop: insets.top + 30,
          },
        ]}
      >
        <Text heading style={styles.title}>
          Settings
        </Text>
        <TextField
          style={[
            styles.search,
            {
              backgroundColor: theme[3],
            },
          ]}
          placeholder="Search..."
        />
        <View style={{ flexDirection: "row", gap: 15 }}>
          <ProfileButton />
          <ListItemButton
            variant="filled"
            onPress={() => router.push("/space")}
            style={styles.headerButton}
          >
            <Avatar
              size={40}
              disabled
              style={{
                backgroundColor: spaceTheme[9],
              }}
            >
              <Icon style={{ color: spaceTheme[12], lineHeight: 27 }} size={25}>
                workspaces
              </Icon>
            </Avatar>
            <ListItemText
              truncate
              primary="Space"
              secondary={session?.space?.space?.name}
            />
          </ListItemButton>
        </View>
        {[
          [
            { name: "Appearance", icon: "palette" },
            { name: "Connections", icon: "leak_add" },
            { name: "Notifications", icon: "notifications" },
          ],
          [
            { name: "Security", icon: "vpn_key" },
            { name: "Devices", icon: "home_max" },
            { name: "Sign out", icon: "logout", callback: signOut },
          ],
          [
            { name: "Terms of Service", icon: "info" },
            { name: "Privacy Policy", icon: "info" },
            { name: "Open Source", icon: "open_in_new" },
          ],
          [
            {
              name: "Clear app cache & reload",
              icon: "logout",
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
        ].map((section, index) => (
          <View
            key={index}
            style={[
              styles.sectionContainer,
              {
                borderColor: theme[3],
              },
            ]}
          >
            {section.map((button) => (
              <ListItemButton
                style={styles.sectionItem}
                key={button.name}
                {...(button.callback && { onPress: button.callback })}
              >
                <Icon>{button.icon}</Icon>
                <ListItemText primary={button.name} />
              </ListItemButton>
            ))}
          </View>
        ))}
      </ScrollView>
    </ContentWrapper>
  ) : error ? (
    <View>
      <ErrorAlert />
    </View>
  ) : (
    <Spinner />
  );
}
