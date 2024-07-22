import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
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
  const t = localStorage.getItem("panelState");

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
      value={{ panelState, setPanelState, collapseOnBack }}
    >
      {(breakpoints.md || panelState === "CLOSED") && children}
      {(breakpoints.md || panelState !== "CLOSED") && <FocusPanel />}
    </FocusPanelContext.Provider>
  );
};
