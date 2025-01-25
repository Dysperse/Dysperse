import { setBadgeCountAsync } from "expo-notifications";
import React, { createContext, useContext, useEffect, useRef } from "react";
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
    if (data?.count) setBadgeCountAsync(data.count);
  }, [data]);

  const badgingRef = useRef({
    mutate: () => mutate(),
  });

  return (
    <BadgingContext.Provider value={badgingRef}>
      {children}
    </BadgingContext.Provider>
  );
};
