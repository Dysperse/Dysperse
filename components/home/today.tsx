import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";

export function TodayText() {
  const theme = useColorTheme();
  return (
    <Text
      weight={500}
      numberOfLines={1}
      style={{
        color: theme[12],
        fontSize: 20,
        textAlign: "center",
        marginBottom: 25,
        marginTop: -10,
        opacity: 0.6,
      }}
    >
      Today's {dayjs().format("MMMM Do, YYYY")}
    </Text>
  );
}
