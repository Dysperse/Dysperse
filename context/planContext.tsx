import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface PlanContextType {
  slide: number;
  setSlide: Dispatch<SetStateAction<number>>;
}

const PlanContext = createContext<PlanContextType>(null);
export const usePlanContext = () => useContext(PlanContext);

export const PlanContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [slide, setSlide] = useState(0);

  return (
    <PlanContext.Provider value={{ slide, setSlide }}>
      {children}
    </PlanContext.Provider>
  );
};
