import { ContentWrapper } from "@/components/layout/content";
import Text from "@/ui/Text";
import { useLocalSearchParams } from "expo-router";
import useSWR from "swr";

export default function Page() {
  const params = useLocalSearchParams();
  const { data, error } = useSWR(["space/all", { type: "TASK" }]);
  return (
    <ContentWrapper>
      <Text>{JSON.stringify(params, null, 2)}</Text>
    </ContentWrapper>
  );
}
