import { createContext, RefObject, useContext, useRef } from "react";
import { DrawerLayout } from "react-native-gesture-handler";
import useSWR, { KeyedMutator } from "swr";

interface FocusPanelContext {
  widgets: any[];
  mutate: KeyedMutator<any>;
  drawerRef: RefObject<DrawerLayout>;
  activeStateRef?: any;
}

const FocusPanelContext = createContext<FocusPanelContext>(null);
export const useFocusPanelContext = () => useContext(FocusPanelContext);

export const FocusPanelProvider = ({ children, drawerRef }) => {
  const { data, mutate } = useSWR(["user/focus-panel"]);
  const activeStateRef = useRef(0);

  return (
    <FocusPanelContext.Provider
      value={{
        widgets: Array.isArray(data) ? data : [],
        mutate,
        drawerRef,
        activeStateRef,
      }}
    >
      {children}
    </FocusPanelContext.Provider>
  );
};

