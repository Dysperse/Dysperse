import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import {
  router,
  useGlobalSearchParams,
  useLocalSearchParams,
} from "expo-router";

import { useDarkMode } from "@/ui/color";
import { Modal } from "@/ui/Modal";
import {
  Calendar,
  CalendarListRef,
  fromDateId,
  toDateId,
} from "@marceloterreiro/flash-calendar";
import { useRef } from "react";
import { View } from "react-native";

export function AgendaCalendarMenu() {
  const ref = useRef(null);
  const calendarRef = useRef<CalendarListRef>(null);

  const isDark = useDarkMode();
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { start }: any = useGlobalSearchParams();
  const { agendaView, mode } = useLocalSearchParams();

  const today = toDateId(dayjs(start).toDate());

  const titleFormat = {
    week: "[Week #]W • MMM YYYY",
    month: "MMMM YYYY",
    year: "YYYY",
    schedule: "MMMM YYYY",
    "3days": "[Week #]W • MMM YYYY",
  }[((agendaView || mode) as any) || "week"];

  return (
    <>
      <Button
        onPress={() => ref.current?.present()}
        backgroundColors={{
          default: breakpoints.md ? "transparent" : theme[3],
          hovered: breakpoints.md ? "transparent" : theme[4],
          pressed: breakpoints.md ? "transparent" : theme[5],
        }}
        borderColors={{
          default: breakpoints.md ? "transparent" : theme[3],
          hovered: breakpoints.md ? "transparent" : theme[4],
          pressed: breakpoints.md ? "transparent" : theme[5],
        }}
      >
        <Text numberOfLines={1} weight={600}>
          {dayjs(start).format(titleFormat).split("•")?.[0]}
        </Text>
        <Text numberOfLines={1} style={{ opacity: 0.6 }}>
          {dayjs(start).format(titleFormat).split("• ")?.[1]}
        </Text>
      </Button>

      <Modal animation="SCALE" ref={ref} maxWidth={300} height={500}>
        <View
          style={{
            padding: 20,
            flex: 1,
          }}
        >
          <Calendar.List
            calendarActiveDateRanges={[
              {
                startId: toDateId(dayjs(start).startOf("week").toDate()),
                endId: toDateId(dayjs(start).endOf("week").toDate()),
              },
            ]}
            calendarInitialMonthId={today}
            endFillColor={theme[3]}
            ref={calendarRef}
            calendarColorScheme={isDark ? "dark" : "light"}
            onCalendarDayPress={(day) => {
              ref.current?.forceClose({ duration: 0.0001 });
              setTimeout(() => {
                router.setParams({
                  start: dayjs(fromDateId(day).toISOString(), "YYYY-MM-DD")
                    .utc()
                    .toISOString(),
                });
              }, 100);
            }}
          />
          <Button
            variant="filled"
            height={60}
            bold
            onPress={() => {
              const pastMonth = dayjs(start).startOf("month").toDate();
              calendarRef.current?.scrollToMonth(pastMonth, true);
            }}
            icon="undo"
            text="Today"
          />
        </View>
      </Modal>
    </>
  );
}
