import { createContext, useContext } from "react";
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
  const { data, error, isValidating } = useSWR([
    "space",
    { spaceId: session?.space?.space?.id },
  ]);

  const value = {
    error,
    storage: data?.storage,
    isLoading: !data,
    isValidating,
    isReached: !data || data?.storage?.used >= data?.storage?.limit,
    isWarning: !data || data?.storage?.used >= data?.storage?.limit * 0.9,
  };

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  );
};
