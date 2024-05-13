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
import { Pressable, StyleSheet, View } from "react-native";
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
  const { data } = useSWR(["space/labels"]);
  const green = useColor("green");

  return (
    <CreateLabelModal mutate={() => {}}>
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
        Here's the gist of how it works
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
  return (
    <View style={styles.container}>
      <Text variant="eyebrow" style={{ textAlign: "center" }}>
        Not sure where to start?
      </Text>
      <Text>Check out our blog</Text>
      <View style={{ flexDirection: "row", width: "100%" }}>
        <Pressable>
          <Text></Text>
        </Pressable>
        <Pressable>
          <Text>Explore the Dysverse</Text>
          <Text>Discover collection templates created by others</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Social() {
  return (
    <View style={styles.container}>
      <Text variant="eyebrow" style={{ textAlign: "center" }}>
        Follow us!
      </Text>
      <Button>
        <ButtonText>Instagram</ButtonText>
      </Button>
    </View>
  );
}

export default function Page() {
  return (
    <ContentWrapper>
      <ScrollView>
        <Header />
        <FeatureList />
        <Explore />
        <Social />
      </ScrollView>
    </ContentWrapper>
  );
}
