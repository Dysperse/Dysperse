import { useHotkeys } from "@/helpers/useHotKeys";
import React, { createContext, useContext, useRef } from "react";

export const ModalStackContext = createContext<any>(null);
export const useModalStack = () => useContext(ModalStackContext);

export const ModalStackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const ref = useRef([]);

  useHotkeys("Escape", () => {
    const stack = ref.current;
    if (stack.length > 0) {
      const fn = stack[stack.length - 1];
      fn();
    }
  });

  return (
    <ModalStackContext.Provider value={{ stack: ref }}>
      {children}
    </ModalStackContext.Provider>
  );
};
