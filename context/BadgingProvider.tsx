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

  useEffect(() => {
    if (data?.count) {
      if (Platform.OS === "web" && "setAppBadge" in navigator) {
        navigator.setAppBadge(data.count);
      } else if (Platform.OS !== "web") {
        setBadgeCountAsync(data.count);
      }
    }

    // Refresh badge every 20 mins
    const interval = setInterval(() => {
      mutate();
    }, 20 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [data, mutate]);

  const badgingRef = useRef({
    mutate: () => mutate(),
    data: data,
  });

  return (
    <BadgingContext.Provider value={badgingRef}>
      {children}
    </BadgingContext.Provider>
  );
};
