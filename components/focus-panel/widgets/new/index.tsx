import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Avatar } from "@/ui/Avatar";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import { StackNavigationProp } from "@react-navigation/stack";
import { LexoRank } from "lexorank";
import { useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { SpotifySvg, UpcomingSvg, Widget } from "../../panel";

export function NewWidget({
  navigation,
}: {
  navigation: StackNavigationProp<any>;
}) {
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
    // { text: "Sports", icon: "sports_football" },
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
            style={{ borderRadius: 15 }}
          />
          <ListItemText primary={option.text} secondary={option.secondary} />
          {loading === option.text && <Spinner />}
        </ListItemButton>
      ))}
    </ScrollView>
  );
}
