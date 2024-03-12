import { Button } from "@/ui/Button";
import Calendar from "@/ui/Calendar";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import { useGlobalSearchParams } from "expo-router";

export function AgendaCalendarMenu() {
  const { start }: any = useGlobalSearchParams();

  const titleFormat = {
    week: "[Week #]W • MMM YYYY",
    month: "YYYY",
    year: "YYYY",
  }["week"];

  return (
    <MenuPopover
      containerStyle={{ width: 300, marginTop: 10 }}
      trigger={
        <Button>
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
