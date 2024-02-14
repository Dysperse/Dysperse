import dayjs, { Dayjs } from "dayjs";
import { createContext, useContext } from "react";

interface AgendaContextProps {
  type: "week" | "month" | "year";
  start: Dayjs;
  end: Dayjs;
  id: string;
}

export const AgendaContext = createContext<AgendaContextProps>({
  type: "week",
  start: dayjs().startOf("week"),
  end: dayjs().endOf("week"),
  id: "",
});

export const usePlannerContext = () => useContext(AgendaContext);
