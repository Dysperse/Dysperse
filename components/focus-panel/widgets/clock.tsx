import { hslToHex } from "@/helpers/hslToHex";
import { Avatar } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text, { getFontName } from "@/ui/Text";
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
import { useFocusPanelContext } from "../context";

const TimeZone = ({
  timeZone,
  setParam,
  params,
}: {
  timeZone?: string;
  setParam?: any;
  params?: any;
}) => {
  const theme = useColor("orange");

  const [time, setTime] = useState(dayjs().tz(timeZone));
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(dayjs().tz(timeZone));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeZone]);

  return (
    <View
      style={{
        padding: timeZone ? 10 : 0,
        width: timeZone ? "33.3333%" : "100%",
      }}
    >
      <ConfirmationModal
        height={400}
        disabled={!timeZone}
        title="Remove timezone?"
        secondary="You can always add it back later"
        onSuccess={() => {
          if (!timeZone) return;
          setParam(
            "timeZones",
            params.timeZones
              ? params.timeZones.filter((t) => t !== timeZone)
              : []
          );
        }}
      >
        <Pressable
          style={({ pressed, hovered }) => ({
            width: "100%",
            aspectRatio: timeZone ? "1/1" : undefined,
            flexDirection: "row",
            alignItems: "center",
            ...(timeZone && {
              backgroundColor: theme[pressed ? 6 : hovered ? 5 : 4],
              borderRadius: 20,
            }),
          })}
          {...(timeZone && {})}
        >
          <View style={{ flex: 1 }}>
            <View
              style={
                timeZone
                  ? undefined
                  : {
                      position: "relative",
                      marginHorizontal: "auto",
                    }
              }
            >
              <Text
                weight={timeZone ? 900 : 400}
                style={{
                  marginTop: 10,
                  fontSize: 35,
                  lineHeight: 40,
                  color: theme[11],
                  textAlign: "center",
                }}
              >
                {time.format("hh:mm").split(":").join("\n")}
              </Text>
            </View>
          </View>
        </Pressable>
      </ConfirmationModal>
    </View>
  );
};

function Time({ setParam, params }) {
  return (
    <View style={{ gap: 10 }}>
      <TimeZone />
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          marginHorizontal: -10,
        }}
      >
        {params.timeZones?.map?.((timeZone) => (
          <TimeZone
            setParam={setParam}
            params={params}
            timeZone={timeZone}
            key={timeZone}
          />
        ))}
      </View>
    </View>
  );
}

const Stopwatch = ({ params, setParam }) => {
  const theme = useColor("orange");
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
    <>
      {panelState !== "COLLAPSED" && (
        <TextField
          defaultValue={params.name}
          onBlur={(e) => setParam("name", e.nativeEvent.text)}
          placeholder="Set a name..."
          style={{
            textAlign: "center",
            marginTop: -25,
            marginBottom: 10,
            borderBottomWidth: 2,
            paddingVertical: 7,
            borderBottomColor: theme[5],
          }}
        />
      )}
      <View
        style={{
          position: "relative",
          height: panelState === "COLLAPSED" ? undefined : 50,
          width: panelState === "COLLAPSED" ? "100%" : 195,
          marginHorizontal: "auto",
        }}
      >
        <Text
          weight={800}
          style={{
            position: panelState === "COLLAPSED" ? undefined : "absolute",
            top: 0,
            left: 0,
            fontSize: 40,
            textAlign: "center",
            fontFamily: getFontName("jetBrainsMono", 500),
            color: theme[11],
          }}
          numberOfLines={panelState === "COLLAPSED" ? undefined : 1}
        >
          {panelState === "COLLAPSED"
            ? new Date(time * 1000)
                .toISOString()
                .substr(11, 8)
                .replaceAll("00:", "")
                .split(":")
                .join("\n")
                .replaceAll(" ", "")
            : new Date(time * 1000).toISOString().substr(11, 8)}
        </Text>
        {panelState === "OPEN" && (
          <Text
            weight={800}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              fontSize: 40,
              textAlign: "center",
              fontFamily: getFontName("jetBrainsMono", 500),
              color: theme[10],
              opacity: 0.2,
            }}
            numberOfLines={1}
          >
            00:00:00
          </Text>
        )}
      </View>
      <View
        style={{
          flexDirection: panelState === "COLLAPSED" ? "column" : "row",
          justifyContent: "center",
          gap: 10,
          marginVertical: 5,
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

const Timer = ({ pomodoro = false }) => {
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
  const { panelState } = useFocusPanelContext();

  const playSound = async () => {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
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
            width: panelState === "COLLAPSED" ? 70 : 200,
            height: panelState === "COLLAPSED" ? 70 : 200,
            marginHorizontal: "auto",
            marginTop: panelState === "COLLAPSED" ? 10 : -10,
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
          size={panelState === "COLLAPSED" ? 70 : 200}
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
                      fontSize: panelState === "COLLAPSED" ? 17 : 40,
                      fontFamily: getFontName("jetBrainsMono", 500),
                      textAlign: "center",
                      width: panelState === "COLLAPSED" ? 50 : 130,
                      borderRadius: 10,
                    },
                    !paused && {
                      pointerEvents: "none",
                    },
                    { backgroundColor: theme[4] },
                  ]}
                />
              </Pressable>
            </View>
          )}
        </CountdownCircleTimer>
      </View>
      <View
        style={{
          flexDirection: panelState === "COLLAPSED" ? "column" : "row",
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
      {panelState !== "COLLAPSED" && (
        <Collapsible collapsed={time !== duration * 60}>
          <ScrollView
            horizontal={!pomodoro}
            contentContainerStyle={{
              gap: pomodoro ? 0 : 10,
              paddingHorizontal: pomodoro ? 0 : 20,
            }}
            scrollEnabled={!pomodoro}
            showsHorizontalScrollIndicator={false}
          >
            {pomodoro
              ? [
                  { m: 25, text: "Pomodoro" },
                  { m: 5, text: "Short Break" },
                  { m: 15, text: "Long Break" },
                ].map((time) => (
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
                      marginTop: 5,
                      paddingHorizontal: 20,
                    })}
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
                      {time.m} min
                    </Text>
                  </Button>
                ))
              : [
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
                    pressableStyle={({ pressed, hovered }) => ({
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
                      style={{
                        textAlign: "center",
                        color: theme[11],
                        fontSize: 12,
                      }}
                    >
                      min
                    </Text>
                  </IconButton>
                ))}
          </ScrollView>
        </Collapsible>
      )}
    </>
  );
};

type ClockViewType = "Clock" | "Stopwatch" | "Timer" | "Pomodoro";

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

export default function Clock({ widget, menuActions, setParam }) {
  const theme = useColor("orange");
  const [view, setView] = useState<ClockViewType>("Clock");
  const timeZoneModalRef = useRef<BottomSheetModal>(null);

  return (
    <View>
      {/* {panelState !== "COLLAPSED" && (
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
      )} */}
      <View
        style={[
          {
            backgroundColor: theme[3],
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
          },
          view === "Timer" && {
            paddingHorizontal: 0,
          },
        ]}
      >
        <ColorThemeProvider theme={theme}>
          {view === "Clock" && (
            <Time setParam={setParam} params={widget.params} />
          )}
          {view === "Stopwatch" && (
            <Stopwatch setParam={setParam} params={widget.params} />
          )}
          {view === "Timer" && <Timer />}
          {view === "Pomodoro" && <Timer pomodoro />}
        </ColorThemeProvider>
        {view === "Clock" && (
          <TimeZoneModal
            params={widget.params}
            setParam={setParam}
            timeZoneModalRef={timeZoneModalRef}
          />
        )}
      </View>
    </View>
  );
}
