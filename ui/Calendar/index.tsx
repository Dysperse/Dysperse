import { Calendar as Calendar_, CalendarProps } from "react-native-calendars";
import { useColorTheme } from "../color/theme-provider";
import { getFontName } from "../Text";

export default function Calendar(props: CalendarProps) {
  const theme = useColorTheme();
  return (
    <Calendar_
      {...props}
      theme={{
        backgroundColor: "transparent",
        calendarBackground: "transparent",
        dayTextColor: theme[11],
        monthTextColor: theme[11],
        selectedDayBackgroundColor: theme[11],
        arrowColor: theme[11],
        textDayFontFamily: getFontName("jost", 300),
        textMonthFontFamily: getFontName("jost", 900),
        textMonthFontSize: 20,
        textDayFontSize: 15,
        arrowHeight: 20,
        textSectionTitleColor: theme[8],
        todayBackgroundColor: theme[5],
        todayTextColor: theme[11],
        selectedDayTextColor: theme[1],
        selectedDotColor: theme[11],
        arrowStyle: {
          paddingHorizontal: 0,
        },
        weekVerticalMargin: 2,
        textDisabledColor: theme[7],
      }}
    />
  );
}
