import dayjs, { Dayjs } from "dayjs";
import { createContext, useContext } from "react";
import { Mode } from "react-native-big-calendar";

interface CalendarContextProps {
  mode: Mode;
  type: "week" | "month" | "year";
  start: Dayjs;
  end: Dayjs;
  id: string;
}

export const CalendarContext = createContext<CalendarContextProps>({
  type: "week",
  start: dayjs().startOf("week"),
  end: dayjs().endOf("week"),
  id: "",
});

export const useCalendarContext = () => useContext(CalendarContext);
