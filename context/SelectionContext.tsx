import { createContext, useContext, useState } from "react";

export const SelectionContext = createContext<any>(null);
export const useSelectionContext = () => useContext(SelectionContext);

export const SelectionContextProvider = ({ children }) => {
  const [selection, setSelection] = useState<string[]>([]);

  return (
    <SelectionContext.Provider value={{ selection, setSelection }}>
      {children}
    </SelectionContext.Provider>
  );
};
