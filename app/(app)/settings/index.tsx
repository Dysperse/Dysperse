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
import { useHotkeys } from "react-hotkeys-hook";
import {
  Platform,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

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
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  sectionItem: { borderRadius: 0, height: 60 },
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
            primary={session?.user?.profile?.name}
            secondary="View profile"
          />
        </>
      )}
    </ListItemButton>
  );
}

export default function Index() {
  const { signOut } = useSession();
  const { session, error } = useUser();
  const theme = useColorTheme();

  const spaceTheme = useColor(
    session?.space?.space?.color,
    useColorScheme() === "dark"
  );

  const { height } = useWindowDimensions();
  useHotkeys("esc", () => router.back());

  return session ? (
    <ContentWrapper>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        style={{ maxHeight: height }}
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
              primary={session?.space?.space?.name}
              secondary="View space"
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
            { name: "Personal information", icon: "person" },
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
                onPress={() =>
                  router.push(
                    `/settings/${button.name
                      .toLowerCase()
                      .replaceAll(" ", "-")}`
                  )
                }
                {...(button.callback && { onPress: button.callback })}
              >
                <Icon style={{ color: theme[11] }} size={30}>
                  {button.icon}
                </Icon>
                <ListItemText
                  primary={button.name}
                  primaryProps={{ style: { fontSize: 18, color: theme[11] } }}
                />
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
