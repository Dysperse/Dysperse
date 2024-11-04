import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";

export default function Page() {
  const setCurrentPage = useCallback(async () => {
    const lastViewedRoute = await AsyncStorage.getItem("lastViewedRoute");
    if (lastViewedRoute)
      router.replace(lastViewedRoute === "/" ? "/home" : lastViewedRoute);
  }, []);

  useEffect(() => {
    setCurrentPage();
  }, []);
  return null;
}
