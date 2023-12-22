import { ContentWrapper } from "@/components/layout/content";
import ErrorAlert from "@/ui/Error";
import Text from "@/ui/Text";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import useSWR from "swr";

export default function Page() {
  const params = useLocalSearchParams();
  const { data, error } = useSWR(
    params.email ? ["user/profile", { email: params.email }] : null
  );

  return (
    <ContentWrapper>
      {data ? (
        <View>
          <Text>{JSON.stringify(data, null, 2)}</Text>
        </View>
      ) : error ? (
        <ErrorAlert />
      ) : (
        <ActivityIndicator />
      )}
    </ContentWrapper>
  );
}
