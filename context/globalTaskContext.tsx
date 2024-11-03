import CreateTask from "@/components/task/create";
import React, {
  createContext,
  useContext,
  useImperativeHandle,
  useRef,
} from "react";

export const GlobalTaskContext = createContext<any>(null);
export const useGlobalTaskContext = () => useContext(GlobalTaskContext);

const CreateTaskWrapper = ({ wrapperRef, modalRef }) => {
  const mutateValue = useRef(() => {});

  useImperativeHandle(wrapperRef, () => ({
    mutateValue: (t) => (mutateValue.current = t),
  }));

  return (
    <CreateTask
      mutate={(newTask) => mutateValue.current(newTask)}
      ref={modalRef}
      defaultValues={{}}
    />
  );
};

export const GlobalTaskContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const modalRef = useRef(null);
  const wrapperRef = useRef(null);

  return (
    <GlobalTaskContext.Provider
      value={{ globalTaskCreateRef: modalRef, wrapperRef }}
    >
      <CreateTaskWrapper wrapperRef={wrapperRef} modalRef={modalRef} />
      {children}
    </GlobalTaskContext.Provider>
  );
};

