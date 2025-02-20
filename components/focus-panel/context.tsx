import { createContext, RefObject, useContext } from "react";
import { DrawerLayout } from "react-native-gesture-handler";
import useSWR from "swr";
import { KeyedMutator } from "swr/dist/_internal";

interface FocusPanelContext {
  widgets: any[];
  mutate: KeyedMutator<any>;
  drawerRef: RefObject<DrawerLayout>;
  focusPanelFreezerRef: RefObject<any>;
}

const FocusPanelContext = createContext<FocusPanelContext>(null);
export const useFocusPanelContext = () => useContext(FocusPanelContext);

export const FocusPanelProvider = ({
  children,
  drawerRef,
  focusPanelFreezerRef,
}) => {
  const { data, mutate } = useSWR(["user/focus-panel"]);
  // const breakpoints = useResponsiveBreakpoints();

  return (
    <FocusPanelContext.Provider
      value={{
        widgets: Array.isArray(data) ? data : [],
        mutate,
        drawerRef,
        focusPanelFreezerRef,
      }}
    >
      {children}
    </FocusPanelContext.Provider>
  );
};

