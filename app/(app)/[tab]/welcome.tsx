import { useFocusPanelContext } from "@/components/focus-panel/context";
import { CreateLabelModal } from "@/components/labels/createModal";
import ContentWrapper from "@/components/layout/content";
import { createTab } from "@/components/layout/openTab";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import CreateTask from "@/components/task/create";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR, { mutate } from "swr";

function Header() {
  const theme = useColorTheme();
  const { sidebarRef } = useSidebarContext();
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <LinearGradient
      start={[0, 0]}
      end={[1, 1]}
      colors={[theme[5], theme[2], theme[4]]}
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 70,
        gap: 10,
        flex: 1,
        position: "relative",
      }}
    >
      {!breakpoints.md && (
        <IconButton
          size={55}
          onPress={() => sidebarRef.current.openDrawer()}
          icon="menu"
          variant="outlined"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            margin: 15,
            marginTop: insets.top + 15,
          }}
        />
      )}
      <Logo size={100} />
      <Text
        style={{
          fontSize: 50,
          lineHeight: 60,
          textAlign: "center",
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
    borderWidth: 1,
    borderRadius: 25,
    padding: 20,
    gap: 20,
    flexDirection: "row",
  },
  featureColumnDesktop: {
    flex: 1,
    flexBasis: 0,
  },
  featureTitle: {
    fontSize: 23,
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 17,
    opacity: 0.7,
    marginBottom: 10,
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
    marginTop: 20,
  },
  exploreCard: {
    gap: 25,
    padding: 20,
    borderRadius: 25,
    borderWidth: 1,
    flexDirection: "row",
  },
  exploreTitle: {
    fontSize: 20,
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
      containerStyle={{ marginTop: "auto" }}
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
        containerStyle={{ marginTop: "auto" }}
        style={data?.length > 0 && { backgroundColor: green[5] }}
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
      containerStyle={{ marginTop: "auto" }}
      style={data?.length > 0 && { backgroundColor: green[5] }}
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
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View style={[styles.container, { marginVertical: 20, marginTop: 40 }]}>
      <Text variant="eyebrow" style={{ textAlign: "center", marginBottom: 20 }}>
        Here's the gist of how it works...
      </Text>

      <View
        style={[
          styles.featureRow,
          !breakpoints.md && { flexDirection: "column" },
        ]}
      >
        <View
          style={[
            styles.featureColumn,
            breakpoints.md && styles.featureColumnDesktop,
            { borderColor: theme[5] },
          ]}
        >
          <ShapeContainer text="one" index={1} />
          <View style={{ flex: 1 }}>
            <Text weight={900} style={styles.featureTitle}>
              Create a task
            </Text>
            <Text style={styles.featureDescription} weight={300}>
              It's easy. Just click on the button below and write down what's on
              your mind.
            </Text>
            <CreateTask mutate={() => mutate(() => true)}>
              <Button variant="filled" containerStyle={{ marginTop: "auto" }}>
                <Icon>note_stack_add</Icon>
                <ButtonText>Create a task</ButtonText>
              </Button>
            </CreateTask>
          </View>
        </View>
        <View
          style={[
            styles.featureColumn,
            breakpoints.md && styles.featureColumnDesktop,
            { borderColor: theme[5] },
          ]}
        >
          <ShapeContainer text="two" index={2} />
          <View style={{ flex: 1 }}>
            <Text weight={900} style={styles.featureTitle}>
              Tasks can be labeled
            </Text>
            <Text style={styles.featureDescription} weight={300}>
              Labels help you categorize and separate tasks which matter to you.
              Assign them to tasks later.
            </Text>
            <CreateLabel />
          </View>
        </View>
      </View>
      <View
        style={[
          styles.featureRow,
          !breakpoints.md && { flexDirection: "column" },
        ]}
      >
        <View
          style={[
            styles.featureColumn,
            breakpoints.md && styles.featureColumnDesktop,
            { borderColor: theme[5] },
          ]}
        >
          <ShapeContainer text="three" index={6} />
          <View style={{ flex: 1 }}>
            <Text weight={900} style={styles.featureTitle}>
              Labels are a part of collections
            </Text>
            <Text style={styles.featureDescription} weight={300}>
              You can have multiple collections per label
            </Text>
            <CreateCollection />
          </View>
        </View>
        <View
          style={[
            styles.featureColumn,
            breakpoints.md && styles.featureColumnDesktop,
            { borderColor: theme[5] },
          ]}
        >
          <ShapeContainer text="four" index={5} />
          <View style={{ flex: 1 }}>
            <Text weight={900} style={styles.featureTitle}>
              Open a tab
            </Text>
            <Text style={styles.featureDescription} weight={300}>
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
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View style={styles.container}>
      <Text variant="eyebrow" style={{ textAlign: "center" }}>
        Find us online!
      </Text>
      <View
        style={{
          flexDirection: breakpoints.md ? "row" : "column",
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
                flex: breakpoints.md ? 1 : undefined,
                flexBasis: breakpoints.md ? 0 : undefined,
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
              <Text style={styles.exploreTitle} weight={900}>
                {card.title}
              </Text>
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
  const breakpoints = useResponsiveBreakpoints();
  const { setPanelState, panelState } = useFocusPanelContext();
  const toggleFocus = () =>
    setPanelState(panelState === "CLOSED" ? "OPEN" : "CLOSED");

  return (
    <View style={(styles.container, { marginBottom: 20 })}>
      <Text variant="eyebrow" style={{ textAlign: "center", marginBottom: 10 }}>
        Not sure where to start?
      </Text>
      <View
        style={[
          {
            flexDirection: breakpoints.md ? "row" : "column",
            paddingHorizontal: 25,
            gap: 25,
          },
          !breakpoints.md && {
            flexWrap: "wrap",
          },
        ]}
      >
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
                flex: 1,
                alignItems: "center",
                gap: 7,
                flexDirection: "column",
                borderColor: theme[pressed ? 8 : hovered ? 7 : 6],
                backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
              },
              !breakpoints.md && { minHeight: 70 },
            ]}
          >
            <Icon>{card.icon}</Icon>
            <Text
              style={{ textAlign: "center", color: theme[11], fontSize: 15 }}
              weight={900}
            >
              {card.title}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function Page() {
  const breakpoints = useResponsiveBreakpoints();
  return (
    <ContentWrapper
      noPaddingTop
      style={{ flexDirection: breakpoints.md ? "row" : "column" }}
    >
      {breakpoints.md && <Header />}
      <ScrollView style={{ flex: 2 }}>
        {!breakpoints.md && <Header />}
        <FeatureList />
        <NotSureWhereToStart />
        <Explore />
      </ScrollView>
    </ContentWrapper>
  );
}
