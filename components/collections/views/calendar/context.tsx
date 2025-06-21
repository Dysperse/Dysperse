import dayjs, { Dayjs } from "dayjs";
import { createContext, useContext } from "react";

interface CalendarContextProps {
  mode: any;
  start: Dayjs;
  end: Dayjs;
  id: string;
}

export const CalendarContext = createContext<CalendarContextProps>({
  mode: "month",
  start: dayjs().startOf("month"),
  end: dayjs().endOf("month"),
  id: "",
});

export const useCalendarContext = () => useContext(CalendarContext);

