import ContentWrapper from "@/components/layout/content";
import Text from "@/ui/Text";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";

export default function Page() {
  const { data, error } = useSWR(["user/insights"]);
  return (
    <ContentWrapper noPaddingTop>
      <ScrollView contentContainerStyle={{ padding: 30 }}>
        <Text style={{ fontSize: 40, marginBottom: 10 }} weight={900}>
          Insights
        </Text>
        <Text style={{ fontFamily: "mono" }}>
          {JSON.stringify(data, null, 2)}
        </Text>
      </ScrollView>
    </ContentWrapper>
  );
}
