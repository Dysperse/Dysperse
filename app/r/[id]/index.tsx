import Spinner from "@/ui/Spinner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function Page() {
  const { id } = useLocalSearchParams();

  useEffect(() => {
    (async () => {
      await AsyncStorage.setItem("referredBy", id as string);
      router.replace("/auth");
    })();
  }, [id]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Spinner />
    </View>
  );
}
