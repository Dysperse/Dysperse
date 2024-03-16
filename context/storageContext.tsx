import { createContext, useContext } from "react";
import useSWR from "swr";
import { useUser } from "./useUser";

export const StorageContext = createContext<any>(null);
export const useStorageContext = () => useContext(StorageContext);
export const StorageContextProvider = ({ children }) => {
  const { session } = useUser();
  const { data, error } = useSWR([
    "space",
    { spaceId: session?.space?.space?.id },
  ]);

  const value = {
    error,
    storage: data?.storage,
    isLoading: !data,
    isReached: !data || data?.storage?.used >= data?.storage?.limit,
    isWarning: !data || data?.storage?.used >= data?.storage?.limit * 0.8,
  };

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  );
};
