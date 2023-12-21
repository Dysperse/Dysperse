import { ContentWrapper } from "@/components/layout/content";
import Divider from "@/ui/Divider";
import Text from "@/ui/Text";
import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import useSWR from "swr";

export default function Page() {
  const params = useLocalSearchParams();
  const { data, error } = useSWR(["space/all", { type: "TASK" }]);

  return (
    <ContentWrapper>
      <ScrollView>
        <Text>{JSON.stringify(params, null, 2)}</Text>
        <Divider />
        <Text>{JSON.stringify(data, null, 2)}</Text>
      </ScrollView>
    </ContentWrapper>
  );
}
