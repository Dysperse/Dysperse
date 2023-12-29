import { createContext, useContext } from "react";

export const TaskDrawerContext = createContext<{
  task: any;
  updateTask: (key, value) => void;
}>(null);
export const useTaskDrawerContext = () => useContext(TaskDrawerContext);
