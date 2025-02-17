import {
  createContext,
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
} from "react";
import { DrawerLayout } from "react-native-gesture-handler";

interface FocusPanelContext {
  activeWidget: string | null;
  setActiveWidget: Dispatch<SetStateAction<string | null>>;
  drawerRef: RefObject<DrawerLayout>;
}

const FocusPanelContext = createContext<FocusPanelContext>(null);
export const useFocusPanelContext = () => useContext(FocusPanelContext);

export const FocusPanelProvider = ({
  children,
  activeWidget,
  setActiveWidget,
  drawerRef,
}) => {
  // const breakpoints = useResponsiveBreakpoints();

  return (
    <FocusPanelContext.Provider
      value={{
        activeWidget,
        setActiveWidget,
        drawerRef,
      }}
    >
      {children}
    </FocusPanelContext.Provider>
  );
};

