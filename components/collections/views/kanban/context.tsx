import { createContext, useContext } from "react";

export const KanbanContext = createContext<{
  currentColumn: number;
  columnsLength: number;
  previousColumn: () => void;
  nextColumn: () => void;
}>(null);
export const useKanbanContext = () => useContext(KanbanContext);
