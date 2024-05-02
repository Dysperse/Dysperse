import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Alert from "@/ui/Alert";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import MenuPopover, { MenuOption } from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useKeepAwake } from "expo-keep-awake";
import { usePathname } from "expo-router";
import { LexoRank } from "lexorank";
import { Fragment, memo, useEffect, useState } from "react";
import { Platform, Pressable, View, useWindowDimensions } from "react-native";
import {
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
import Toast from "react-native-toast-message";
import useSWR from "swr";
import ContentWrapper from "../layout/content";
import { useFocusPanelContext } from "./context";
import { WidgetMenu } from "./menu";
import { widgetMenuStyles } from "./widgetMenuStyles";
import { widgetStyles } from "./widgetStyles";
import { Assistant } from "./widgets/Assistant";
import { UpNext } from "./widgets/UpNext";
import { Clock } from "./widgets/clock";
import { WeatherWidget } from "./widgets/weather/widget";

export type Widget = "upcoming" | "weather" | "clock" | "assistant" | "music";

export const WakeLock = () => {
  useKeepAwake();
  return null;
};

export const ImportantChip = () => {
  const orange = useColor("orange");
  return (
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
  );
};

const Music = ({ params, menuActions }) => {
  const theme = useColorTheme();

  return (
    <View>
      <MenuPopover
        options={menuActions}
        containerStyle={{ marginTop: -15 }}
        trigger={
          <Button style={widgetMenuStyles.button} dense>
            <ButtonText weight={800} style={widgetMenuStyles.text}>
              Assistant
            </ButtonText>
            <Icon style={{ color: theme[11] }}>expand_more</Icon>
          </Button>
        }
      />
      <Alert
        style={{ marginTop: 10 }}
        title="Coming soon"
        emoji="1f6a7"
        subtitle="We're working on this widget - stay tuned!"
      />
    </View>
  );
};

function Quotes({ widget, menuActions }) {
  const { data, mutate, error } = useSWR(
    [
      ``,
      {
        tags: "famous-quotes|success|failure|ethics|health|honor|leadership|power-quotes|work",
      },
      "https://api.quotable.io/random",
    ],
    null,
    {
      refreshInterval: 1000 * 60 * 60,
    }
  );

  const [refreshed, setRefreshed] = useState(false);

  const handleRefresh = () => {
    if (!refreshed) {
      setRefreshed(true);
      Toast.show({ type: "info", text1: "Quotes refresh every hour" });
    }
    mutate();
  };
  const theme = useColorTheme();

  return (
    <View>
      <MenuPopover
        options={[
          {
            text: "Refresh",
            icon: "refresh",
            callback: handleRefresh,
          },
          { divider: true },
          ...menuActions,
        ]}
        containerStyle={{ marginTop: -15 }}
        trigger={
          <Button style={widgetMenuStyles.button} dense>
            <ButtonText weight={800} style={widgetMenuStyles.text}>
              Quotes
            </ButtonText>
            <Icon style={{ color: theme[11] }}>expand_more</Icon>
          </Button>
        }
      />
      {error && <ErrorAlert />}
      <View
        style={[
          widgetStyles.card,
          {
            backgroundColor: theme[3],
            borderWidth: 1,
            borderColor: theme[6],
          },
        ]}
      >
        {data ? (
          <>
            <Text
              style={{
                fontSize: data.content.length > 100 ? 23 : 30,
                fontFamily: "serifText800",
              }}
            >
              &ldquo;{data?.content}&rdquo;
            </Text>
            <Text style={{ marginTop: 10, opacity: 0.6 }} weight={600}>
              &mdash; {data?.author}
            </Text>
          </>
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 70 }}>
            <Spinner />
          </View>
        )}
      </View>
    </View>
  );
}

function RenderWidget({ widget, index }) {
  const { sessionToken } = useUser();
  const { data, mutate, error } = useSWR(["user/focus-panel"], null, {
    refreshInterval: 1000 * 60,
  });

  const handleWidgetEdit = async (key, value) => {
    try {
      mutate(
        (oldData) =>
          oldData.map((w) => (w.id === widget.id ? { ...w, [key]: value } : w)),
        {
          revalidate: false,
        }
      );
      await sendApiRequest(
        sessionToken,
        "PUT",
        "user/focus-panel",
        {},
        {
          body: JSON.stringify({
            id: widget.id,
            [key]: value,
          }),
        }
      );
    } catch (e) {
      Toast.show({ type: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      mutate((oldData) => oldData.filter((w) => w.id !== widget.id));
      sendApiRequest(sessionToken, "DELETE", "user/focus-panel", {
        id: widget.id,
      });
    } catch (e) {
      Toast.show({ type: "error" });
    }
  };

  const menuActions = [
    {
      icon: "move_up",
      text: "Move up",
      disabled: index === 0,
      callback: () =>
        handleWidgetEdit(
          "order",
          index === 1
            ? LexoRank.parse(data[0].order).genPrev().toString()
            : // get 2 ranks before the current widget, and generate the next rank between them
              LexoRank.parse(data[index - 2].order)
                .between(LexoRank.parse(data[index - 1].order))
                .toString()
        ),
    },
    {
      icon: "move_down",
      text: "Move down",
      disabled: index === data.length - 1,
      callback: () =>
        handleWidgetEdit(
          "order",
          index === data.length - 2
            ? LexoRank.parse(data[data.length - 1].order)
                .genNext()
                .toString()
            : // get 2 ranks after the current widget, and generate the next rank between them
              LexoRank.parse(data[index + 1].order)
                .between(LexoRank.parse(data[index + 2].order))
                .toString()
        ),
    },
    {
      icon: "remove_circle",
      text: "Remove",
      callback: handleDelete,
    },
  ] as MenuOption[];

  switch (widget.type) {
    case "upcoming":
      return <UpNext menuActions={menuActions} widget={widget} key={index} />;
    case "quotes":
      return <Quotes menuActions={menuActions} widget={widget} key={index} />;
    case "clock":
      return <Clock menuActions={menuActions} widget={widget} key={index} />;
    case "weather":
      return (
        <WeatherWidget menuActions={menuActions} widget={widget} key={index} />
      );
    case "assistant":
      return (
        <Assistant menuActions={menuActions} widget={widget} key={index} />
      );
    case "music":
      return <Music menuActions={menuActions} params={widget} key={index} />;
    default:
      return null;
  }
}

function PanelContent() {
  const theme = useColorTheme();
  const { isFocused } = useFocusPanelContext();

  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const { data } = useSWR(["user/focus-panel"], null, {
    refreshInterval: 1000 * 60,
  });

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
              {!data ? (
                <View style={{ marginHorizontal: "auto" }}>
                  <Spinner />
                </View>
              ) : data.length === 0 ? (
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
                      opacity: 0.45,
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
                  {data
                    .sort(function (a, b) {
                      if (a.order < b.order) return -1;
                      if (a.order > b.order) return 1;
                      return 0;
                    })
                    .map((widget, index) => (
                      <RenderWidget key={index} index={index} widget={widget} />
                    ))}
                </ScrollView>
              )}
              <WidgetMenu />
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
  const breakpoints = useResponsiveBreakpoints();

  return pathname.includes("settings") ? null : (
    <>
      {breakpoints.md && (
        <GestureDetector gesture={pan}>
          <GestureDetector gesture={tap}>
            <PanelSwipeTrigger />
          </GestureDetector>
        </GestureDetector>
      )}

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
        <PanelContent />
      </Animated.View>
    </>
  );
});

export default FocusPanel;
