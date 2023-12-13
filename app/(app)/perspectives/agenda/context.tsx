import dayjs from "dayjs";
import { createContext, useContext } from "react";

export const AgendaContext = createContext({
  type: "week",
  start: dayjs().utc().startOf("week"),
  end: dayjs().utc().endOf("week"),
});

export const useAgendaContext = () => useContext(AgendaContext);
