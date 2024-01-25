import Icon from "@/ui/Icon";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { widgetStyles } from "../focus-panel/widgetStyles";

function Time() {
  const [time, setTime] = useState(dayjs());
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(dayjs());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View>
      <Text
        weight={800}
        style={{
          fontSize: 40,
          textAlign: "center",
        }}
        numberOfLines={1}
      >
        {time.format("h:mm A")}
      </Text>
      <Text
        style={{
          fontSize: 20,
          marginBottom: 5,
          textAlign: "center",
          opacity: 0.7,
        }}
        numberOfLines={1}
      >
        {time.format("MMMM Do YYYY")}
      </Text>
    </View>
  );
}

type ClockViewType = "Clock" | "Stopwatch" | "Timer" | "Pomodoro";
export function Clock() {
  const theme = useColorTheme();

  const [view, setView] = useState<ClockViewType>("Clock");

  return (
    <View style={widgetStyles.widget}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <MenuPopover
          containerStyle={{ maxWidth: 160, marginLeft: 7 }}
          options={["Clock", "Stopwatch", "Timer", "Pomodoro"].map(
            (option: ClockViewType) => ({
              text: option,
              selected: view === option,
              callback: () => setView(option),
            })
          )}
          trigger={
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Text variant="eyebrow">{view}</Text>
              <Icon>expand_more</Icon>
            </Pressable>
          }
        />
      </View>
      <View
        style={[
          widgetStyles.card,
          {
            backgroundColor: theme[3],
          },
        ]}
      >
        <Time />
      </View>
    </View>
  );
}
