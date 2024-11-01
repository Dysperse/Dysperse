import CreateTask from "@/components/task/create";
import React, { createContext, useContext, useRef, useState } from "react";
import { mutate } from "swr";

export const GlobalTaskContext = createContext<any>(null);
export const useGlobalTaskContext = () => useContext(GlobalTaskContext);

export const GlobalTaskContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const ref = useRef(null);
  const [defaultValues, setDefaultValues] = useState({});

  return (
    <GlobalTaskContext.Provider value={{ globalTaskCreateRef: ref }}>
      <CreateTask mutate={mutate} ref={ref} defaultValues={defaultValues} />
      {children}
    </GlobalTaskContext.Provider>
  );
};
