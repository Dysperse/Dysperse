import { useHotkeys } from "@/helpers/useHotKeys";
import React, { createContext, memo, useContext, useMemo, useRef } from "react";

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

  const contextValue = useMemo(() => ({ stack: ref }), [ref]);

  const Children = memo(() => children);

  return (
    <ModalStackContext.Provider value={contextValue}>
      <Children />
    </ModalStackContext.Provider>
  );
};

