import { createContext, useContext, useEffect } from "react";
import Toast from "react-native-toast-message";
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

  useEffect(() => {
    if (error)
      Toast.show({
        type: "error",
        autoHide: false,
        swipeable: false,
        text1: "Couldn't load storage information. Please try again later.",
      });
  }, [error]);

  console.log(data);

  const value = {
    storage: data?.storage,
    isLoading: !data,
    isReached: !data || data?.storage?.used >= data?.storage?.limit,
    isWarning: !data || data?.storage?.used >= data?.storage?.limit * 0.8,
  };

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  );
};
