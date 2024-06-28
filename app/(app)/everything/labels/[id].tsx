import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar, View } from "react-native";
import useSWR from "swr";
import { LabelDetails } from "..";

export default function Page() {
  const params = useLocalSearchParams();
  const theme = useColorTheme();
  const { data, mutate, error } = useSWR(["space/labels"]);

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/everything");
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      {data ? (
        <LabelDetails
          mutateList={
            ((...d) => {
              setTimeout(() => mutate(...d), 0);
            }) as any
          }
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
      )}
    </>
  );
}
