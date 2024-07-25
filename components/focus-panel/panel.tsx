import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Alert from "@/ui/Alert";
import { Avatar } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover, { MenuOption } from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColor, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationOptions,
  StackNavigationProp,
  TransitionPresets,
} from "@react-navigation/stack";
import { FlashList } from "@shopify/flash-list";
import { useKeepAwake } from "expo-keep-awake";
import { usePathname } from "expo-router";
import { LexoRank } from "lexorank";
import {
  lazy,
  memo,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Linking,
  Platform,
  Pressable,
  useWindowDimensions,
  View,
} from "react-native";
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
import Svg, { Path } from "react-native-svg";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import MarkdownRenderer from "../MarkdownRenderer";
import { useSidebarContext } from "../layout/sidebar/context";
import { useFocusPanelContext } from "./context";
import { widgetMenuStyles } from "./widgetMenuStyles";
import { FocusPanelSpotify } from "./widgets/spotify/FocusPanelSpotify";
import { FocusPanelWeather } from "./widgets/weather/modal";

const Assistant = lazy(() => import("./widgets/Assistant"));
const Clock = lazy(() => import("./widgets/clock"));
const Quotes = lazy(() => import("./widgets/quotes"));
const Spotify = lazy(() => import("./widgets/spotify"));
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
          placeholder="Find a sport…"
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
  const { panelState, setPanelState } = useFocusPanelContext();

  return panelState === "COLLAPSED" ? (
    <IconButton
      variant="outlined"
      size={80}
      style={{ borderRadius: 20 }}
      backgroundColors={{
        default: theme[3],
        pressed: theme[4],
        hovered: theme[5],
      }}
      onPress={() => setPanelState("OPEN")}
      icon="sports_football"
    />
  ) : (
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

function RenderWidget({ navigation, widget, index }) {
  const { sessionToken } = useUser();
  const { data, mutate } = useSWR(["user/focus-panel"], null);

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
        <WeatherWidget
          navigation={navigation}
          menuActions={menuActions}
          widget={widget}
          key={index}
        />
      );
    case "assistant":
      return (
        <Assistant menuActions={menuActions} widget={widget} key={index} />
      );
    case "sports":
      return <Sports menuActions={menuActions} params={widget} key={index} />;
    case "music":
      return (
        <Spotify
          navigation={navigation}
          menuActions={menuActions}
          params={widget}
          key={index}
        />
      );
    case "word of the day":
      return (
        <WordOfTheDay
          navigation={navigation}
          menuActions={menuActions}
          params={widget}
          key={index}
        />
      );
    default:
      return null;
  }
}

function WordOfTheDay({ navigation, menuActions, params }) {
  const theme = useColorTheme();
  const { panelState, setPanelState, collapseOnBack } = useFocusPanelContext();
  const { data, error } = useSWR(["user/focus-panel/word-of-the-day"]);

  return panelState === "COLLAPSED" ? (
    <IconButton
      size={80}
      icon="book"
      backgroundColors={{
        default: theme[3],
        pressed: theme[4],
        hovered: theme[5],
      }}
      onPress={() => {
        navigation.navigate("Word of the day");
        setPanelState("OPEN");
        if (panelState === "COLLAPSED") collapseOnBack.current = true;
      }}
      variant="outlined"
      style={{ borderRadius: 20 }}
    />
  ) : (
    <View>
      <MenuPopover
        options={menuActions}
        trigger={
          <Button style={widgetMenuStyles.button} dense>
            <ButtonText weight={800} style={widgetMenuStyles.text}>
              Word of the day
            </ButtonText>
            <Icon style={{ color: theme[11] }}>expand_more</Icon>
          </Button>
        }
      />
      <Pressable
        style={({ pressed, hovered }) => ({
          padding: 20,
          backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
          borderWidth: 1,
          borderColor: theme[5],
          borderRadius: 20,
          paddingBottom: data ? 10 : undefined,
          alignItems: data ? undefined : "center",
        })}
        onPress={() => navigation.navigate("Word of the day")}
      >
        {data ? (
          <>
            <Text
              style={{ fontFamily: "serifText800", fontSize: 30 }}
              numberOfLines={1}
            >
              {capitalizeFirstLetter(data.word)}
            </Text>
            <Text
              weight={700}
              style={{ opacity: 0.7, marginTop: 5 }}
              numberOfLines={1}
            >
              {data.partOfSpeech} &nbsp;&bull; &nbsp;
              <Text>{data.pronunciation}</Text>
            </Text>
            <MarkdownRenderer>{data.definition}</MarkdownRenderer>
          </>
        ) : (
          <Spinner />
        )}
      </Pressable>
    </View>
  );
}

function WordOfTheDayScreen() {
  const theme = useColorTheme();
  const { data, error } = useSWR(["user/focus-panel/word-of-the-day"]);

  const cardStyles = {
    backgroundColor: theme[3],
    padding: 20,
    paddingBottom: 10,
    borderRadius: 20,
    marginTop: 10,
  };

  const handleAudio = async () => {
    // const soundObject = new Audio.Sound();
    // try {
    //   await soundObject.loadAsync({ uri: data.audio.url });
    //   await soundObject.playAsync();
    // } catch (error) {
    //   console.log("Error playing audio", error);
    // }

    Linking.openURL(data.audio.url);
  };

  return data ? (
    <ScrollView
      contentContainerStyle={{ padding: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ padding: 5 }}>
        <Text
          style={{ fontFamily: "serifText800", fontSize: 30 }}
          numberOfLines={1}
        >
          {capitalizeFirstLetter(data.word)}
        </Text>
        <Text
          weight={700}
          style={{ opacity: 0.7, marginTop: 5 }}
          numberOfLines={1}
        >
          {data.partOfSpeech} &nbsp;&bull; &nbsp;
          <Text>{data.pronunciation}</Text>
        </Text>
        <MarkdownRenderer>{data.definition}</MarkdownRenderer>
      </View>
      <Button
        containerStyle={{ marginTop: 10 }}
        height={50}
        variant="filled"
        onPress={() => Linking.openURL(data.link)}
        icon="north_east"
        iconPosition="end"
        text="Open in Merriam-Webster"
      />
      <Button
        containerStyle={{ marginTop: 10 }}
        height={50}
        variant="filled"
        onPress={handleAudio}
        icon="north_east"
        iconPosition="end"
        text="Open as podcast"
      />
      <View style={cardStyles}>
        <Text variant="eyebrow">In a sentence</Text>
        <MarkdownRenderer>{data.exampleSentence}</MarkdownRenderer>
      </View>
      <View style={cardStyles}>
        <Text variant="eyebrow">Examples</Text>
        <MarkdownRenderer>{data.examples}</MarkdownRenderer>
      </View>
      <View style={cardStyles}>
        <Text variant="eyebrow">Did you know!?</Text>
        <MarkdownRenderer>{data.didYouKnow}</MarkdownRenderer>
      </View>
    </ScrollView>
  ) : (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        padding: 20,
      }}
    >
      {error ? <ErrorAlert /> : <Spinner />}
    </View>
  );
}

const Stack = createStackNavigator();

export const Navbar = ({
  title,
  navigation,
  backgroundColor,
  foregroundColor,
}: {
  title: string;
  navigation: StackNavigationProp<any>;
  backgroundColor?: string;
  foregroundColor?: string;
}) => {
  const { setPanelState, panelState, collapseOnBack } = useFocusPanelContext();
  const { sidebarRef } = useSidebarContext();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const isDark = useDarkMode();

  return (
    <View
      style={{
        height: 70,
        flexDirection: title === "Focus" ? "row-reverse" : "row",
        alignItems: "center",
        justifyContent: panelState === "COLLAPSED" ? "center" : "space-between",
        padding: panelState === "COLLAPSED" ? 0 : 15,
        backgroundColor:
          backgroundColor || theme[panelState === "COLLAPSED" ? 2 : 1],
      }}
    >
      {panelState !== "COLLAPSED" && (
        <IconButton
          onPress={() => {
            if (collapseOnBack.current && title !== "Focus")
              setPanelState("COLLAPSED");
            if (title === "Focus") {
              navigation.push("New");
            } else {
              navigation.goBack();
            }
          }}
          backgroundColors={
            title === "Focus"
              ? undefined
              : {
                  default: "transparent",
                  pressed: isDark
                    ? "rgba(255,255,255,.1)"
                    : "rgba(0, 0, 0, 0.1)",
                  hovered: isDark
                    ? "rgba(255,255,255,.2)"
                    : "rgba(0, 0, 0, 0.2)",
                }
          }
          size={!breakpoints.md ? 50 : 40}
          variant={
            title === "Focus" ? (breakpoints.md ? "filled" : "text") : "text"
          }
          icon={
            <Icon
              style={{
                color: foregroundColor || theme[11],
              }}
            >
              {title === "Focus" ? "add" : "arrow_back_ios_new"}
            </Icon>
          }
          style={{
            opacity: navigation.canGoBack() || title === "Focus" ? 1 : 0,
          }}
        />
      )}
      {panelState !== "COLLAPSED" && (
        <Text
          style={{
            fontSize: 20,
            opacity: title === "Focus" ? 0 : 1,
            color: foregroundColor || theme[11],
          }}
          weight={800}
        >
          {title}
        </Text>
      )}
      {breakpoints.md ? (
        <IconButton
          onPress={() => {
            setPanelState((t) => {
              const d = t === "COLLAPSED" ? "OPEN" : "COLLAPSED";
              collapseOnBack.current = d === "COLLAPSED";
              return d;
            });
          }}
          icon={
            panelState === "COLLAPSED"
              ? "right_panel_open"
              : "right_panel_close"
          }
          size={!breakpoints.md ? 50 : 40}
          style={{
            padding: 10,
            marginBottom: panelState === "COLLAPSED" ? 10 : 0,
            opacity:
              panelState === "COLLAPSED" ? 0.5 : title === "Focus" ? 1 : 0,
            marginRight: panelState === "COLLAPSED" ? 10 : 0,
          }}
        />
      ) : (
        <IconButton
          icon="menu"
          variant="outlined"
          onPress={() => sidebarRef.current.openDrawer()}
        />
      )}
    </View>
  );
};

export const UpcomingSvg = () => {
  const theme = useColorTheme();
  return (
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
  );
};

export const SpotifySvg = () => {
  return (
    <Svg
      height={24}
      width={24}
      viewBox="-33.4974 -55.829 290.3108 334.974"
      style={{ transform: [{ scale: 1.5 }] }}
    >
      <Path
        d="M177.707 98.987c-35.992-21.375-95.36-23.34-129.719-12.912-5.519 1.674-11.353-1.44-13.024-6.958-1.672-5.521 1.439-11.352 6.96-13.029 39.443-11.972 105.008-9.66 146.443 14.936 4.964 2.947 6.59 9.356 3.649 14.31-2.944 4.963-9.359 6.6-14.31 3.653m-1.178 31.658c-2.525 4.098-7.883 5.383-11.975 2.867-30.005-18.444-75.762-23.788-111.262-13.012-4.603 1.39-9.466-1.204-10.864-5.8a8.717 8.717 0 015.805-10.856c40.553-12.307 90.968-6.347 125.432 14.833 4.092 2.52 5.38 7.88 2.864 11.968m-13.663 30.404a6.954 6.954 0 01-9.569 2.316c-26.22-16.025-59.223-19.644-98.09-10.766a6.955 6.955 0 01-8.331-5.232 6.95 6.95 0 015.233-8.334c42.533-9.722 79.017-5.538 108.448 12.446a6.96 6.96 0 012.31 9.57M111.656 0C49.992 0 0 49.99 0 111.656c0 61.672 49.992 111.66 111.657 111.66 61.668 0 111.659-49.988 111.659-111.66C223.316 49.991 173.326 0 111.657 0"
        fill={"#1DB954"}
      />
    </Svg>
  );
};

function NewWidget({ navigation }: { navigation: StackNavigationProp<any> }) {
  const { sessionToken } = useUser();
  const { data, mutate } = useSWR(["user/focus-panel"]);
  const [loading, setLoading] = useState<string | boolean>(false);

  const handleWidgetToggle = async (type: Widget) => {
    try {
      setLoading(type);
      await sendApiRequest(
        sessionToken,
        "POST",
        "user/focus-panel",
        {},
        {
          body: JSON.stringify({
            type: type.toLowerCase(),
            order: data[0]
              ? LexoRank.parse(data[0].order).genPrev().toString()
              : LexoRank.middle().toString(),
            params: {},
          }),
        }
      );
      mutate();
      navigation.goBack();
    } catch (e) {
      Toast.show({
        text1: "Something went wrong. Please try again later",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const options = [
    {
      text: "Upcoming",
      icon: <UpcomingSvg />,
    },
    { text: "Quotes", icon: "format_quote" },
    { text: "Clock", icon: "timer" },
    { text: "Weather", icon: "wb_sunny" },
    { text: "Assistant", icon: "auto_awesome" },
    { text: "Sports", icon: "sports_football" },
    {
      text: "Word of the day",
      icon: "book",
      secondary: "With Merriam-Webster",
      onlyOnce: true,
    },
    {
      text: "Music",
      icon: <SpotifySvg />,
      secondary: "With Spotify",
      onlyOnce: true,
    },
  ];
  return (
    <ScrollView contentContainerStyle={{ padding: 15, gap: 15 }}>
      {options.map((option, index) => (
        <ListItemButton
          key={index}
          variant="filled"
          onPress={() => {
            if (
              option.onlyOnce &&
              data.find((d) => d.type === option.text.toLowerCase())
            ) {
              return Toast.show({
                type: "info",
                text1: "You can only add this widget once",
              });
            }
            // if (option.comingSoon) {
            //   return Toast.show({
            //     type: "info",
            //     text1: "Coming soon!",
            //   });
            // }
            handleWidgetToggle(option.text as Widget);
          }}
        >
          <Avatar
            disabled
            icon={option.icon as any}
            size={50}
            image={option.image}
            style={{ borderRadius: 15 }}
          />
          <ListItemText primary={option.text} secondary={option.secondary} />
          {loading === option.text && <Spinner />}
        </ListItemButton>
      ))}
    </ScrollView>
  );
}

function PanelContent() {
  const theme = useColorTheme();
  const r = useRef<NavigationContainerRef<any>>(null);
  const breakpoints = useResponsiveBreakpoints();
  const { panelState } = useFocusPanelContext();
  const { width } = useWindowDimensions();

  const opacity = useSharedValue(breakpoints.md ? 2 : 0);
  const opacityStyle = useAnimatedStyle(() => ({
    opacity: withSpring(opacity.value, { overshootClamping: true }),
  }));

  const screenOptions = useMemo<StackNavigationOptions>(
    () => ({
      ...TransitionPresets.ScaleFromCenterAndroid,
      detachPreviousScreen: false,
      headerShown: true,
      freezeOnBlur: true,
      gestureEnabled: false,
      headerMode: "screen",
      cardStyle: {
        height: "100%",
        width: breakpoints.md
          ? panelState === "COLLAPSED"
            ? 85
            : 340
          : "100%",
        borderRadius: breakpoints.md ? 18 : 0,
        display: panelState === "CLOSED" ? "none" : "flex",
      },
      header: ({ navigation, route }) => (
        <Navbar title={route.name} navigation={navigation} />
      ),
    }),
    [panelState, breakpoints]
  );

  return (
    <Animated.View
      style={[
        {
          borderRadius: breakpoints.md ? 20 : 0,
          flex: 1,
          overflow: panelState === "COLLAPSED" ? "visible" : "hidden",
        },
        !breakpoints.md && { width: width },
      ]}
    >
      <Animated.View
        style={[
          opacityStyle,
          {
            position: "absolute",
            width: "100%",
            height: "100%",
            borderWidth: 2,
            borderColor: theme[panelState === "COLLAPSED" ? 2 : 5],
            zIndex: 99,
            borderRadius: 20,
            pointerEvents: "none",
          },
        ]}
      />
      <WakeLock />
      <NavigationContainer
        ref={r}
        documentTitle={{ enabled: false }}
        independent={true}
        onStateChange={(state) => {
          const currentRouteName = state.routes[state.index].name;
          if (
            currentRouteName === "New" ||
            currentRouteName === "Focus" ||
            currentRouteName === "Word of the day"
          ) {
            opacity.value = breakpoints.md ? 1 : 0;
          } else {
            opacity.value = 0;
          }
        }}
        theme={{
          colors: {
            background: theme[panelState === "COLLAPSED" ? 2 : 1],
            card: theme[panelState === "COLLAPSED" ? 2 : 1],
            primary: theme[1],
            border: theme[6],
            text: theme[11],
            notification: theme[9],
          },
          dark: true,
        }}
      >
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen
            name="Focus"
            options={{
              cardStyle: {
                paddingHorizontal: 2,
                width: panelState === "COLLAPSED" ? 85 : 340,
              },
            }}
            component={FocusPanelHome}
          />
          <Stack.Screen
            name="Weather"
            component={FocusPanelWeather}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Spotify"
            component={FocusPanelSpotify}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Word of the day" component={WordOfTheDayScreen} />
          <Stack.Screen name="New" component={NewWidget} />
        </Stack.Navigator>
      </NavigationContainer>
    </Animated.View>
  );
}

function FocusPanelHome({
  navigation,
}: {
  navigation: StackNavigationProp<any>;
}) {
  const theme = useColorTheme();
  const { data } = useSWR(["user/focus-panel"], null);
  const { panelState } = useFocusPanelContext();

  return (
    <>
      <Suspense
        fallback={
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
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={[{ flex: 1, padding: panelState === "COLLAPSED" ? 0 : 20 }]}
        >
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
                gap: panelState === "COLLAPSED" ? 10 : 20,
                minHeight: "100%",
                paddingBottom: panelState === "COLLAPSED" ? 0 : 20,
              }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              {data
                .sort(function (a, b) {
                  if (a.order < b.order) return -1;
                  if (a.order > b.order) return 1;
                  return 0;
                })
                .map((widget, index) => (
                  <RenderWidget
                    navigation={navigation}
                    key={index}
                    index={index}
                    widget={widget}
                  />
                ))}
            </ScrollView>
          )}
        </ScrollView>
      </Suspense>
    </>
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
  const { panelState, setPanelState } = useFocusPanelContext();
  const marginRight = useSharedValue(-350);
  const width = useSharedValue(350);

  useHotkeys("\\", () =>
    setPanelState(panelState === "OPEN" ? "CLOSED" : "OPEN")
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      marginRight: withSpring(marginRight.value, {
        stiffness: 200,
        damping: 30,
        overshootClamping: true,
      }),
      width: withSpring(width.value, {
        stiffness: 200,
        damping: 30,
        overshootClamping: true,
      }),
    };
  });

  useEffect(() => {
    marginRight.value = panelState === "CLOSED" ? -350 : 0;
  }, [panelState, marginRight]);

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
      setPanelState(velocityX > 0 ? "OPEN" : "CLOSED");
    });

  const tap = Gesture.Tap().onEnd(() =>
    setPanelState((t) => (t === "OPEN" ? "CLOSED" : "OPEN"))
  );

  const pathname = usePathname();
  const breakpoints = useResponsiveBreakpoints();
  const { height } = useWindowDimensions();

  useEffect(() => {
    width.value = panelState === "COLLAPSED" ? 100 : 350;
  }, [panelState, width]);

  return pathname.includes("settings") ? null : (
    <View
      style={{
        flexDirection: "row",
        height,
        ...(Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any)),
      }}
    >
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
            padding: breakpoints.md ? 10 : 0,
            paddingLeft: 0,
            height,
            ...(!breakpoints.md && { width }),
            ...(Platform.OS === "web" &&
              ({
                marginTop: "env(titlebar-area-height,0)",
                height: "calc(100vh - env(titlebar-area-height,0))",
              } as any)),
          },
        ]}
      >
        <PanelContent />
      </Animated.View>
    </View>
  );
});

export default FocusPanel;
