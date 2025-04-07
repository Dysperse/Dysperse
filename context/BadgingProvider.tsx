import { setBadgeCountAsync } from "expo-notifications";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { Platform } from "react-native";
import useSWR from "swr";

const BadgingContext = createContext(null);
export const useBadgingService = () => useContext(BadgingContext);

export const BadgingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data, mutate } = useSWR(["user/notifications/badge"]);

  const setBadge = async (count: number) => {
    if (Platform.OS === "web" && "setAppBadge" in navigator) {
      if (count > 0) navigator.setAppBadge(count);
      else navigator.clearAppBadge();
    } else if (Platform.OS !== "web") {
      setBadgeCountAsync(count);
    }
  };

  useEffect(() => {
    if (typeof data?.count == "number") {
      setBadge(data.count);
    }

    // Refresh badge every 5 mins
    const interval = setInterval(() => {
      mutate();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [data, mutate]);

  const badgingRef = useRef({
    mutate: () =>
      mutate().then((t) => {
        badgingRef.current.data = t;
        if (t?.count) setBadge(t.count);
        return t;
      }),
    data: data,
  });

  return (
    <BadgingContext.Provider value={badgingRef}>
      {children}
    </BadgingContext.Provider>
  );
};

