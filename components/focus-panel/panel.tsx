import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Alert from "@/ui/Alert";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import dayjs from "dayjs";
import { useKeepAwake } from "expo-keep-awake";
import { usePathname } from "expo-router";
import { Fragment, memo, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, Pressable, View, useWindowDimensions } from "react-native";
import {
  FlatList,
  Gesture,
  GestureDetector,
  ScrollView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Path, Svg } from "react-native-svg";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { Entity } from "../collections/entity";
import {
  ColumnEmptyComponent,
  onTaskUpdate,
} from "../collections/views/planner/Column";
import { Clock } from "../home/clock";
import { WeatherWidget } from "../home/weather/widget";
import ContentWrapper from "../layout/content";
import { TaskDrawer } from "../task/drawer";
import {
  FocusPanelWidgetProvider,
  useFocusPanelContext,
  useFocusPanelWidgetContext,
} from "./context";
import { widgetStyles } from "./widgetStyles";

type Widget = "upcoming" | "weather" | "clock" | "assistant" | "music";

const WakeLock = () => {
  useKeepAwake();
  return null;
};

const UpNext = () => {
  const userTheme = useColorTheme();
  const theme = useColor("green");
  const orange = useColor("orange");
  const [todayDateString, setTodayDateString] = useState(dayjs().toISOString());

  useEffect(() => {
    const interval = setInterval(
      () => {
        setTodayDateString(dayjs().toISOString());
      },
      // every 5 minutes
      1000 * 60 * 5
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // check if the day has changed every 5 seconds and update the date string if it has
    const interval = setInterval(() => {
      if (!dayjs().isSame(dayjs(todayDateString), "day")) {
        setTodayDateString(dayjs().toISOString());
      }
    }, 1000 * 5);
    return () => clearInterval(interval);
  }, [todayDateString]);

  const { data, mutate, error } = useSWR(
    [
      "space/collections/collection/planner",
      {
        all: true,
        start: dayjs(todayDateString).startOf("week").toISOString(),
        end: dayjs(todayDateString).endOf("week").toISOString(),
        type: "week",
        timezone: dayjs.tz.guess(),
        id: "-",
      },
    ],
    {
      refreshInterval: 1000 * 60 * 5,
      refreshWhenHidden: true,
    }
  );

  const today = data?.find((col) =>
    dayjs().isBetween(dayjs(col.start), dayjs(col.end))
  );

  // find task which is closest in future to current time
  const nextTask = today?.tasks
    .filter((task) => dayjs().isBefore(dayjs(task.due)))
    .filter((t) => t.completionInstances?.length === 0)
    .sort((a, b) => dayjs(a.due).diff(dayjs(b.due)))[0];

  const nextUncompletedTask = today?.tasks
    .sort((a, b) => dayjs(a.due).diff(dayjs(b.due)))
    .filter((t) => t.completionInstances?.length === 0);

  return (
    <View>
      <Text variant="eyebrow" style={{ marginBottom: 10 }}>
        Up next
      </Text>
      <ColorThemeProvider theme={theme}>
        {error && <ErrorAlert />}
        <View
          style={[
            widgetStyles.card,
            {
              backgroundColor: theme[2],
              borderWidth: 1,
              borderColor: theme[4],
            },
          ]}
        >
          {data ? (
            <>
              {nextTask ? (
                <>
                  <View
                    style={{ flexDirection: "row", marginBottom: 5, gap: 10 }}
                  >
                    {nextTask.label && (
                      <Chip
                        disabled
                        dense
                        label={
                          nextTask.label.name.length > 10
                            ? `${nextTask.label.name.slice(0, 10)}...`
                            : `${nextTask.label.name}`
                        }
                        icon={<Emoji size={17} emoji={nextTask.label.emoji} />}
                        style={{
                          paddingHorizontal: 10,
                        }}
                      />
                    )}
                    {nextTask.pinned && (
                      <Chip
                        dense
                        disabled
                        label="Urgent"
                        icon={
                          <Icon size={22} style={{ color: orange[11] }}>
                            priority_high
                          </Icon>
                        }
                        style={{ backgroundColor: orange[4] }}
                        color={orange[11]}
                      />
                    )}
                  </View>
                  <Text style={{ fontSize: 35 }}>{nextTask.name}</Text>
                  <Text
                    style={{
                      fontFamily: "mono",
                      marginTop: 5,
                    }}
                  >
                    {dayjs(nextTask.due).fromNow()}
                  </Text>
                  <ColorThemeProvider theme={userTheme}>
                    <TaskDrawer
                      id={nextTask.id}
                      mutateList={(n) => onTaskUpdate(n, mutate, today)}
                    >
                      <Button
                        style={({ pressed, hovered }) => ({
                          backgroundColor:
                            theme[pressed ? 11 : hovered ? 10 : 9],
                          marginTop: 10,
                        })}
                      >
                        <ButtonText style={{ color: theme[1] }} weight={900}>
                          View task
                        </ButtonText>
                        <Icon bold style={{ color: theme[1] }}>
                          north_east
                        </Icon>
                      </Button>
                    </TaskDrawer>
                  </ColorThemeProvider>
                </>
              ) : (
                <View>
                  {nextUncompletedTask.length > 0 ? (
                    <View style={{ marginTop: 10, marginHorizontal: -10 }}>
                      <Text
                        style={{
                          paddingHorizontal: 10,
                          marginBottom: 10,
                          textAlign: "center",
                        }}
                        variant="eyebrow"
                      >
                        You didn't finish...
                      </Text>
                      {nextUncompletedTask.slice(0, 3).map((task) => (
                        <Entity
                          isReadOnly={false}
                          key={task.id}
                          item={task}
                          onTaskUpdate={(n) => onTaskUpdate(n, mutate, today)}
                          showLabel
                          showRelativeTime
                        />
                      ))}
                    </View>
                  ) : (
                    <>
                      <Text
                        variant="eyebrow"
                        style={{
                          textAlign: "center",
                          marginTop: 10,
                        }}
                      >
                        No tasks today! 🎉
                      </Text>
                      <View
                        style={{
                          marginTop: -30,
                          marginBottom: 10,
                        }}
                      >
                        <ColumnEmptyComponent dense />
                      </View>
                    </>
                  )}
                </View>
              )}
            </>
          ) : (
            <Spinner />
          )}
        </View>
      </ColorThemeProvider>
    </View>
  );
};

const Assistant = () => {
  const { session, sessionToken } = useUser();
  const theme = useColorTheme();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      message: "",
    },
  });

  const sendMessage = async ({ message }) => {
    try {
      setLoading(true);

      setMessages((m) => [
        ...m,
        {
          role: "user",
          message,
        },
      ]);

      reset();

      const data = await sendApiRequest(sessionToken, "POST", "ai/assistant", {
        input: message,
      });
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          message: data.response,
        },
      ]);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred while sending the message",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text variant="eyebrow">Assistant</Text>
      <View
        style={{
          backgroundColor: theme[2],
          borderWidth: 1,
          borderColor: theme[5],
          marginVertical: 10,
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <FlatList
          inverted
          contentContainerStyle={{
            padding: 10,
            borderRadius: 10,
            marginTop: 10,
            height: 300,
            gap: 20,
          }}
          data={messages.slice().reverse()}
          renderItem={({ item, index }) => (
            <View
              style={[
                {
                  flexDirection: item.role === "user" ? "row-reverse" : "row",
                  gap: 10,
                  alignItems: item.role === "bot" ? "flex-end" : "flex-start",
                },
                index === messages.length - 1 && { marginBottom: 20 },
              ]}
            >
              <View>
                {item.role === "bot" ? (
                  <Avatar size={30}>
                    <Logo size={25} />
                  </Avatar>
                ) : (
                  <ProfilePicture
                    name={session.user.profile.name}
                    image={session.user.profile.picture}
                    size={30}
                  />
                )}
              </View>
              <View
                style={[
                  {
                    padding: 10,
                    paddingHorizontal: 20,
                    borderRadius: 20,
                    maxWidth: 200,
                    height: "auto",
                  },
                  item.role === "user" && {
                    marginLeft: "auto",
                    backgroundColor: theme[9],
                  },
                  item.role === "bot" && {
                    marginRight: "auto",
                    backgroundColor: theme[4],
                  },
                ]}
              >
                <Text>{item.message}</Text>
              </View>
            </View>
          )}
          ListHeaderComponent={
            loading && (
              <View
                style={{ alignItems: "center", gap: 10, flexDirection: "row" }}
              >
                <Avatar size={30}>
                  <Logo size={25} />
                </Avatar>
                <Spinner />
              </View>
            )
          }
          keyExtractor={(item, i) => i.toString()}
        />
        <Controller
          name="message"
          control={control}
          render={({ field: { onChange, value } }) => (
            <View
              style={{
                borderWidth: 1,
                borderColor: theme[4],
                flexDirection: "row",
                backgroundColor: theme[3],
              }}
            >
              <TextField
                placeholder="Message"
                value={value}
                onChangeText={onChange}
                style={{
                  flex: 1,
                  paddingHorizontal: 15,
                  height: 45,
                  shadowRadius: 0,
                }}
                blurOnSubmit={false}
                onSubmitEditing={handleSubmit(sendMessage)}
              />
              <IconButton
                icon="send"
                size={45}
                onPress={handleSubmit(sendMessage)}
              />
            </View>
          )}
        />
      </View>
    </View>
  );
};

const Music = () => {
  return (
    <View>
      <Text variant="eyebrow">Music</Text>
      <Alert
        style={{ marginTop: 10 }}
        title="Coming soon"
        emoji="1f6a7"
        subtitle="We're working on this widget - stay tuned!"
      />
    </View>
  );
};

function WidgetBar({ widgets, setWidgets }) {
  const theme = useColorTheme();
  const { setFocus } = useFocusPanelContext();

  const handleWidgetToggle = (widget: Widget) => {
    setWidgets((widgets) => {
      if (widgets.includes(widget)) {
        return widgets.filter((w) => w !== widget);
      } else {
        return [...widgets, widget];
      }
    });
  };

  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          position: "absolute",
          top: 0,
          right: 0,
          padding: 10,
          paddingTop: 10 + insets.top,
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
        },
        !breakpoints.md && {
          borderBottomWidth: 1,
          borderBottomColor: theme[3],
        },
      ]}
    >
      {process.env.NODE_ENV === "production" && <WakeLock />}
      {!breakpoints.md && (
        <>
          <IconButton
            onPress={() => setFocus(false)}
            variant={breakpoints.md ? "filled" : "text"}
            style={{
              width: 60,
              opacity: 0.6,
            }}
          >
            <Icon>west</Icon>
          </IconButton>
          <Text
            style={{
              color: theme[11],
              marginLeft: "auto",
              marginRight: "auto",
              opacity: 0.7,
              fontSize: 20,
            }}
            weight={200}
          >
            Focus
          </Text>
        </>
      )}
      <MenuPopover
        containerStyle={{
          marginLeft: -15,
        }}
        trigger={
          <IconButton
            variant="filled"
            style={{
              width: 60,
            }}
          >
            <Icon>edit</Icon>
          </IconButton>
        }
        options={[
          {
            text: "Upcoming",
            renderer: () => (
              <MenuItem onPress={() => handleWidgetToggle("upcoming")}>
                <Svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  width={24}
                  height={24}
                  stroke={theme[11]}
                >
                  <Path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
                  />
                </Svg>
                <Text variant="menuItem">Up next</Text>
                {widgets.includes("upcoming") && (
                  <Icon style={{ marginLeft: "auto" }}>check</Icon>
                )}
              </MenuItem>
            ),
          },
          { text: "Clock", icon: "timer" },
          { text: "Weather", icon: "wb_sunny" },
          { text: "Assistant", icon: "auto_awesome" },
          { text: "Music", icon: "music_note" },
        ].map((i) => ({
          ...i,
          selected: widgets.includes(i.text.toLowerCase()),
          callback: () => handleWidgetToggle((i.text as any).toLowerCase()),
        }))}
      />
    </View>
  );
}

function PanelContent() {
  const theme = useColorTheme();
  const { isFocused } = useFocusPanelContext();
  const { widgets, setWidgets } = useFocusPanelWidgetContext();

  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const Wrapper = breakpoints.md
    ? Fragment
    : ({ children }) => (
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: theme[1],
            zIndex: 9999,
            width: width,
            height: "100%",
          }}
        >
          {children}
        </View>
      );

  return (
    <Wrapper>
      <ContentWrapper
        noPaddingTop={!breakpoints.md}
        style={{
          position: "relative",
          maxHeight: height - 20,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingTop: insets.top + 20,
          }}
          centerContent
        >
          {isFocused && (
            <>
              {widgets.length === 0 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    maxWidth: 250,
                    marginHorizontal: "auto",
                    gap: 5,
                  }}
                >
                  <Text style={{ textAlign: "center" }} variant="eyebrow">
                    This is the focus panel
                  </Text>
                  <Text
                    style={{
                      textAlign: "center",
                      color: theme[11],
                      opacity: 0.6,
                    }}
                  >
                    Here, you can add widgets to enhance & supercharge your
                    productivity
                  </Text>
                </View>
              ) : (
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{
                    gap: 5,
                    paddingTop: 80,
                    minHeight: "100%",
                  }}
                >
                  {widgets.includes("upcoming") && <UpNext />}
                  {widgets.includes("clock") && <Clock />}
                  {widgets.includes("weather") && <WeatherWidget />}
                  {widgets.includes("assistant") && <Assistant />}
                  {widgets.includes("music") && <Music />}
                </ScrollView>
              )}
              <WidgetBar widgets={widgets} setWidgets={setWidgets} />
            </>
          )}
        </ScrollView>
      </ContentWrapper>
    </Wrapper>
  );
}
export function PanelSwipeTrigger({
  side = "right",
}: {
  side?: "left" | "right";
}) {
  const theme = useColorTheme();
  const width = useSharedValue(10);
  const pathname = usePathname();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(width.value, { damping: 30, stiffness: 400 }),
    };
  });

  const dotStyle = useAnimatedStyle(() => ({
    height: withSpring(width.value == 15 ? 30 : 20, {
      damping: 30,
      stiffness: 400,
    }),
  }));

  const isPullerActive = useSharedValue(0);
  const isPullerHovered = useSharedValue(0);

  const pullerStyles = useAnimatedStyle(() => ({
    width: withSpring(isPullerActive.value ? 11 : 7, {
      damping: 30,
      stiffness: 400,
    }),
    backgroundColor: withSpring(
      theme[
        !isPullerActive.value
          ? isPullerHovered.value
            ? 5
            : 2
          : isPullerHovered.value
          ? 6
          : 5
      ],
      {
        damping: 30,
        stiffness: 400,
      }
    ),
  }));

  let t: any = null;

  const onPressIn = () => {
    width.value = 15;
    isPullerActive.value = 1;
  };

  const onPressOut = () => {
    width.value = 10;
    isPullerActive.value = 0;
  };

  const onHoverIn = () => {
    isPullerHovered.value = 1;
    t = setTimeout(() => {
      width.value = 15;
    }, 500);
  };

  const onHoverOut = () => {
    if (t) clearTimeout(t);
    isPullerHovered.value = 0;
    width.value = 10;
  };

  return (
    <Pressable
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        {
          shadowRadius: 0,
          height: "100%",
          paddingHorizontal: 15,
          justifyContent: "center",
          zIndex: 1,
        },
        Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
        side === "left"
          ? { marginHorizontal: -17, marginRight: -25 }
          : { marginHorizontal: -15, marginLeft: -25 },
      ]}
    >
      <Animated.View
        style={[
          animatedStyle,
          { alignItems: "center", paddingVertical: 20 },
          pathname.includes("settings") && { display: "none" },
        ]}
      >
        <Animated.View
          style={[
            pullerStyles,
            dotStyle,
            {
              backgroundColor: theme[4],
              width: 5,
              borderRadius: 99,
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const FocusPanel = memo(function FocusPanel() {
  const { isFocused, setFocus } = useFocusPanelContext();
  const marginRight = useSharedValue(-350);

  useHotkeys("\\", () => setFocus(!isFocused), {}, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      marginRight: withSpring(marginRight.value, {
        damping: 30,
        stiffness: 400,
      }),
    };
  });

  useEffect(() => {
    marginRight.value = isFocused ? 0 : -350;
  }, [isFocused, marginRight]);

  const pan = Gesture.Pan()
    .onChange(({ changeX }) => {
      const maxMargin = 350;
      marginRight.value = Math.max(
        -maxMargin,
        Math.min(marginRight.value - changeX, 0)
      );
    })
    .onEnd(({ velocityX }) => {
      marginRight.value = velocityX > 0 ? -350 : 0;
      setFocus(velocityX <= 0);
    });

  const tap = Gesture.Tap().onEnd(() => setFocus(!isFocused));
  const pathname = usePathname();
  return pathname.includes("settings") ? null : (
    <>
      <GestureDetector gesture={pan}>
        <GestureDetector gesture={tap}>
          <PanelSwipeTrigger />
        </GestureDetector>
      </GestureDetector>

      <Animated.View
        style={[
          animatedStyle,
          {
            padding: 10,
            paddingLeft: 0,
            width: 350,
            ...(Platform.OS === "web" &&
              ({
                marginTop: "env(titlebar-area-height,0)",
              } as any)),
          },
        ]}
      >
        <FocusPanelWidgetProvider>
          <PanelContent />
        </FocusPanelWidgetProvider>
      </Animated.View>
    </>
  );
});

export default FocusPanel;
