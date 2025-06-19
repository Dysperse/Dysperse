import dayjs, { Dayjs } from "dayjs";
import { createContext, useContext } from "react";

interface CalendarContextProps {
  mode: any;
  type: "week" | "month" | "year";
  start: Dayjs;
  end: Dayjs;
  id: string;
}

export const CalendarContext = createContext<CalendarContextProps>({
  mode: "month",
  type: "week",
  start: dayjs().startOf("week"),
  end: dayjs().endOf("week"),
  id: "",
});

export const useCalendarContext = () => useContext(CalendarContext);

