import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
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
  const t = Platform.OS === "web" ? localStorage.getItem("panelState") : null;

  const { fullscreen } = useGlobalSearchParams();

  const [panelState, setPanelState] = useState(
    Platform.OS === "web"
      ? t && states.includes(t)
        ? (t as PanelState)
        : "COLLAPSED"
      : "COLLAPSED"
  );
  const collapseOnBack = useRef(panelState === "COLLAPSED");

  useEffect(() => {
    if (Platform.OS === "web") {
      localStorage.setItem("panelState", panelState);
    }
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

