import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import useSWR from "swr";
import { LabelDetails } from "..";

export default function Page() {
  const params = useLocalSearchParams();
  const { data, error } = useSWR(["space/labels"]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/everything");
    }
  };

  return data ? (
    <LabelDetails
      mutateList={handleBack as any}
      setSelectedLabel={handleBack}
      label={data.find((i) => i.id === params.id)}
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
