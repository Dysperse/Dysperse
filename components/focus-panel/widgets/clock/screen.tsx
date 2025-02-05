import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import { useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Navbar } from "../../panel";

export default function ClockScreen() {
  const { params } = useRoute();
  const theme = useColor("orange");
  const [time, setTime] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ColorThemeProvider theme={theme}>
      <View style={{ backgroundColor: theme[2], flex: 1 }}>
        <Navbar
          bgcolors={undefined}
          title="Clock"
          widgetId={params.id}
          options={[
            { text: "Pomodoro", icon: "psychiatry" },
            { text: "Timer", icon: "timer" },
            { text: "Stopwatch", icon: "avg_pace" },
            { divider: true, key: "" },
          ]}
        />
        <Text
          style={{
            marginTop: 40,
            fontSize: 50,
            lineHeight: 50,
            color: theme[11],
            textAlign: "center",
            fontFamily: "serifText700",
          }}
        >
          {time.format("h:mm A")}
        </Text>
        <Text
          style={{
            marginTop: 5,
            fontSize: 25,
            color: theme[11],
            textAlign: "center",
          }}
          weight={300}
        >
          {time.format("MMM Do, YYYY")}
        </Text>
      </View>
    </ColorThemeProvider>
  );
}
