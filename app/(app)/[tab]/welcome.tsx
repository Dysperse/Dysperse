import { CreateLabelModal } from "@/components/labels/createModal";
import Content from "@/components/layout/content";
import { createTab } from "@/components/layout/openTab";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import CreateTask from "@/components/task/create";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Divider from "@/ui/Divider";
import Icon from "@/ui/Icon";
import Logo from "@/ui/logo";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import { router } from "expo-router";
import { Linking, Platform, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { MenuButton } from "../release";

function Card({ children }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={{
        backgroundColor: theme[2],
        borderWidth: 1,
        borderColor: theme[5],
        width: "100%",
        maxWidth: 900,
        padding: 20,
        borderRadius: 20,
      }}
    >
      {children}
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
  const { desktopCollapsed } = useSidebarContext();

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
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            flex: Platform.OS === "web" ? 1 : undefined,
            gap: 20,
            paddingVertical: 100,
            padding: 25,
            maxWidth: 500,
            width: "100%",
            marginHorizontal: "auto",
          }}
          style={{ flex: 1 }}
        >
          {(!breakpoints.md || desktopCollapsed) && <MenuButton />}
          <View style={{ flexShrink: 0 }}>
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
              Well, hello there!
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
              Here's our app in a nutshell.
            </Text>
          </View>

          <Card>
            <Text
              variant="eyebrow"
              style={{ textAlign: "center", marginBottom: 10 }}
            >
              #1
            </Text>
            <Text style={{ fontSize: 25 }} weight={300}>
              Think of Dysperse as your everyday web browser, but for
              organization.
            </Text>
            <Text
              style={{
                marginTop: 5,
                fontSize: 17,
                opacity: 0.7,
              }}
            >
              Create new tabs, drag 'em around, and {"\n"}close them once you're
              done.
            </Text>
          </Card>

          <Card>
            <Text
              variant="eyebrow"
              style={{ textAlign: "center", marginBottom: 10 }}
            >
              #2
            </Text>
            <Text style={{ fontSize: 25 }} weight={300}>
              Tasks are the heart of Dysperse.
            </Text>
            <Text
              style={{
                marginTop: 5,
                fontSize: 17,
                opacity: 0.7,
              }}
            >
              They come in all shapes and sizes. In fact, let's create one now!
            </Text>

            <CreateTask defaultValues={{ date: dayjs() }} mutate={() => {}}>
              <Button
                text="Create Task"
                icon="add"
                variant="outlined"
                containerStyle={{ marginTop: 10 }}
              />
            </CreateTask>
          </Card>

          <Card>
            <Text
              variant="eyebrow"
              style={{ textAlign: "center", marginBottom: 10 }}
            >
              #3
            </Text>
            <Text style={{ fontSize: 25 }} weight={300}>
              Where did my tasks go?
            </Text>
            <Text
              style={{
                marginTop: 5,
                fontSize: 17,
                opacity: 0.7,
              }}
            >
              By default, tasks will appear in any of the "All tasks"
              collection. This is a special collection that shows all tasks,
              regardless of their label or collection.
            </Text>

            <Button
              onPress={handleCreateTab}
              text="Take me there!"
              iconPosition="end"
              icon="north_east"
              variant="outlined"
              containerStyle={{ marginTop: 10 }}
            />
          </Card>

          <Card>
            <Text
              variant="eyebrow"
              style={{ textAlign: "center", marginBottom: 10 }}
            >
              #4
            </Text>
            <Text style={{ fontSize: 25 }} weight={300}>
              What is a label?
            </Text>
            <Text
              style={{
                marginTop: 5,
                fontSize: 17,
                opacity: 0.7,
              }}
            >
              Labels are a way to identify and separate your tasks. We recommend
              them to be one or two words long.
            </Text>

            <CreateLabelModal
              onCreate={() => {
                Toast.show({ type: "success", text1: "Label created!" });
              }}
              mutate={() => {}}
            >
              <Button
                text="Create a label"
                iconPosition="end"
                icon="add"
                variant="outlined"
                containerStyle={{ marginTop: 10 }}
              />
            </CreateLabelModal>
          </Card>

          <Card>
            <Text
              variant="eyebrow"
              style={{ textAlign: "center", marginBottom: 10 }}
            >
              #5
            </Text>
            <Text style={{ fontSize: 25 }} weight={300}>
              Let's do something with those labels
            </Text>
            <Text
              style={{
                marginTop: 5,
                fontSize: 17,
                opacity: 0.7,
              }}
            >
              Collections are a way to group labels together and view as you'd
              like in a tab. Labels can even be part of multiple collections.
              Sweet!
            </Text>

            <Button
              onPress={() => router.push("/collections/create")}
              text="Create a collection"
              iconPosition="end"
              icon="add"
              variant="outlined"
              containerStyle={{ marginTop: 10 }}
            />
          </Card>

          <View style={{ paddingVertical: 30, gap: 30 }}>
            <Divider />
            <Text
              style={{ textAlign: "center", fontSize: 20, opacity: 0.5 }}
              weight={500}
            >
              Now that you've got the basics down, feel free to play around and
              see what works for you!
            </Text>
            <Footer />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Content>
  );
}

