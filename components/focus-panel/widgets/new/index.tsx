import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Avatar } from "@/ui/Avatar";
import { useColorTheme } from "@/ui/color/theme-provider";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { StackNavigationProp } from "@react-navigation/stack";
import { LexoRank } from "lexorank";
import { useEffect, useRef, useState } from "react";
import { InteractionManager, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { UpcomingSvg, Widget } from "../../panel";

export function NewWidget({
  navigation,
}: {
  navigation: StackNavigationProp<any>;
}) {
  const theme = useColorTheme();
  const { sessionToken } = useUser();
  const { data, mutate } = useSWR(["user/focus-panel"]);
  const [loading, setLoading] = useState<string | boolean>(false);
  const [search, setSearch] = useState<string>("");
  const inputRef = useRef(null);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() =>
      inputRef.current?.focus({ preventScroll: true })
    );
  }, []);

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

  const sections = [
    {
      text: "Information",
      widgets: [
        { text: "Top Stocks", icon: "monitoring", onlyOnce: true },
        { text: "Weather", icon: "wb_sunny" },
        { text: "Battery", icon: "battery_0_bar" },
        {
          key: "upcoming",
          text: "Upcoming tasks",
          icon: <UpcomingSvg />,
        },
      ],
    },
    {
      text: "Utilities",
      widgets: [
        {
          text: "Clock",
          secondary: "Stopwatch, pomodoro & more",
          icon: "timer",
        },
        { text: "Randomizer", secondary: "Coin flip & dice", icon: "casino" },
        { text: "Magic 8 Ball", icon: "counter_8" },
        { text: "Counter", icon: "tag", comingSoon: true },
        { text: "Assistant", icon: "auto_awesome" },
      ],
    },
    {
      text: "Inspiration",
      widgets: [
        { text: "Quotes", icon: "format_quote" },
        {
          text: "Word of the day",
          icon: "book",
          secondary: "With Merriam-Webster",
          onlyOnce: true,
        },
      ],
    },
    {
      text: "Fun",
      widgets: [
        {
          text: "Music",
          icon: "https://cdn.brandfetch.io/id20mQyGeY/theme/dark/idC9Lfpyms.svg?k=bfHSJFAPEG",
          secondary: "With Spotify",
          onlyOnce: true,
        },
      ],
    },
  ]
    .filter((t) =>
      t.widgets.some(
        (w: any) =>
          w.text.toLowerCase().includes(search.toLowerCase()) ||
          w.secondary?.toLowerCase().includes(search.toLowerCase())
      )
    )
    .map((t) => [{ header: true, text: t.text }, ...t.widgets])
    .flat();

  return (
    <>
      <View style={{ paddingHorizontal: 15, marginTop: 3 }}>
        <TextField
          variant="filled+outlined"
          placeholder="Find your widget..."
          onChangeText={setSearch}
          inputRef={inputRef}
          onKeyPress={(e) => {
            if (e.nativeEvent.key === "Escape") navigation.goBack();
          }}
        />
      </View>
      <FlatList
        data={sections}
        contentContainerStyle={{ padding: 15, paddingTop: 7 }}
        renderItem={({ item, index }: any) =>
          item.header ? (
            <Text
              variant="eyebrow"
              style={{ marginTop: 17, marginBottom: 3, marginLeft: 5 }}
            >
              {item.text}
            </Text>
          ) : (
            <ListItemButton
              key={index}
              pressableStyle={{ padding: 5 }}
              onPress={() => {
                if (item.comingSoon) {
                  return Toast.show({
                    type: "info",
                    text1: "Coming soon!",
                  });
                }
                if (
                  item.onlyOnce &&
                  data.find((d) => d.type === item.text.toLowerCase())
                ) {
                  return Toast.show({
                    type: "info",
                    text1: "You can only add this widget once",
                  });
                }
                handleWidgetToggle((item.key || item.text) as Widget);
              }}
            >
              <Avatar
                disabled
                icon={
                  item.icon?.startsWith?.("https")
                    ? undefined
                    : (item.icon as any)
                }
                image={item.icon?.startsWith?.("https") ? item.icon : undefined}
                size={40}
                style={{ borderRadius: 15, backgroundColor: theme[3] }}
              />
              <ListItemText
                primary={item.text}
                secondary={item.secondary}
                secondaryProps={{
                  style: { opacity: 0.5, marginTop: -3, fontSize: 13 },
                }}
              />
              {loading === item.text && <Spinner />}
            </ListItemButton>
          )
        }
      />
    </>
  );
}
