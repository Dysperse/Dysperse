import { createContext, useContext } from "react";

export const TaskDrawerContext = createContext<{
  task: any;
  updateTask: (payload: any, sendRequest?: boolean) => void;
  mutateList: any;
  dateRange?: string;
  isReadOnly: boolean;
}>(null);
export const useTaskDrawerContext = () => useContext(TaskDrawerContext);

