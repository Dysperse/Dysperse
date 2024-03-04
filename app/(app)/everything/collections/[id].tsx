import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import useSWR from "swr";
import { CollectionDetails } from "..";

export default function Page() {
  const params = useLocalSearchParams();
  const { data, mutate, error } = useSWR(["space/collections"]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/everything");
    }
  };

  return data ? (
    <CollectionDetails
      mutateList={(...d) => {
        mutate(...d);
        handleBack();
      }}
      setSelectedCollection={handleBack}
      collection={data.find((i) => i.id === params.id)}
    />
  ) : (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {error ? <ErrorAlert /> : <Spinner />}
    </View>
  );
}
