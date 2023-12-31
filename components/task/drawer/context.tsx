import { createContext, useContext } from "react";

export const TaskDrawerContext = createContext<{
  task: any;
  updateTask: (key, value, sendRequest?: boolean) => void;
}>(null);
export const useTaskDrawerContext = () => useContext(TaskDrawerContext);
