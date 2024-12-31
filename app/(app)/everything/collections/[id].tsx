import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import useSWR from "swr";
import { CollectionDetails } from "..";

export default function Page() {
  const params = useLocalSearchParams();
  const theme = useColorTheme();
  const { data, mutate, error } = useSWR(["space/collections"]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/everything");
    }
  };

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

  return (
    <>
      <SystemBars style="light" />
      {data ? (
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
      )}
    </>
  );
}

