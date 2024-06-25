import { Button } from "@/ui/Button";
import Calendar from "@/ui/Calendar";
import { useColorTheme } from "@/ui/color/theme-provider";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import {
  router,
  useGlobalSearchParams,
  useLocalSearchParams,
} from "expo-router";

export function AgendaCalendarMenu() {
  const theme = useColorTheme();
  const { start }: any = useGlobalSearchParams();
  const { agendaView, mode } = useLocalSearchParams();

  const titleFormat = {
    week: "[Week #]W • MMM YYYY",
    month: "MMMM YYYY",
    year: "YYYY",
    schedule: "MMMM YYYY",
    "3days": "[Week #]W • MMM YYYY",
  }[((agendaView || mode) as any) || "week"];

  return (
    <MenuPopover
      containerStyle={{ width: 300, marginTop: 10 }}
      trigger={
        <Button
          backgroundColors={{
            default: theme[3],
            hovered: theme[4],
            pressed: theme[5],
          }}
          borderColors={{
            default: theme[3],
            hovered: theme[4],
            pressed: theme[5],
          }}
        >
          <Text numberOfLines={1} weight={600}>
            {dayjs(start).format(titleFormat).split("•")?.[0]}
          </Text>
          <Text numberOfLines={1} style={{ opacity: 0.6 }}>
            {dayjs(start).format(titleFormat).split("• ")?.[1]}
          </Text>
        </Button>
      }
    >
      <Calendar
        onDayPress={(day) => {
          router.setParams({
            start: dayjs(day.dateString, "YYYY-MM-DD").utc().toISOString(),
          });
        }}
        markedDates={{
          [dayjs(start).format("YYYY-MM-DD")]: {
            selected: true,
            disableTouchEvent: true,
          },
        }}
      />
    </MenuPopover>
  );
}
