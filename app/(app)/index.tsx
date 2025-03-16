import Content from "@/components/layout/content";
import Spinner from "@/ui/Spinner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";

export default function Page() {
  const [hasSet, setHasSet] = useState(false);

  const getPage = useCallback(async () => {
    const lastViewedRoute = await AsyncStorage.getItem("lastViewedRoute");
    return lastViewedRoute
      ? lastViewedRoute === "/"
        ? "/home"
        : lastViewedRoute
      : "/home";
  }, []);

  useEffect(() => {
    const fetchPage = async () => {
      if (!hasSet) {
        setHasSet(true);
        const t = await getPage();
        router.replace(t);
      }
    };
    fetchPage();
  }, [hasSet, getPage]);

  return (
    <Content
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Spinner />
    </Content>
  );
}

