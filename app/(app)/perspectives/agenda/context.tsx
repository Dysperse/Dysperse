import dayjs from "dayjs";
import { createContext, useContext } from "react";

export const AgendaContext = createContext({
  type: "week",
  start: dayjs().startOf("week"),
  end: dayjs().endOf("week"),
});

export const useAgendaContext = () => useContext(AgendaContext);
