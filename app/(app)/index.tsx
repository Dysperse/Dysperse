import Content from "@/components/layout/content";
import Spinner from "@/ui/Spinner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";

export default function Page() {
  const [hasSet, setHasSet] = useState(false);

  const setCurrentPage = useCallback(async () => {
    setHasSet(true);
    const lastViewedRoute = await AsyncStorage.getItem("lastViewedRoute");
    router.replace(
      lastViewedRoute
        ? lastViewedRoute === "/"
          ? "/home"
          : lastViewedRoute
        : "/home"
    );
  }, []);

  useEffect(() => {
    if (!hasSet) setCurrentPage();
    else router.replace("/home");
  }, [hasSet, setCurrentPage]);

  return (
    <Content
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Spinner />
    </Content>
  );
}

