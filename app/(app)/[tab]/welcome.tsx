import { useFocusPanelContext } from "@/components/focus-panel/context";
import { CreateLabelModal } from "@/components/labels/createModal";
import ContentWrapper from "@/components/layout/content";
import { createTab } from "@/components/layout/openTab";
import CreateTask from "@/components/task/create";
import { useUser } from "@/context/useUser";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import * as shapes from "@/ui/shapes";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import useSWR, { mutate } from "swr";

function Header() {
  const theme = useColorTheme();

  return (
    <LinearGradient
      colors={[theme[1], theme[3]]}
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 70,
        marginBottom: 20,
      }}
    >
      <Logo size={100} />
      <Text
        style={{
          fontSize: 50,
          color: theme[11],
        }}
        weight={900}
      >
        welcome to #dysperse
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  featureColumn: {
    flex: 1,
    flexBasis: 0,
    borderWidth: 1,
    borderRadius: 25,
    padding: 20,
    gap: 20,
    flexDirection: "row",
  },
  featureTitle: {
    fontSize: 23,
    fontFamily: "body_900",
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 17,
    opacity: 0.7,
    marginBottom: 10,
    fontFamily: "body_300",
  },
  featureRow: {
    flexDirection: "row",
    paddingHorizontal: 25,
    marginHorizontal: "auto",
    flexWrap: "wrap",
    marginBottom: 25,
    width: "100%",
    gap: 25,
  },
  container: {
    marginHorizontal: "auto",
    width: "100%",
    maxWidth: 1200,
  },
  exploreCard: {
    gap: 25,
    padding: 20,
    flex: 1,
    borderRadius: 25,
    flexBasis: 0,
    borderWidth: 1,
    flexDirection: "row",
  },
  exploreTitle: {
    fontSize: 20,
    fontFamily: "body_900",
  },
  exploreDescription: {
    opacity: 0.7,
  },
});

function ShapeContainer({ text, index = 1 }) {
  const theme = useColorTheme();
  const Shape = shapes[`shape${index}`];

  return (
    <View style={{ position: "relative", width: 100, height: 100 }}>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <Shape color={theme[5]} size={100} />
      </View>
      <View
        style={{
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme[11], fontSize: 20 }} weight={900}>
          {text}
        </Text>
      </View>
    </View>
  );
}

function CreateTab() {
  const { sessionToken } = useUser();
  const [loading, setLoading] = useState(false);
  const handleNext = async () => {
    try {
      setLoading(true);
      await createTab(sessionToken, {
        slug: "/[tab]/collections/[id]/[type]",
        icon: "transition_slide",
        params: { type: "planner", id: "all" },
      });
      await mutate(() => true);
    } catch (e) {
      Toast.show({ type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      isLoading={loading}
      variant="filled"
      style={{ marginTop: "auto" }}
      onPress={handleNext}
    >
      <Icon>add</Icon>
      <ButtonText>Open my planner</ButtonText>
    </Button>
  );
}

function CreateLabel() {
  const { data, mutate } = useSWR(["space/labels"]);
  const green = useColor("green");

  return (
    <CreateLabelModal
      mutate={() => {
        mutate();
      }}
    >
      <Button
        variant="filled"
        style={{
          marginTop: "auto",
          ...(data?.length > 0 && { backgroundColor: green[5] }),
        }}
      >
        <Icon
          style={{
            ...(data?.length > 0 && { color: green[11] }),
          }}
        >
          {data?.length > 0 ? "check" : "new_label"}
        </Icon>
        <ButtonText
          style={{
            ...(data?.length > 0 && { color: green[11] }),
          }}
        >
          Create a label
        </ButtonText>
      </Button>
    </CreateLabelModal>
  );
}

function CreateCollection() {
  const { data } = useSWR(["space/collections"]);
  const green = useColor("green");

  return (
    <Button
      onPress={() => router.push("/collections/create")}
      variant="filled"
      style={{
        marginTop: "auto",
        ...(data?.length > 0 && { backgroundColor: green[5] }),
      }}
    >
      <Icon
        style={{
          ...(data?.length > 0 && { color: green[11] }),
        }}
      >
        {data?.length > 0 ? "check" : "playlist_add_circle"}
      </Icon>
      <ButtonText
        style={{
          ...(data?.length > 0 && { color: green[11] }),
        }}
      >
        Create a collection
      </ButtonText>
    </Button>
  );
}

function FeatureList() {
  const theme = useColorTheme();

  return (
    <View style={[styles.container, { marginVertical: 20 }]}>
      <Text variant="eyebrow" style={{ textAlign: "center", marginBottom: 20 }}>
        Here's the gist of how it works...
      </Text>

      <View style={styles.featureRow}>
        <View style={[styles.featureColumn, { borderColor: theme[5] }]}>
          <ShapeContainer text="one" index={1} />
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>Create a task</Text>
            <Text style={styles.featureDescription}>
              It's easy. Just click on the button below and write down what's on
              your mind.
            </Text>
            <CreateTask mutate={() => mutate(() => true)}>
              <Button variant="filled" style={{ marginTop: "auto" }}>
                <Icon>note_stack_add</Icon>
                <ButtonText>Create a task</ButtonText>
              </Button>
            </CreateTask>
          </View>
        </View>
        <View style={[styles.featureColumn, { borderColor: theme[5] }]}>
          <ShapeContainer text="two" index={2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>Tasks can be labeled</Text>
            <Text style={styles.featureDescription}>
              Labels help you categorize and separate tasks which matter to you.
              Assign them to tasks later.
            </Text>
            <CreateLabel />
          </View>
        </View>
      </View>
      <View style={styles.featureRow}>
        <View style={[styles.featureColumn, { borderColor: theme[5] }]}>
          <ShapeContainer text="three" index={6} />
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>
              Labels are a part of collections
            </Text>
            <Text style={styles.featureDescription}>
              You can have multiple collections per label
            </Text>
            <CreateCollection />
          </View>
        </View>
        <View style={[styles.featureColumn, { borderColor: theme[5] }]}>
          <ShapeContainer text="four" index={5} />
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>Open a tab</Text>
            <Text style={styles.featureDescription}>
              View your tasks in different ways by opening new tabs. We suggest
              starting off with the planner view.
            </Text>
            <CreateTab />
          </View>
        </View>
      </View>
    </View>
  );
}

function Explore() {
  const theme = useColorTheme();

  return (
    <View style={styles.container}>
      <Text variant="eyebrow" style={{ textAlign: "center" }}>
        Find us online!
      </Text>
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          gap: 25,
          marginVertical: 25,
          marginTop: 10,
          paddingHorizontal: 25,
        }}
      >
        {[
          {
            title: "Follow us on Instagram",
            description:
              "Recieve useful (and aesthetic) productivity updates in your feed",
            href: "https://instagram.com/dysperse",
          },
          {
            title: "Explore the Dysverse",
            description:
              "Coming soon. Discover collection templates created by others",
          },
          {
            title: "Check out our blog",
            description:
              "Read articles about productivity tips and how to use our platform",
            href: "https://blog.dysperse.com",
          },
        ].map((card) => (
          <Pressable
            style={({ pressed, hovered }) => [
              styles.exploreCard,
              {
                borderColor: theme[pressed ? 8 : hovered ? 7 : 6],
                backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
              },
            ]}
            onPress={() => {
              if (card.href) {
                Linking.openURL(card.href);
              }
            }}
            key={card.title}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.exploreTitle}>{card.title}</Text>
              <Text style={styles.exploreDescription}>{card.description}</Text>
            </View>
            <Icon>north_east</Icon>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function NotSureWhereToStart() {
  const theme = useColorTheme();
  const { isFocused, setFocus } = useFocusPanelContext();
  const toggleFocus = () => setFocus(!isFocused);

  return (
    <View style={(styles.container, { marginBottom: 20 })}>
      <Text variant="eyebrow" style={{ textAlign: "center", marginBottom: 10 }}>
        Not sure where to start?
      </Text>
      <View style={{ flexDirection: "row", paddingHorizontal: 25, gap: 25 }}>
        {[
          {
            title: "Change the theme color",
            icon: "palette",
            onPress: () => router.push("/settings/customization/appearance"),
          },
          {
            title: "Customize my Dysperse profile",
            icon: "account_circle",
            onPress: () => router.push("/settings/customization/profile"),
          },
          {
            title: "Connect my apps to Dysperse",
            icon: "interests",
            onPress: () => router.push("/settings/account/integrations"),
          },
          {
            title: "Toggle the focus panel",
            icon: "dock_to_left",
            onPress: toggleFocus,
          },
        ].map((card) => (
          <Pressable
            key={card.title}
            onPress={card.onPress}
            style={({ pressed, hovered }) => [
              styles.exploreCard,
              {
                alignItems: "center",
                borderColor: theme[pressed ? 8 : hovered ? 7 : 6],
                backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
              },
            ]}
          >
            <Icon>{card.icon}</Icon>
            <Text style={{ color: theme[11], fontSize: 17 }} weight={900}>
              {card.title}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function Page() {
  return (
    <ContentWrapper>
      <ScrollView>
        <Header />
        <FeatureList />
        <NotSureWhereToStart />
        <Explore />
      </ScrollView>
    </ContentWrapper>
  );
}
