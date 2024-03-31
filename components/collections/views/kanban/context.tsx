import { Dispatch, SetStateAction, createContext, useContext } from "react";

export const KanbanContext = createContext<{
  currentColumn: number;
  columnsLength: number;
  setCurrentColumn: Dispatch<SetStateAction<number>>;
  hasOther: boolean;
}>(null);
export const useKanbanContext = () => useContext(KanbanContext);
