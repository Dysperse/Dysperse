import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

export default function Page() {
  const { id } = useLocalSearchParams();
  useEffect(() => {
    AsyncStorage.setItem("referredBy", id as string);
  }, [id]);

  return <Redirect href={`/auth`} />;
}
