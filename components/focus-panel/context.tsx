import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
  useEffect,
} from "react";
import { Platform } from "react-native";
import { DrawerLayout } from "react-native-gesture-handler";

export type PanelState = "OPEN" | "CLOSED" | "COLLAPSED";
interface FocusPanelContext {
  panelState: PanelState;
  setPanelState: Dispatch<SetStateAction<PanelState>>;
  drawerRef: RefObject<DrawerLayout>;
}

const FocusPanelContext = createContext<FocusPanelContext>(null);
export const useFocusPanelContext = () => useContext(FocusPanelContext);

export const FocusPanelProvider = ({
  children,
  panelState,
  setPanelState,
  drawerRef,
}) => {
  const breakpoints = useResponsiveBreakpoints();
  const states = ["OPEN", "CLOSED", "COLLAPSED"];

  useEffect(() => {
    const getPanelState = async () => {
      const t = await AsyncStorage.getItem("panelState");
      if (t && states.includes(t)) {
        setPanelState(t as PanelState);
      } else if (typeof t === "undefined") {
        setPanelState("COLLAPSED");
      } else {
        setPanelState("COLLAPSED");
      }
    };
    getPanelState();
  }, []);

  useEffect(() => {
    if (breakpoints.md) {
      if (panelState !== "CLOSED") {
        drawerRef?.current?.openDrawer?.();
      } else {
        drawerRef?.current?.closeDrawer?.();
      }
    }
  }, [panelState, drawerRef]);

  useEffect(() => {
    const savePanelState = async () => {
      if (Platform.OS === "web") {
        await AsyncStorage.setItem("panelState", panelState);
      }
    };
    savePanelState();
  }, [panelState]);

  return (
    <FocusPanelContext.Provider
      value={{
        panelState,
        setPanelState,
        drawerRef,
      }}
    >
      {children}
    </FocusPanelContext.Provider>
  );
};

