import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SectionList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  sectionHeader: {
    paddingTop: 10,
    paddingLeft: 25,
    paddingRight: 10,
    paddingBottom: 0,
    fontSize: 14,
    textTransform: "uppercase",
    opacity: 0.6,
    fontFamily: "body_700",
  },
});

function Button({ section, item }) {
  const [loading, setLoading] = useState(false);
  const redPalette = useColor("red", false);
  const purplePalette = useColor("purple", false);
  const { session } = useSession();
  const colors = { redPalette, purplePalette };

  const handlePress = async (item) => {
    try {
      setLoading(true);
      const res = await sendApiRequest(
        session,
        "POST",
        "user/tabs",
        {
          ...(item.collection
            ? {
                boardId: item.collection.id,
              }
            : {
                tabData: JSON.stringify({
                  href: item.href,
                  icon: item.icon,
                  label: item.label,
                }),
              }),
        },
        null
      );
      console.log(res);
      router.push(item.href);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      alert("Something went wrong. Please try again later");
    }
  };

  return (
    <Pressable
      className="active:bg-gray-200 flex-row items-center py-2 px-6"
      onPress={() => handlePress(item)}
      style={{ gap: 20 }}
    >
      <LinearGradient
        className="w-12 h-12 flex items-center rounded-2xl justify-center"
        colors={[
          colors[
            section.title === "Collections" ? "purplePalette" : "redPalette"
          ][5],
          colors[
            section.title === "Collections" ? "purplePalette" : "redPalette"
          ][8],
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {item.collection ? (
          <Emoji size={30} emoji={item.collection.emoji || "1f4e6"} />
        ) : (
          <Icon size={30}>{item.icon}</Icon>
        )}
      </LinearGradient>
      <Text textClassName="flex-1">{item?.collection?.name || item.label}</Text>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <TouchableOpacity
          style={{ opacity: 0.4 }}
          onPress={(e) => {
            e.stopPropagation();
            Alert.alert("Help", "Coming soon!");
          }}
        >
          <Icon size={24}>info</Icon>
        </TouchableOpacity>
      )}
    </Pressable>
  );
}

export const getSidebarItems = async (session) => {
  const req = await sendApiRequest(session, "GET", "space/tasks/boards", {});

  return [
    {
      title: "Perspectives",
      data: [
        {
          label: "Weeks",
          icon: "calendar_view_week",
          href: "/perspectives/agenda/week/" + dayjs().format("YYYY-MM-DD"),
        },
        {
          label: "Months",
          icon: "calendar_view_month",
          href: "/perspectives/agenda/month/" + dayjs().format("YYYY-MM-DD"),
        },
        {
          label: "Years",
          icon: "view_compact",
          href: "/perspectives/agenda/year/" + dayjs().format("YYYY-MM-DD"),
        },
        {
          label: "Upcoming",
          icon: "calendar_clock",
          href: "/perspectives/backlog",
        },
        {
          label: "Backlog",
          icon: "event_upcoming",
          href: "/perspectives/upcoming",
        },
        {
          label: "Unscheduled",
          icon: "history_toggle_off",
          href: "/perspectives/unscheduled",
        },
        {
          label: "Completed",
          icon: "check_circle",
          href: "/perspectives/completed",
        },
        {
          label: "Difficulty",
          icon: "priority_high",
          href: "/perspectives/difficulty",
        },
      ],
    },
    {
      title: "Collections",
      data: [
        {
          label: "Create",
          icon: "add",
          href: "/collections/create",
        },
        ...(req && Array.isArray(req)
          ? req.map((collection) => ({
              collection,
              href: `/collections/${collection.id}`,
            }))
          : [{}]),
      ],
    },
  ];
};

export default function Page() {
  const [query, setQuery] = useState("");
  const { top } = useSafeAreaInsets();
  const { session } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    getSidebarItems(session).then((sections) => {
      setData(sections);
      setIsLoading(false);
    });
  }, []);

  const filteredSections = data
    .map((section) => ({
      ...section,
      data: section.data.filter(
        (item) =>
          item?.label?.toLowerCase()?.includes(query.toLowerCase()) ||
          item?.collection?.name?.toLowerCase()?.includes(query.toLowerCase())
      ),
    }))
    .filter((section) => section.data.length > 0);

  return isLoading ? (
    <ActivityIndicator />
  ) : (
    <SectionList
      ListHeaderComponent={
        <>
          <Text
            textClassName="mt-5"
            style={{
              fontSize: 50,
              marginTop: top + 64 + 20,
              fontFamily: "heading",
              paddingLeft: 25,
              textTransform: "uppercase",
            }}
          >
            Open
          </Text>
          <View className="px-6 mb-3">
            <TextInput
              value={query}
              onChangeText={(t) => setQuery(t)}
              className="bg-gray-200 px-5 py-1.5 rounded-2xl focus:bg-gray-100 border-2 border-transparent focus:border-gray-300"
              placeholder="Search..."
              placeholderTextColor="#a0a0a0"
            />
          </View>
        </>
      }
      ListFooterComponent={<View className="mb-10" />}
      sections={filteredSections}
      ListEmptyComponent={
        <View className="items-center pt-10 h-full">
          <Emoji emoji="1F62D" size={40} />
          <Text
            textClassName="mt-3"
            style={{ fontFamily: "body_600", fontSize: 17 }}
          >
            No results found
          </Text>
        </View>
      }
      renderItem={({ item, section }) => (
        <Button item={item} section={section} />
      )}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      keyExtractor={(item) => `basicListEntry-${item.href}`}
    />
  );
}
