import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Alert from "@/ui/Alert";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover, { MenuOption } from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useKeepAwake } from "expo-keep-awake";
import { usePathname } from "expo-router";
import { LexoRank } from "lexorank";
import {
  Fragment,
  lazy,
  memo,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform, Pressable, useWindowDimensions, View } from "react-native";
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

const Assistant = lazy(() => import("./widgets/Assistant"));
const Clock = lazy(() => import("./widgets/clock"));
const Quotes = lazy(() => import("./widgets/quotes"));
const UpNext = lazy(() => import("./widgets/up-next"));
const WeatherWidget = lazy(() => import("./widgets/weather/widget"));

export type Widget = "upcoming" | "weather" | "clock" | "assistant" | "sports";

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

function SelectCategory({ setCategory }) {
  const [query, setQuery] = useState("");

  const categories = [
    { name: "Soccer", icon: "sports_soccer" },
    { name: "Motorsport", icon: "sports_motorsports" },
    { name: "Fighting", icon: "sports_mma" },
    { name: "Baseball", icon: "sports_baseball" },
    { name: "Basketball", icon: "sports_basketball" },
    { name: "Football", icon: "sports_football" },
    { name: "Hockey", icon: "sports_hockey" },
    { name: "Golf", icon: "sports_golf" },
    { name: "Rugby", icon: "sports_rugby" },
    { name: "Tennis", icon: "sports_tennis" },
    { name: "Cricket", icon: "sports_cricket" },
    { name: "Cycling", icon: "directions_bike" },
    { name: "Australian Football", icon: "sports_football" },
    { name: "eSports", icon: "sports_esports" },
    { name: "Volleyball", icon: "sports_volleyball" },
    { name: "Netball", icon: "sports_basketball" },
    { name: "Handball", icon: "sports_handball" },
    { name: "Snooker", icon: "circle" },
    { name: "Field Hockey", icon: "sports_hockey" },
    { name: "Darts", icon: "target" },
    { name: "Athletics", icon: "directions_run" },
    { name: "Badminton", icon: "sports_tennis" },
    { name: "Climbing", icon: "mountain_flag" },
    { name: "Equestrian", icon: "bedroom_baby" },
    { name: "Gymnastics", icon: "sports_gymnastics" },
    { name: "Shooting", icon: "target" },
    { name: "Extreme Sports", icon: "crisis_alert" },
    { name: "Table Tennis", icon: "sports_tennis" },
    { name: "Multi Sports", icon: "category" },
    { name: "Water Sports", icon: "kayaking" },
    { name: "Weightlifting", icon: "exercise" },
    { name: "Skiiing", icon: "downhill_skiing" },
    { name: "Skating", icon: "roller_skating" },
    { name: "Winter Sports", icon: "ice_skating" },
    { name: "Lacrosse", icon: "sports_kabaddi" },
  ].filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <View style={{ padding: 20, paddingBottom: 10 }}>
        <Text
          style={{
            fontSize: 20,
            marginBottom: 10,
          }}
          weight={900}
        >
          Browse categories
        </Text>
        <TextField
          placeholder="Find a sport..."
          variant="filled+outlined"
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <FlashList
        contentContainerStyle={{ padding: 20, paddingTop: 10 }}
        data={categories}
        centerContent={categories.length === 0}
        ListEmptyComponent={() => (
          <View
            style={{
              padding: 20,
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <Emoji emoji="1F494" size={40} />
            <Text style={{ textAlign: "center", fontSize: 20 }} weight={600}>
              No sports found
            </Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <ListItemButton key={index} onPress={() => setCategory(item.name)}>
            <Icon>{item.icon}</Icon>
            <ListItemText primary={item.name} />
          </ListItemButton>
        )}
      />
    </>
  );
}

function SelectSport({ category, setCategory, setSport }) {
  const { data, error } = useSWR([
    `www.thesportsdb.com/api/v1/json/3/search_all_leagues.php`,
    { s: category },
    "https://www.thesportsdb.com/",
  ]);
  return (
    <View>
      {error && <ErrorAlert />}
      {JSON.stringify(data)}
    </View>
  );
}

function CreateSport({ createSheetRef }) {
  const [category, setCategory] = useState<null | string>();
  const [sport, setSport] = useState<null | string>();

  return (
    <BottomSheet
      enableContentPanningGesture={false}
      onClose={() => createSheetRef.current?.close()}
      sheetRef={createSheetRef}
      snapPoints={["90%"]}
      index={0}
    >
      {!category && <SelectCategory setCategory={setCategory} />}
      {category && (
        <SelectSport
          category={category}
          setCategory={setCategory}
          setSport={setSport}
        />
      )}
    </BottomSheet>
  );
}

const Sports = ({ params, menuActions }) => {
  const theme = useColorTheme();
  const createSheetRef = useRef<BottomSheetModal>(null);

  return (
    <View>
      <MenuPopover
        options={[
          ...menuActions,
          {
            text: "Add a team",
            icon: "add",
            callback: () => createSheetRef.current?.present(),
          },
        ]}
        containerStyle={{ marginTop: -15 }}
        trigger={
          <Button style={widgetMenuStyles.button} dense>
            <ButtonText weight={800} style={widgetMenuStyles.text}>
              Sports
            </ButtonText>
            <Icon style={{ color: theme[11] }}>expand_more</Icon>
          </Button>
        }
      />
      <CreateSport createSheetRef={createSheetRef} />
      <Alert
        style={{ marginTop: 10 }}
        title="Coming soon"
        emoji="1f6a7"
        subtitle="We're working on this widget - stay tuned!"
      />
    </View>
  );
};

function RenderWidget({ widget, index }) {
  const { sessionToken } = useUser();
  const { data, mutate, error } = useSWR(["user/focus-panel"], null);

  const setParam = async (key, value) => {
    mutate(
      (oldData) =>
        oldData.map((oldWidget) =>
          oldWidget.id === widget.id
            ? {
                ...widget,
                params: {
                  ...widget.params,
                  [key]: value,
                },
              }
            : oldWidget
        ),
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
          params: {
            ...widget.params,
            [key]: value,
          },
        }),
      }
    );
  };

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
      return (
        <Clock
          setParam={setParam}
          menuActions={menuActions}
          widget={widget}
          key={index}
        />
      );
    case "weather":
      return (
        <WeatherWidget menuActions={menuActions} widget={widget} key={index} />
      );
    case "assistant":
      return (
        <Assistant menuActions={menuActions} widget={widget} key={index} />
      );
    case "sports":
      return <Sports menuActions={menuActions} params={widget} key={index} />;
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

  const { data } = useSWR(["user/focus-panel"], null);

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
    <Suspense
      fallback={
        <Wrapper>
          <View
            style={{
              marginHorizontal: "auto",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spinner />
          </View>
        </Wrapper>
      }
    >
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
                        <RenderWidget
                          key={index}
                          index={index}
                          widget={widget}
                        />
                      ))}
                  </ScrollView>
                )}
                <WidgetMenu />
              </>
            )}
          </ScrollView>
        </ContentWrapper>
      </Wrapper>
    </Suspense>
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
