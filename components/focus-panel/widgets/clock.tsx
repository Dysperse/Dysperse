import { hslToHex } from "@/app/(app)";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Collapsible from "react-native-collapsible";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import timezones from "timezones-list";
import { widgetMenuStyles } from "../widgetMenuStyles";
import { widgetStyles } from "../widgetStyles";

const TimeZone = () => {
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
          height: 32,
          width: 195,
          marginTop: -10,
        }}
      >
        <Text
          weight={800}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            fontSize: 30,
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
            fontSize: 30,
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
          marginTop: 5,
          opacity: 0.7,
          color: theme[11],
        }}
        numberOfLines={1}
      >
        {time.format("dddd, MMMM D")}
      </Text>
    </>
  );
};

function Time() {
  const theme = useColor("orange");
  console.log(timezones);

  return (
    <>
      <TimeZone />
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
        </Button>
        {time !== 0 && !running && (
          <Button
            dense
            onPress={() => setTime(0)}
            style={({ pressed, hovered }) => ({
              gap: 7,
              backgroundColor: theme[pressed ? 7 : hovered ? 6 : 5],
            })}
          >
            <Icon size={20}>replay</Icon>
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
  const [restartInputKey, setRestartInputKey] = useState(0);
  const editRef = useRef<TextInput>(null);

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

  const isCompleted = time === 0;
  const hasNotStarted = (paused && time !== duration * 60) || time === 0;

  return (
    <>
      <View
        style={[
          {
            alignItems: "center",
            aspectRatio: "1/1",
            borderRadius: 99,
            width: 200,
            height: 200,
            marginHorizontal: "auto",
            marginTop: -10,
            justifyContent: "center",
          },
          isCompleted && {
            backgroundColor: theme[9],
          },
        ]}
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
          colors={[toHex(theme[isCompleted ? 10 : 11])] as any}
          trailColor={toHex(theme[isCompleted ? 12 : 5])}
          onComplete={() => {
            playSound();
          }}
        >
          {({ remainingTime }) => (
            <View style={{ position: "relative" }}>
              <Pressable
                disabled={!paused}
                style={({ hovered }) => ({
                  backgroundColor: theme[isCompleted ? 9 : hovered ? 6 : 3],
                  borderRadius: 10,
                })}
              >
                <TextField
                  inputRef={editRef}
                  onBlur={(e) => {
                    const input = e.nativeEvent.text;
                    // Match it with hh:mm format. Make sure the minutes are less than 60
                    const match = input.match(/^([0-5]?[0-9]):([0-5]?[0-9])$/);
                    if (!match || input === "00:00") {
                      setTime(remainingTime);
                      setRestartInputKey((key) => key + 1);
                      return;
                    }
                    if (
                      match &&
                      // if it isn't the same as the current time
                      Number(match[1]) * 60 + Number(match[2]) !== remainingTime
                    ) {
                      setTime(
                        Number(match[1]) * 60 + Number(match[2]) > 0
                          ? Number(match[1]) * 60 + Number(match[2])
                          : 1
                      );
                      setDuration(Number(match[1]) + Number(match[2]) / 60);
                      setPaused(false);

                      Toast.show({
                        type: "success",
                        text1: "Timer set successfully!",
                      });
                    }
                  }}
                  key={remainingTime + restartInputKey + restartKey}
                  defaultValue={
                    Math.floor(remainingTime / 60)
                      .toString()
                      .padStart(2, "0") +
                    ":" +
                    (remainingTime % 60).toString().padStart(2, "0")
                  }
                  editable={paused}
                  style={[
                    {
                      color: theme[isCompleted ? 12 : 11],
                      fontSize: 40,
                      fontFamily: "mono",
                      textAlign: "center",
                      width: 130,
                      borderRadius: 10,
                    },
                    !paused && {
                      pointerEvents: "none",
                    },
                  ]}
                />
              </Pressable>
            </View>
          )}
        </CountdownCircleTimer>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 10,
          marginTop: 10,
          marginBottom: 10,
        }}
      >
        {hasNotStarted && (
          <Button
            dense
            onPress={() => {
              stopSound();
              setPaused(true);
              setDuration(duration);
              setRestartKey((key) => key + 1);
              setTime(duration);
            }}
            style={({ pressed, hovered }) => ({
              backgroundColor: theme[pressed ? 7 : hovered ? 6 : 5],
            })}
          >
            <Icon size={18}>replay</Icon>
          </Button>
        )}
        {time !== 0 && (
          <Button
            dense
            onPress={() => setPaused(!paused)}
            style={({ pressed, hovered }) => ({
              backgroundColor: theme[pressed ? 7 : hovered ? 6 : 5],
            })}
          >
            <Icon size={29}>{paused ? "play_arrow" : "pause"}</Icon>
          </Button>
        )}
        {(time === duration * 60 || paused) && time !== 0 && (
          <Button
            dense
            onPress={() => editRef?.current?.focus()}
            style={({ pressed, hovered }) => ({
              backgroundColor: theme[pressed ? 7 : hovered ? 6 : 5],
            })}
          >
            <Icon size={22}>edit</Icon>
          </Button>
        )}
      </View>
      <Collapsible collapsed={time !== duration * 60}>
        <ScrollView
          horizontal
          contentContainerStyle={{
            gap: 10,
            paddingHorizontal: 20,
          }}
          showsHorizontalScrollIndicator={false}
        >
          {[
            { m: 1 },
            { m: 3 },
            { m: 5 },
            { m: 10 },
            { m: 15 },
            { m: 20 },
            { m: 25 },
            { m: 30 },
            { m: 45 },
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
      </Collapsible>
    </>
  );
};

type ClockViewType = "Clock" | "Stopwatch" | "Timer" | "Pomodoro";

type timezone = (typeof timezones)[0];

function TimeZoneModal({ timeZoneModalRef }) {
  const [query, setQuery] = useState("");
  const filtered = timezones.filter(
    (tz) =>
      tz.tzCode.toLowerCase().includes(query.toLowerCase()) ||
      tz.utc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <BottomSheet
      onClose={() => timeZoneModalRef.current?.dismiss?.()}
      sheetRef={timeZoneModalRef}
      index={0}
      snapPoints={["90%"]}
      enableContentPanningGesture={false}
    >
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <TextField
          onChangeText={setQuery}
          placeholder="Search name or type UTC offset..."
          variant="filled+outlined"
        />
      </View>
      <FlashList
        contentContainerStyle={{ padding: 20 }}
        data={filtered}
        centerContent={filtered.length === 0}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center", gap: 10 }}>
            <Emoji emoji="1F614" size={55} />
            <Text style={{ fontSize: 20 }} weight={900}>
              No timezones found
            </Text>
          </View>
        )}
        renderItem={({ item }: { item: timezone }) => (
          <ListItemButton
            onPress={() => {
              Toast.show({ type: "info", text1: "Coming soon!" });
            }}
          >
            <ListItemText
              primary={item.tzCode.split("/").slice(-1)[0].replaceAll("_", " ")}
              secondary={
                item.tzCode.split("/").slice(0, -1).join("/") + " | " + item.utc
              }
            />
          </ListItemButton>
        )}
      />
    </BottomSheet>
  );
}

export function Clock({ widget, menuActions }) {
  const theme = useColor("orange");
  const userTheme = useColorTheme();
  const [view, setView] = useState<ClockViewType>("Clock");

  const timeZoneModalRef = useRef<BottomSheetModal>(null);

  return (
    <View>
      <MenuPopover
        options={[
          ...["Clock", "Stopwatch", "Timer", "Pomodoro"].map((d) => ({
            text: d,
            callback: () => setView(d as ClockViewType),
            selected: d === view,
          })),
          { divider: true },
          ...(view === "Clock"
            ? [
                {
                  text: "Timezones",
                  icon: "explore",
                  callback: () => timeZoneModalRef.current?.present?.(),
                },
                { divider: true },
              ]
            : []),
          ...menuActions,
        ]}
        containerStyle={{ marginTop: -15 }}
        trigger={
          <Button style={widgetMenuStyles.button} dense>
            <ButtonText weight={800} style={widgetMenuStyles.text}>
              {view}
            </ButtonText>
            <Icon style={{ color: userTheme[11] }}>expand_more</Icon>
          </Button>
        }
      />
      <View
        style={[
          widgetStyles.card,
          {
            backgroundColor: theme[3],
            borderWidth: 1,
            paddingVertical: 30,
            paddingBottom: 15,
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
        {view === "Clock" && (
          <TimeZoneModal timeZoneModalRef={timeZoneModalRef} />
        )}
      </View>
    </View>
  );
}
