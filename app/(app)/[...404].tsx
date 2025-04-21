import ContentWrapper from "@/components/layout/content";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Text from "@/ui/Text";
import { router } from "expo-router";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  error: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});
export default function Page() {
  return (
    <ContentWrapper style={styles.error}>
      <Emoji size={60} emoji="1F494" style={{ marginBottom: 10 }} />
      <Text style={{ fontSize: 40 }} weight={900}>
        Oh no!
      </Text>
      <Text style={{ fontSize: 20, opacity: 0.5 }} weight={500}>
        404 &bull; This page does not exist
      </Text>
      <Button
        text="Return home"
        icon="home"
        onPress={() => router.replace("/home")}
      />
    </ContentWrapper>
  );
}

