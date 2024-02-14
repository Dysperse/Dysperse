import { Dispatch, SetStateAction, createContext, useContext } from "react";

export type GridContextSelectedColumn = number | "HOME" | "OTHER";

export const GridContext = createContext<null | {
  currentColumn: GridContextSelectedColumn;
  setCurrentColumn: Dispatch<SetStateAction<GridContextSelectedColumn>>;
}>(null);

export const useGridContext = () => useContext(GridContext);
