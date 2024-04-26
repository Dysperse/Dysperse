import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import FocusPanel from "./panel";

interface FocusPanelContext {
  isFocused: boolean;
  setFocus: (isFocused: boolean) => void;
}

const FocusPanelContext = createContext<FocusPanelContext>(null);
export const useFocusPanelContext = () => useContext(FocusPanelContext);

export const FocusPanelProvider = ({ children }) => {
  const [isFocused, setFocus] = useState(
    Platform.OS === "web"
      ? localStorage.getItem("focusPanelVisible") === "true"
      : false
  );

  useEffect(() => {
    if (Platform.OS === "web")
      localStorage.setItem("focusPanelVisible", isFocused ? "true" : "false");
  }, [isFocused]);

  const breakpoints = useResponsiveBreakpoints();

  return (
    <FocusPanelContext.Provider value={{ isFocused, setFocus }}>
      {(breakpoints.md || !isFocused) && children}
      <FocusPanel />
    </FocusPanelContext.Provider>
  );
};
