import { createContext, useContext, useState } from "react";
import FocusPanel from "./panel";

interface FocusPanelContext {
  isFocused: boolean;
  setFocus: (isFocused: boolean) => void;
}

const FocusPanelContext = createContext<FocusPanelContext>(null);
export const useFocusPanelContext = () => useContext(FocusPanelContext);

export const FocusPanelProvider = ({ children }) => {
  const [isFocused, setFocus] = useState(false);

  return (
    <FocusPanelContext.Provider value={{ isFocused, setFocus }}>
      {children}
      <FocusPanel />
    </FocusPanelContext.Provider>
  );
};
