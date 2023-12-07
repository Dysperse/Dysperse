import {
  Alert,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Icon from "../../../ui/icon";
import { useState } from "react";
import { TouchableOpacity } from "react-native";
import Emoji from "../../../ui/emoji";

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

const defaultSections = [
  {
    title: "Perspectives",
    data: [
      {
        label: "Weeks",
        icon: "calendar_view_week",
        href: "/perspectives/agenda/weeks",
      },
      {
        label: "Months",
        icon: "calendar_view_month",
        href: "/perspectives/agenda/months",
      },
      {
        label: "Years",
        icon: "view_compact",
        href: "/perspectives/agenda/years",
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
    ],
  },
];

const views = [{ name: "Weeks", icon: "", href: "" }];

export default function Page() {
  const [query, setQuery] = useState("");

  const filteredSections = defaultSections
    .map((section) => ({
      ...section,
      data: section.data.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((section) => section.data.length > 0);

  return (
    <SectionList
      ListHeaderComponent={
        <>
          <Text
            className="mt-5"
            style={{
              fontSize: 50,
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
            className="mt-3"
            style={{ fontFamily: "body_600", fontSize: 17 }}
          >
            No results found
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          className="active:bg-gray-200 flex-row items-center gap-x-3 py-2 px-6"
          onPress={() => {
            alert("Coming soon");
          }}
        >
          <View className="w-12 h-12 bg-gray-100 flex items-center rounded-2xl justify-center group-active:bg-red-500">
            <Icon size={30}>{item.icon}</Icon>
          </View>
          <Text style={{ flexGrow: 1 }}>{item.label}</Text>

          <TouchableOpacity
            style={{ opacity: 0.4 }}
            onPress={(e) => {
              e.stopPropagation();
              Alert.alert("Help", "Coming soon!");
            }}
          >
            <Icon size={24}>info</Icon>
          </TouchableOpacity>
        </Pressable>
      )}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      keyExtractor={(item) => `basicListEntry-${item.href}`}
    />
  );
}
