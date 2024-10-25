import { createContext, useContext, useMemo } from "react";
import useSWR from "swr";
import { useUser } from "./useUser";

export const StorageContext = createContext<any>(null);
export const useStorageContext = () => useContext(StorageContext);

export const StorageContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { session } = useUser();
  const { data, error } = useSWR([
    "space",
    { spaceId: session?.space?.space?.id },
  ]);

  const value = useMemo(
    () => ({
      error,
      storage: data?.storage,
      isLoading: !data,
      isReached: !data || data?.storage?.used >= data?.storage?.limit,
      // isReached: true,
      isWarning: !data || data?.storage?.used >= data?.storage?.limit * 0.9,
    }),
    [data, error]
  );

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  );
};
