import { hslToHex } from "@/app/(app)";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import { ScrollView } from "react-native-gesture-handler";
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
    <>
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
    </>
  );
}

const Stopwatch = () => {
  const theme = useColor("orange");
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (running) {
      interval = setInterval(() => {
        setTime((time) => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  return (
    <>
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
          {new Date(time * 1000).toISOString().substr(11, 8)}
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
          00:00:00
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 10,
          marginTop: 5,
        }}
      >
        <Button
          dense
          onPress={() => setRunning(!running)}
          style={({ pressed, hovered }) => ({
            backgroundColor: theme[pressed ? 7 : hovered ? 6 : 5],
          })}
        >
          <Icon>{running ? "pause" : "play_arrow"}</Icon>
          <Text style={{ color: theme[11] }}>{running ? "Stop" : "Start"}</Text>
        </Button>
        {time !== 0 && (
          <Button
            dense
            onPress={() => setTime(0)}
            style={({ pressed, hovered }) => ({
              gap: 7,
              backgroundColor: theme[pressed ? 7 : hovered ? 6 : 5],
            })}
          >
            <Icon size={20}>replay</Icon>
            <Text style={{ color: theme[11] }}>Reset</Text>
          </Button>
        )}
      </View>
    </>
  );
};

const Timer = () => {
  const theme = useColor("orange");
  const [duration, setDuration] = useState(1);
  const [paused, setPaused] = useState(true);
  const [time, setTime] = useState(0);
  const [restartKey, setRestartKey] = useState(0);

  const toHex = (hsl: string): any =>
    ("#" +
      hslToHex(
        ...(hsl
          .replace("hsl", "")
          .replace("(", "")
          .replace(")", "")
          .replaceAll("%", "")
          .split(",")
          .map(Number) as [number, number, number])
      )) as `#${string}`;

  const [sound, setSound] = useState<any>(null);

  const playSound = async () => {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/alarm.mp3")
    );
    setSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
  };

  const stopSound = async () => {
    await sound?.stopAsync();
  };

  return (
    <>
      <View
        style={{
          alignItems: "center",
        }}
      >
        <CountdownCircleTimer
          isPlaying={!paused}
          duration={60 * duration}
          strokeWidth={3}
          onUpdate={(t) => {
            setTime(t);
          }}
          key={`${duration}-${restartKey}`}
          rotation="counterclockwise"
          colors={[toHex(theme[11])] as any}
          trailColor={toHex(theme[5])}
          onComplete={() => {
            playSound();
          }}
        >
          {({ remainingTime }) => (
            <Text style={{ color: theme[11], fontSize: 40 }} weight={400}>
              {Math.floor(remainingTime / 60)}:
              {(remainingTime % 60).toString().padStart(2, "0")}
            </Text>
          )}
        </CountdownCircleTimer>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 10,
          marginTop: 10,
        }}
      >
        {time !== 0 && (
          <Button dense onPress={() => setPaused(!paused)}>
            <Icon>{paused ? "play_arrow" : "pause"}</Icon>
            <ButtonText>{paused ? "Resume" : "Pause"}</ButtonText>
          </Button>
        )}
        {((paused && time !== duration * 60) || time === 0) && (
          <Button
            dense
            onPress={() => {
              stopSound();
              setPaused(true);
              setDuration(duration);
              setRestartKey((key) => key + 1);
              setTime(duration);
            }}
          >
            <Icon>replay</Icon>
            <ButtonText>Reset</ButtonText>
          </Button>
        )}
      </View>
      <ScrollView
        horizontal
        style={{ marginTop: 10 }}
        contentContainerStyle={{ gap: 10, paddingHorizontal: 30 }}
        showsHorizontalScrollIndicator={false}
      >
        {[
          { m: 5 },
          { m: 10 },
          { m: 15 },
          { m: 20 },
          { m: 25 },
          { m: 30 },
          { m: 35 },
          { m: 40 },
          { m: 45 },
          { m: 50 },
          { m: 55 },
          { m: 60 },
        ].map((time) => (
          <IconButton
            key={time.m}
            size={50}
            onPress={() => {
              setDuration(time.m);
              setPaused(false);
              setRestartKey((key) => key + 1);
            }}
            style={({ pressed, hovered }) => ({
              backgroundColor: theme[pressed ? 7 : hovered ? 6 : 5],
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 5,
            })}
          >
            <Text
              style={{ textAlign: "center", color: theme[11] }}
              weight={900}
            >
              {time.m}
            </Text>
            <Text
              style={{ textAlign: "center", color: theme[11], fontSize: 12 }}
            >
              min
            </Text>
          </IconButton>
        ))}
      </ScrollView>
    </>
  );
};

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
        {/* <IconButton
          icon="remove"
          size={25}
          style={{ opacity: 0.3, marginRight: 5 }}
          onPress={() =>
            setWidgets((widgets) => widgets.filter((w) => w !== "clock"))
          }
        /> */}
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
          view === "Timer" && {
            paddingHorizontal: 0,
          },
        ]}
      >
        <ColorThemeProvider theme={theme}>
          {view === "Clock" && <Time />}
          {view === "Stopwatch" && <Stopwatch />}
          {view === "Timer" && <Timer />}
        </ColorThemeProvider>
      </View>
    </View>
  );
}
