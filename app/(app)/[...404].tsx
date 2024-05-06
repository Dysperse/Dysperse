import ContentWrapper from "@/components/layout/content";
import Emoji from "@/ui/Emoji";
import Text from "@/ui/Text";

export default function Page() {
  return (
    <ContentWrapper
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}
    >
      <Emoji size={60} emoji="1F494" style={{ marginBottom: 10 }} />
      <Text style={{ fontSize: 40 }} weight={900}>
        Oh no!
      </Text>
      <Text style={{ fontSize: 20, opacity: 0.5 }} weight={500}>
        404 | This page does not exist
      </Text>
    </ContentWrapper>
  );
}
