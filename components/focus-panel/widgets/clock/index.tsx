import { useUser } from "@/context/useUser";
import { hslToHex } from "@/helpers/hslToHex";
import { Avatar } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import DropdownMenu from "@/ui/DropdownMenu";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text, { getFontName } from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Collapsible from "react-native-collapsible";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import { TextInput } from "react-native-gesture-handler";
import { toast } from "sonner-native";
import timezones from "timezones-list";
import { useFocusPanelContext } from "../../context";

const Time = () => {
  const { session } = useUser();
  const theme = useColorTheme();
  const [time, setTime] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={{
        position: "relative",
        padding: 20,
        gap: 5,
        width: "100%",
      }}
    >
      <View>
        <Text
          style={{
            fontSize: 30,
            color: theme[11],
            fontFamily: "serifText700",
          }}
        >
          {time.format(session.user.militaryTime ? "HH:mm" : "hh:mm A")}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 15,
          fontFamily: "mono",
          color: theme[11],
          opacity: 0.6,
        }}
        weight={500}
      >
        {time.format("dddd MMM Do, YYYY")}
      </Text>
    </View>
  );
};

const Stopwatch = ({ params, setParam }) => {
  const theme = useColorTheme();
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const { panelState } = useFocusPanelContext();

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
    <View style={{ flexDirection: "row", padding: 20 }}>
      <View style={{ flex: 1 }}>
        <Text
          weight={800}
          style={{
            position: panelState === "COLLAPSED" ? undefined : "absolute",
            top: 0,
            left: 0,
            fontSize: 30,
            fontFamily: "serifText700",
            color: theme[11],
          }}
          numberOfLines={panelState === "COLLAPSED" ? undefined : 1}
        >
          {new Date(time * 1000)
            .toISOString()
            .split("T")[1]
            .split(".")[0]
            .replace("00:", "")
            .replaceAll(" ", "")}
        </Text>
        <TextField
          defaultValue={params.name}
          onBlur={(e) => setParam("name", e.nativeEvent.text)}
          placeholder="Set a name..."
          style={{ marginTop: 3, opacity: 0.6 }}
        />
      </View>
      <View
        style={{
          justifyContent: "center",
          gap: 10,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {time !== 0 && !running && (
          <IconButton size={50} onPress={() => setTime(0)} icon="replay" />
        )}
        <IconButton
          size={50}
          onPress={() => setRunning(!running)}
          variant="filled"
          icon={running ? "pause" : "play_arrow"}
          iconProps={{ size: running ? 30 : 40 }}
          iconStyle={{ marginBottom: running ? 0 : -3 }}
        />
      </View>
    </View>
  );
};

const Timer = ({ params, setParam, pomodoro = false }) => {
  const theme = useColorTheme();
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
    const { sound } = await Audio.Sound.createAsync(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("@/assets/alarm.mp3")
    );
    setSound(sound);

    await sound.playAsync();
  };

  const stopSound = async () => {
    await sound?.stopAsync();
  };

  const isCompleted = time === 0;
  const hasNotStarted = (paused && time !== duration * 60) || time === 0;

  return (
    <View style={{ flexDirection: "row", width: "100%", padding: 20, gap: 20 }}>
      <View
        style={[
          {
            marginRight: "auto",
            aspectRatio: "1/1",
            borderRadius: 99,
            width: 110,
            height: 110,
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
          onUpdate={(t) => setTime(t)}
          key={`${duration}-${restartKey}`}
          rotation="counterclockwise"
          colors={[toHex(theme[isCompleted ? 10 : 11])] as any}
          trailColor={toHex(theme[isCompleted ? 12 : 5])}
          onComplete={() => {
            playSound();
          }}
          size={110}
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

                      toast.info("Timer set!");
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
                      fontSize: 24,
                      fontFamily: getFontName("jetBrainsMono", 500),
                      textAlign: "center",
                      width: 90,
                      borderRadius: 10,
                    },
                    !paused && {
                      pointerEvents: "none",
                    },
                    { backgroundColor: theme[2] },
                  ]}
                />
              </Pressable>
            </View>
          )}
        </CountdownCircleTimer>
      </View>
      <View
        style={{
          justifyContent: "center",
          gap: 10,
          flex: 1,
        }}
      >
        <TextField
          defaultValue={params.name}
          onBlur={(e) => setParam("name", e.nativeEvent.text)}
          placeholder="Set a name..."
          style={{ marginTop: 3, opacity: 0.6 }}
        />
        <View style={{ flexDirection: "row", gap: 10 }}>
          {time !== 0 && (
            <Button
              height={50}
              text={paused ? (hasNotStarted ? "Resume" : "Start") : "Pause"}
              onPress={() => setPaused(!paused)}
              icon={paused ? "play_arrow" : "pause"}
              iconSize={paused ? 35 : 29}
              style={{ gap: 2 }}
              textStyle={{ paddingRight: 5 }}
              containerStyle={{ flex: 1 }}
              variant="filled"
            />
          )}
          {hasNotStarted && (
            <IconButton
              size={50}
              onPress={() => {
                stopSound();
                setPaused(true);
                setDuration(duration);
                setRestartKey((key) => key + 1);
                setTime(duration);
              }}
              icon="replay"
              iconProps={{ size: 18 }}
              variant="filled"
            />
          )}
          {time === duration * 60 && paused && time !== 0 && (
            <IconButton
              size={50}
              onPress={() => editRef?.current?.focus()}
              icon="edit"
              iconProps={{ size: 22 }}
              variant="filled"
            />
          )}
        </View>

        <Collapsible collapsed={time !== duration * 60}>
          <View
            style={{
              flexDirection: pomodoro ? undefined : "row",
              flexWrap: pomodoro ? undefined : "wrap",
              gap: pomodoro ? undefined : 5,
            }}
          >
            {pomodoro
              ? [
                  { m: 25, text: "Focus" },
                  { m: 5, text: "Short break" },
                  { m: 15, text: "Long break" },
                ].map((time, index) => (
                  <Button
                    key={time.m}
                    onPress={() => {
                      setDuration(time.m);
                      setPaused(false);
                      setRestartKey((key) => key + 1);
                    }}
                    style={({ pressed, hovered }) => ({
                      borderColor: theme[pressed ? 7 : hovered ? 6 : 5],
                      backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 20,
                    })}
                    containerStyle={{
                      paddingBottom: index === 2 ? 0 : 5,
                    }}
                  >
                    <Text
                      style={{ textAlign: "center", color: theme[11] }}
                      weight={700}
                    >
                      {time.text}
                    </Text>
                    <Text
                      style={{
                        textAlign: "center",
                        color: theme[11],
                        opacity: 0.6,
                      }}
                    >
                      {time.m}m
                    </Text>
                  </Button>
                ))
              : [
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
                    size={38}
                    onPress={() => {
                      setDuration(time.m);
                      setPaused(false);
                      setRestartKey((key) => key + 1);
                    }}
                    variant="filled"
                    pressableStyle={{
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      aspectRatio: 1,
                    }}
                    style={{ borderRadius: 10 }}
                  >
                    <Text
                      style={{ textAlign: "center", color: theme[11] }}
                      weight={900}
                    >
                      {time.m}
                    </Text>
                    <Text
                      style={{
                        textAlign: "center",
                        color: theme[11],
                        fontSize: 12,
                        marginTop: -5,
                      }}
                    >
                      min
                    </Text>
                  </IconButton>
                ))}
          </View>
        </Collapsible>
      </View>
    </View>
  );
};

export type ClockViewType = "Clock" | "Stopwatch" | "Timer" | "Pomodoro";

type timezone = (typeof timezones)[0];

function TimeZoneModal({ timeZoneModalRef, setParam, params }) {
  const theme = useColorTheme();
  const [query, setQuery] = useState("");
  const filtered = timezones.filter(
    (tz) =>
      tz.tzCode
        .replaceAll("_", " ")
        .toLowerCase()
        .includes(query.toLowerCase()) ||
      tz.utc.toLowerCase().includes(query.toLowerCase()) ||
      tz.name.toLowerCase().includes(query.toLowerCase())
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
          placeholder="Search name or type UTC offset…"
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
              setParam(
                "timeZones",
                params.timeZones
                  ? params.timeZones.find((d) => d === item.tzCode)
                    ? params.timeZones.filter((t) => t !== item.tzCode)
                    : [...params.timeZones, item.tzCode]
                  : [item.tzCode]
              );
            }}
          >
            <ListItemText
              primary={item.tzCode.split("/").slice(-1)[0].replaceAll("_", " ")}
              secondary={
                item.tzCode.split("/").slice(0, -1).join("/") +
                " | " +
                item.utc +
                " UTC"
              }
            />
            {params.timeZones?.find((t) => t === item.tzCode) && (
              <Avatar
                iconProps={{ style: { color: theme[1] } }}
                icon="check"
                style={{ backgroundColor: theme[10] }}
              />
            )}
          </ListItemButton>
        )}
      />
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 20,
          gap: 10,
          flexDirection: "row",
        }}
      >
        {params.timeZones?.length > 0 && (
          <Button
            variant="outlined"
            onPress={() => {
              setParam("timeZones", []);
            }}
            height={60}
            containerStyle={{ width: "100%" }}
          >
            <ButtonText weight={900} style={{ fontSize: 20 }}>
              Reset
            </ButtonText>
            <Icon>refresh</Icon>
          </Button>
        )}
        <Button
          variant="filled"
          onPress={() => timeZoneModalRef.current?.dismiss?.()}
          height={60}
          containerStyle={{ width: "100%" }}
        >
          <ButtonText weight={900} style={{ fontSize: 20 }}>
            Done
          </ButtonText>
          <Icon>check</Icon>
        </Button>
      </View>
    </BottomSheet>
  );
}

export default function Clock({ widget, setParam }) {
  const theme = useColorTheme();
  const [view, setView] = useState<ClockViewType>(
    widget.params?.view || "Clock"
  );

  const timeZoneModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    setParam("view", view);
  }, [view, setParam]);

  return (
    <View>
      <DropdownMenu
        options={[
          ...["Clock", "Stopwatch", "Timer", "Pomodoro"].map((d) => ({
            text: d,
            onPress: () => setView(d as ClockViewType),
            selected: d === view,
          })),
          ...(view === "Clock"
            ? [
                {
                  text: "Timezones",
                  icon: "explore",
                  onPress: () => timeZoneModalRef.current?.present?.(),
                },
              ]
            : []),
        ]}
      >
        <Button
          dense
          textProps={{ variant: "eyebrow" }}
          text={view}
          icon="expand_more"
          iconPosition="end"
          containerStyle={{
            marginBottom: 5,
            marginLeft: -10,
            marginRight: "auto",
          }}
          iconStyle={{ opacity: 0.6 }}
        />
      </DropdownMenu>
      <Pressable
        style={[
          {
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            backgroundColor: theme[2],
            borderWidth: 1,
            borderColor: theme[5],
          },
          view === "Timer" && {
            paddingHorizontal: 0,
          },
        ]}
      >
        <ColorThemeProvider theme={theme}>
          {view === "Clock" && <Time />}
          {view === "Stopwatch" && (
            <Stopwatch setParam={setParam} params={widget.params} />
          )}
          {view === "Timer" && (
            <Timer params={widget.params} setParam={setParam} />
          )}
          {view === "Pomodoro" && (
            <Timer pomodoro params={widget.params} setParam={setParam} />
          )}
        </ColorThemeProvider>
        {view === "Clock" && (
          <TimeZoneModal
            params={widget.params}
            setParam={setParam}
            timeZoneModalRef={timeZoneModalRef}
          />
        )}
      </Pressable>
    </View>
  );
}

