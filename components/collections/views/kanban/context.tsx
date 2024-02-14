import { Dispatch, SetStateAction, createContext, useContext } from "react";

export const KanbanContext = createContext<{
  currentColumn: number;
  columnsLength: number;
  setCurrentColumn: Dispatch<SetStateAction<number>>;
}>(null);
export const useKanbanContext = () => useContext(KanbanContext);
