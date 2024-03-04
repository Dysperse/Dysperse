import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useFocusPanelWidgetContext } from "../focus-panel/context";
import { widgetStyles } from "../focus-panel/widgetStyles";

function Time() {
  const theme = useColor("orange");
  const [time, setTime] = useState(dayjs());
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(dayjs());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ColorThemeProvider theme={theme}>
      <View
        style={{
          position: "relative",
          height: 50,
          width: 195,
          marginHorizontal: "auto",
        }}
      >
        <Text
          weight={800}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            fontSize: 40,
            textAlign: "center",
            fontFamily: "mono",
            color: theme[11],
          }}
          numberOfLines={1}
        >
          {time.format("hh:mm A")}
        </Text>
        <Text
          weight={800}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            fontSize: 40,
            textAlign: "center",
            fontFamily: "mono",
            color: theme[10],
            opacity: 0.2,
          }}
          numberOfLines={1}
        >
          00:00 AM
        </Text>
      </View>
      <Text
        style={{
          fontSize: 20,
          marginBottom: 5,
          marginTop: 2,
          textAlign: "center",
          opacity: 0.7,
          color: theme[11],
        }}
        numberOfLines={1}
      >
        {time.format("dddd, MMMM D")}
      </Text>
    </ColorThemeProvider>
  );
}

type ClockViewType = "Clock" | "Stopwatch" | "Timer" | "Pomodoro";
export function Clock() {
  const theme = useColor("orange");
  const [view, setView] = useState<ClockViewType>("Clock");
  const { setWidgets } = useFocusPanelWidgetContext();

  return (
    <View style={widgetStyles.widget}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          justifyContent: "space-between",
        }}
      >
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
        <IconButton
          icon="remove"
          size={25}
          style={{ opacity: 0.3, marginRight: 5 }}
          onPress={() =>
            setWidgets((widgets) => widgets.filter((w) => w !== "clock"))
          }
        />
      </View>
      <View
        style={[
          widgetStyles.card,
          {
            backgroundColor: theme[3],
            borderWidth: 1,
            paddingVertical: 30,
            borderColor: theme[6],
          },
        ]}
      >
        <Time />
      </View>
    </View>
  );
}
