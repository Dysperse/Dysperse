import Content from "@/components/layout/content";
import { createTab } from "@/components/layout/openTab";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Logo from "@/ui/logo";
import Text from "@/ui/Text";
import {
  Linking,
  Platform,
  Pressable,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuButton } from "../home";

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useColorTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme[3],
          padding: 20,
          borderRadius: 20,
          position: "relative",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function PlusButton() {
  const theme = useColorTheme();
  return (
    <View
      style={{
        backgroundColor: addHslAlpha(theme[11], 0.1),
        borderRadius: 40,
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        top: 0,
        right: 0,
        margin: 15,
      }}
    >
      <Icon bold>add</Icon>
    </View>
  );
}

function Footer() {
  return (
    <View
      style={{
        width: "100%",
        gap: 25,
        marginVertical: 25,
        marginTop: 10,
        paddingHorizontal: 25,
      }}
    >
      {[
        {
          title: "Follow our Instagram",
          description:
            "Recieve useful (and aesthetic) productivity updates in your feed",
          href: "https://click.dysperse.com/VkcuwHU",
        },
        {
          title: "Explore the Dysverse",
          description: "Discover collection templates created by others",
          href: "https://dysperse.com/templates",
        },
        {
          title: "Check out our blog",
          description:
            "Read articles about productivity tips and how to use our platform",
          href: "https://blog.dysperse.com",
        },
      ].map((card) => (
        <Pressable
          onPress={() => {
            if (card.href) {
              Linking.openURL(card.href);
            }
          }}
          style={{
            flexDirection: "row",
            gap: 20,
            alignItems: "center",
            width: Platform.OS === "web" ? undefined : "100%",
          }}
          key={card.title}
        >
          <View style={{ flex: 1 }}>
            <Text weight={900}>{card.title}</Text>
            <Text>{card.description}</Text>
          </View>
          <Icon>north_east</Icon>
        </Pressable>
      ))}
    </View>
  );
}

export default function Page() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  const { sessionToken } = useUser();
  const handleCreateTab = () => {
    createTab(sessionToken, {
      slug: "/[tab]/collections/[id]/[type]",
      icon: "transition_slide",
      params: { type: "planner", id: "all" },
    });
  };

  return (
    <Content noPaddingTop>
      <MenuButton addInsets gradient />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          <View style={{ flexShrink: 0, paddingVertical: 100 }}>
            <View
              style={{ alignItems: "center", marginBottom: 15 }}
              aria-valuetext="home-logo"
            >
              <Logo size={64} />
            </View>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: "serifText800",
                color: theme[11],
                fontSize: breakpoints.md ? 45 : 30,
                textAlign: "center",
                marginBottom: 10,
              }}
              aria-valuetext="web-blur"
            >
              Welcome to Dysperse!
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: theme[11],
                fontSize: 20,
                textAlign: "center",
                marginBottom: 25,
                marginTop: -5,
                opacity: 0.6,
              }}
              aria-valuetext="web-blur-2"
            >
              Here's our app in a nutshell...
            </Text>
          </View>

          <View
            style={{
              maxWidth: 1200,
              width: "100%",
              marginHorizontal: "auto",
              paddingHorizontal: 20,
              paddingBottom: 20,
            }}
          >
            <Card>
              <Text variant="eyebrow">one</Text>
              <Text
                weight={900}
                style={{ fontSize: 30, lineHeight: 43, color: theme[11] }}
              >
                It all starts with a task
              </Text>

              <PlusButton />
            </Card>

            <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
              <Card style={{ flex: 1 }}>
                <Text variant="eyebrow">two</Text>
                <Text
                  weight={900}
                  style={{ fontSize: 30, lineHeight: 43, color: theme[11] }}
                >
                  Group related tasks into labels
                </Text>

                <PlusButton />
              </Card>
              <Card style={{ flex: 1 }}>
                <Text variant="eyebrow">three</Text>
                <Text
                  weight={900}
                  style={{ fontSize: 30, lineHeight: 43, color: theme[11] }}
                >
                  Sort labels into collections
                </Text>

                <PlusButton />
              </Card>
            </View>
            <Card>
              <Text variant="eyebrow">four</Text>
              <Text
                weight={900}
                style={{ fontSize: 30, lineHeight: 43, color: theme[11] }}
              >
                Open collections in our ten beautiful views
              </Text>

              <PlusButton />
            </Card>

            <Card style={{ marginTop: 100 }}>
              <Text
                weight={900}
                style={{ fontSize: 30, lineHeight: 43, color: theme[11] }}
              >
                Getting started
              </Text>

              {[
                { icon: "palette", name: "Pick a theme color" },
                { icon: "notifications", name: "Turn on notifications" },
                { icon: "tag", name: "Create a label" },
                { icon: "folder", name: "Create a collection" },
                { icon: "tab", name: "Open a tab" },
                { icon: "key", name: "Set up a passkey" },
                { icon: "language", name: "Add our browser extension" },
              ].map((t) => (
                <ListItemButton
                  key={t.name}
                  style={{ marginHorizontal: -15 }}
                  pressableStyle={{ paddingVertical: 0, marginTop: 5 }}
                >
                  <Icon size={35} bold>
                    circle
                  </Icon>
                  <ListItemText
                    primary={t.name}
                    primaryProps={{
                      style: { color: theme[11], fontSize: 20 },
                      weight: 700,
                    }}
                  />
                  <Icon bold>{t.icon}</Icon>
                </ListItemButton>
              ))}
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Content>
  );
}

