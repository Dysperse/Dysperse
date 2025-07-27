import { Widget } from "@/components/focus-panel/panel";
import { ArcSystemBar } from "@/components/layout/arcAnimations";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { Avatar } from "@/ui/Avatar";
import { useColorTheme } from "@/ui/color/theme-provider";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { router } from "expo-router";
import { LexoRank } from "lexorank";
import React, { useRef, useState } from "react";
import { View } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { MenuButton } from ".";

export const WIDGET_LIST = [
  {
    text: "Information",
    widgets: [
      {
        key: "top stocks",
        text: "Top Stocks",
        icon: "monitoring",
        onlyOnce: true,
      },
      { key: "weather", text: "Weather", icon: "wb_sunny" },
      { key: "battery", text: "Battery", icon: "battery_0_bar" },
      {
        key: "up next",
        text: "Upcoming tasks",
        icon: "home_storage",
      },
      {
        key: "recent activity",
        text: "Online friends",
        icon: "people",
      },
    ],
  },
  {
    text: "Utilities",
    widgets: [
      {
        key: "clock",
        text: "Clock",
        secondary: "Stopwatch, pomodoro & more",
        icon: "timer",
      },
      {
        key: "randomizer",
        text: "Randomizer",
        secondary: "Coin flip & dice",
        icon: "casino",
      },
      { key: "magic 8 ball", text: "Magic 8 Ball", icon: "counter_8" },
      { key: "counter", text: "Counter", icon: "tag", comingSoon: true },
    ],
  },
  {
    text: "Inspiration",
    widgets: [
      { key: "quotes", text: "Quotes", icon: "format_quote" },
      {
        key: "word of the day",
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
        key: "music",
        text: "Spotify Music",
        icon: "music_note",
        secondary: "With Spotify",
        onlyOnce: true,
      },
    ],
  },
];

function Widgets() {
  const theme = useColorTheme();
  const { sessionToken } = useUser();
  const { data, mutate } = useSWR(["user/focus-panel"]);
  const [loading, setLoading] = useState<string | boolean>(false);
  const [search, setSearch] = useState<string>("");
  const inputRef = useRef(null);

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
      router.back();
    } catch (e) {
      Toast.show({
        text1: "Something went wrong. Please try again later",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const sections = WIDGET_LIST.filter((t) =>
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
      <View>
        <TextField
          variant="filled+outlined"
          placeholder="Find your widget..."
          onChangeText={setSearch}
          inputRef={inputRef}
          onKeyPress={(e) => {
            if (e.nativeEvent.key === "Escape") router.back();
          }}
        />
      </View>
      <FlatList
        data={sections}
        contentContainerStyle={{
          paddingTop: 7,
          paddingBottom: 30,
        }}
        renderItem={({ item, index }: any) => (
          <View style={{ marginHorizontal: -10 }}>
            {item.header ? (
              <Text
                variant="eyebrow"
                style={{
                  marginTop: 17,
                  marginBottom: 3,
                  marginLeft: 5,
                  paddingHorizontal: 10,
                }}
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
                  router.back();
                }}
              >
                <Avatar
                  disabled
                  icon={
                    item.icon?.startsWith?.("https")
                      ? undefined
                      : (item.icon as any)
                  }
                  image={
                    item.icon?.startsWith?.("https") ? item.icon : undefined
                  }
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
            )}
          </View>
        )}
      />
    </>
  );
}

export default function Page() {
  const theme = useColorTheme();

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

  return (
    <>
      <MenuButton gradient icon="arrow_back_ios_new" back left />
      <ScrollView>
        <ArcSystemBar />
        <View style={{ paddingHorizontal: 25 }}>
          <Text
            style={{
              fontFamily: "serifText800",
              color: theme[11],
              fontSize: 35,
              marginTop: 100,
              marginBottom: 20,
            }}
          >
            Widgets
          </Text>
          <Widgets />
        </View>
      </ScrollView>
    </>
  );
}

