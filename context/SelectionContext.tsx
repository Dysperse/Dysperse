import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

interface SelectionContextType {
  selection: string[];
  setSelection: Dispatch<SetStateAction<string[]>>;
  reorderMode: boolean;
  setReorderMode: Dispatch<SetStateAction<boolean>>;
}

export const SelectionContext = createContext<SelectionContextType>(null);
export const useSelectionContext = () => useContext(SelectionContext);

export const SelectionContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [reorderMode, setReorderMode] = useState<boolean>(false);
  const [selection, setSelection] = useState<string[]>([]);

  const value = useMemo(
    () => ({ selection, setSelection, reorderMode, setReorderMode }),
    [selection, setSelection, reorderMode, setReorderMode]
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
};

