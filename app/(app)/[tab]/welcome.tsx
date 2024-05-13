import { CreateLabelModal } from "@/components/labels/createModal";
import ContentWrapper from "@/components/layout/content";
import CreateTask from "@/components/task/create";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import * as shapes from "@/ui/shapes";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { mutate } from "swr";

function Header() {
  const theme = useColorTheme();

  return (
    <View
      style={{
        alignItems: "center",
        height: 500,
        paddingTop: 40,
        justifyContent: "center",
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
    </View>
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
    fontFamily: "body_300",
  },
  featureRow: {
    flexDirection: "row",
    paddingHorizontal: 25,
    maxWidth: 1200,
    marginHorizontal: "auto",
    flexWrap: "wrap",
    marginBottom: 25,
    width: "100%",
    gap: 25,
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

function FeatureList() {
  const theme = useColorTheme();

  return (
    <View>
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
              your mind
            </Text>
            <CreateTask mutate={() => mutate(() => true)}>
              <Button variant="filled" style={{ marginTop: 10 }}>
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
            <CreateLabelModal mutate={() => {}}>
              <Button variant="filled" style={{ marginTop: 10 }}>
                <Icon>new_label</Icon>
                <ButtonText>Create a label</ButtonText>
              </Button>
            </CreateLabelModal>
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
              Create tabs of collections and view your tasks differently
            </Text>
            <Button
              variant="filled"
              style={{ marginTop: 10 }}
              onPress={() => router.push("/collections/create")}
            >
              <Icon>playlist_add_circle</Icon>
              <ButtonText>Create a collection</ButtonText>
            </Button>
          </View>
        </View>
        <View style={[styles.featureColumn, { borderColor: theme[5] }]}>
          <ShapeContainer text="four" index={5} />
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>Everything's synced</Text>
            <Text style={styles.featureDescription}>
              Relax, tasks can be seen from any device
            </Text>
            <Button
              variant="filled"
              style={{ marginTop: 10 }}
              onPress={() => router.push("/settings/other/apps")}
            >
              <Icon>download</Icon>
              <ButtonText>Get the apps</ButtonText>
            </Button>
          </View>
        </View>
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
      </ScrollView>
    </ContentWrapper>
  );
}
