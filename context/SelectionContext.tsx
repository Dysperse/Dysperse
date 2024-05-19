import { createContext, useContext, useMemo, useState } from "react";

export const SelectionContext = createContext<any>(null);
export const useSelectionContext = () => useContext(SelectionContext);

export const SelectionContextProvider = ({ children }) => {
  const [selection, setSelection] = useState<string[]>([]);

  const value = useMemo(
    () => ({ selection, setSelection }),
    [selection, setSelection]
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
};
