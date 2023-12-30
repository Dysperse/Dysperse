import { ContentWrapper } from "@/components/layout/content";
import { createTab } from "@/components/layout/sidebar";
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
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const { signOut } = useSession();
  const { session, sessionToken, error } = useUser();
  const insets = useSafeAreaInsets();
  const theme = useColorTheme();

  const spaceTheme = useColor(
    session?.space?.space?.color,
    useColorScheme() === "dark"
  );

  return session ? (
    <ContentWrapper>
      <ScrollView
        contentContainerStyle={{
          gap: 15,
          padding: 15,
          paddingTop: insets.top,
          paddingBottom: 30,
        }}
      >
        <Text heading style={{ fontSize: 45 }}>
          Settings
        </Text>
        <TextField
          style={{
            backgroundColor: theme[3],
            paddingHorizontal: 15,
            paddingVertical: 7,
            borderRadius: 15,
            marginTop: -5,
            marginBottom: 10,
          }}
          placeholder="Search..."
        />
        <ListItemButton
          variant="filled"
          onPress={() => {
            createTab(sessionToken, {
              slug: "/[tab]/users/[id]",
              params: { id: session.user.email },
            });
          }}
        >
          <Image
            source={{
              uri: session?.user?.profile?.picture,
            }}
            style={{ width: 40, height: 40, borderRadius: 99 }}
          />
          <ListItemText
            primary="Profile"
            secondary={session?.user?.profile?.name}
          />
        </ListItemButton>
        <TouchableOpacity onPress={() => router.push("/space")}>
          <ListItemButton variant="filled" disabled>
            <Avatar
              size={40}
              style={{
                backgroundColor: spaceTheme[9],
              }}
            >
              <Icon style={{ color: spaceTheme[12], lineHeight: 27 }} size={25}>
                workspaces
              </Icon>
            </Avatar>
            <ListItemText
              primary="Space"
              secondary={session?.space?.space?.name}
            />
          </ListItemButton>
        </TouchableOpacity>
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
        ].map((section, index) => (
          <View
            key={index}
            style={{
              backgroundColor: theme[3],
              borderRadius: 20,
            }}
          >
            {section.map((button) => (
              <ListItemButton
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
