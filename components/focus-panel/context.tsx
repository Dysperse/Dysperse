import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalSearchParams } from "expo-router";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import FocusPanel from "./panel";

type PanelState = "OPEN" | "CLOSED" | "COLLAPSED";
interface FocusPanelContext {
  panelState: PanelState;
  setPanelState: Dispatch<SetStateAction<PanelState>>;
  collapseOnBack: React.MutableRefObject<boolean>;
}

const FocusPanelContext = createContext<FocusPanelContext>(null);
export const useFocusPanelContext = () => useContext(FocusPanelContext);

export const FocusPanelProvider = ({ children }) => {
  const states = ["OPEN", "CLOSED", "COLLAPSED"];
  const { fullscreen } = useGlobalSearchParams();
  const [panelState, setPanelState] = useState<PanelState>("CLOSED");
  const collapseOnBack = useRef(panelState === "COLLAPSED");

  useEffect(() => {
    const getPanelState = async () => {
      const t = await AsyncStorage.getItem("panelState");
      if (t && states.includes(t)) {
        setPanelState(t as PanelState);
      } else if (typeof t === "undefined") {
        setPanelState("COLLAPSED");
      } else {
        setPanelState("CLOSED");
      }
    };
    getPanelState();
  }, []);

  useEffect(() => {
    const savePanelState = async () => {
      if (Platform.OS === "web") {
        await AsyncStorage.setItem("panelState", panelState);
      }
    };
    savePanelState();
  }, [panelState]);

  const breakpoints = useResponsiveBreakpoints();
  return (
    <FocusPanelContext.Provider
      value={{
        panelState: breakpoints.md ? panelState : "OPEN",
        setPanelState,
        collapseOnBack,
      }}
    >
      {children}
      {breakpoints.md && !fullscreen && <FocusPanel />}
    </FocusPanelContext.Provider>
  );
};

