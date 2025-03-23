import Content from "@/components/layout/content";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, DButtonProps } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Logo from "@/ui/logo";
import Text from "@/ui/Text";
import { router } from "expo-router";
import { StyleProp, View, ViewStyle } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MenuButton } from "../../home";

function Card({
  children,
  style,
  buttonProps,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  buttonProps?: DButtonProps;
}) {
  const theme = useColorTheme();

  return (
    <Button
      height="auto"
      containerStyle={[style, { borderRadius: 20 }]}
      style={[
        {
          backgroundColor: theme[3],
          borderRadius: 30,
          position: "relative",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 0,
          paddingVertical: 20,
          paddingHorizontal: 20,
        },
        style,
      ]}
      {...buttonProps}
    >
      {children}
    </Button>
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

export default function Page() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();
  const { session } = useUser();

  // const { sessionToken } = useUser();
  // const handleCreateTab = () => {
  //   createTab(sessionToken, {
  //     slug: "/[tab]/collections/[id]/[type]",
  //     icon: "transition_slide",
  //     params: { type: "planner", id: "all" },
  //   });
  // };

  const name = session.user?.profile?.name?.split(" ")[0];

  return (
    <Content noPaddingTop>
      <MenuButton addInsets gradient />
      <ScrollView style={{ flex: 1 }}>
        <View
          style={{ flexShrink: 0, paddingVertical: 50, marginTop: insets.top }}
        >
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
            Hey there, {name}
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
            Here's Dysperse in a nutshell...
          </Text>
        </View>

        <View
          style={{
            maxWidth: 800,
            width: "100%",
            marginHorizontal: "auto",
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Card
              style={{ flex: 1 }}
              buttonProps={{
                onPress: () => router.push(`/[tab]/welcome/task`),
              }}
            >
              <Text variant="eyebrow">one</Text>
              <Text
                weight={900}
                style={{
                  fontSize: 30,
                  lineHeight: 36,
                  marginTop: 10,
                  color: theme[11],
                }}
              >
                It all starts with{"\n"}a task
              </Text>

              <PlusButton />
            </Card>
            <Card
              style={{ flex: 1 }}
              buttonProps={{
                onPress: () => router.push(`/[tab]/welcome/labels`),
              }}
            >
              <Text variant="eyebrow">two</Text>
              <Text
                weight={900}
                style={{
                  fontSize: 30,
                  lineHeight: 36,
                  marginTop: 10,
                  color: theme[11],
                }}
              >
                Group tasks into labels
              </Text>

              <PlusButton />
            </Card>
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
            <Card
              style={{ flex: 1 }}
              buttonProps={{
                onPress: () => router.push(`/[tab]/welcome/collections`),
              }}
            >
              <Text variant="eyebrow">three</Text>
              <Text
                weight={900}
                style={{ fontSize: 30, lineHeight: 43, color: theme[11] }}
              >
                Sort labels into collections
              </Text>
              <PlusButton />
            </Card>
            <Card
              style={{ flex: 1.5 }}
              buttonProps={{
                onPress: () => router.push(`/[tab]/welcome/views`),
              }}
            >
              <Text variant="eyebrow">four</Text>
              <Text
                weight={900}
                style={{ fontSize: 30, lineHeight: 43, color: theme[11] }}
              >
                Open collections with{"\n"}our ten gorgeous views
              </Text>

              <PlusButton />
            </Card>
          </View>

          <Card style={{ marginTop: 10 }} buttonProps={{ disabled: true }}>
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
    </Content>
  );
}

