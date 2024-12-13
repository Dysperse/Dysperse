import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";

export function TodayText() {
  const theme = useColorTheme();
  return (
    <Text
      numberOfLines={1}
      style={{
        color: theme[11],
        fontSize: 20,
        textAlign: "center",
        marginBottom: 25,
        marginTop: -10,
        opacity: 0.6,
      }}
      aria-valuetext="web-blur-2"
    >
      Today's {dayjs().format("MMMM Do, YYYY")}
    </Text>
  );
}

