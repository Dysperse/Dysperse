import { getSidebarItems } from "@/components/layout/command-palette/list";
import { createTab } from "@/components/layout/openTab";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import useSWR from "swr";

const paletteStyles = StyleSheet.create({
  navbar: { flexDirection: "row", padding: 15 },
  container: { padding: 20, paddingTop: 0, flex: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 25,
    fontSize: 20,
    paddingVertical: 20,
  },
  quickCreateContainer: {
    gap: 15,
    flexDirection: "row",
  },
  quickCreateCard: {
    borderWidth: 1,
    borderRadius: 20,
    flex: 1,
    padding: 15,
    height: 100,
    gap: 3,
    justifyContent: "flex-end",
  },
});

function Button({ item }: any) {
  const [loading, setLoading] = useState(false);
  const { sessionToken } = useUser();

  const { mutate } = useSWR(["user/tabs"]);

  const handlePress = async (tab) => {
    try {
      setLoading(true);
      if (tab.onPress) {
        await tab.onPress();
        setLoading(false);
        return;
      }
      await createTab(sessionToken, tab);
      await mutate();
      setLoading(false);
    } catch (e) {
      setLoading(false);
      alert("Something went wrong. Please try again later");
    }
  };

  return (
    <TouchableOpacity
      style={{
        paddingVertical: 7,
        flexDirection: "row",
        gap: 15,
        alignItems: "center",
      }}
      onPress={() => handlePress(item)}
    >
      {item.collection ? (
        <Emoji size={23} emoji={item.collection.emoji || "1f4e6"} />
      ) : (
        <Icon size={23}>{item.icon}</Icon>
      )}
      <Text style={{ flex: 1 }}>{item?.collection?.name || item.label}</Text>
      {loading && <Spinner />}
    </TouchableOpacity>
  );
}
export default function Page() {
  const { session } = useSession();
  const theme = useColorTheme();
  const handleBack = useCallback(() => router.back(), []);

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getSidebarItems(session).then((sections) => {
      setData(sections);
      setIsLoading(false);
    });
  }, [session]);

  const filteredSections = data
    .filter((section) => {
      if (query === "") return true;
      return section.data.some((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      );
    })
    .map((section) => ({
      ...section,
      data: section.data.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      ),
    }));

  return (
    <>
      <View style={paletteStyles.navbar}>
        <IconButton variant="outlined" size={55} onPress={handleBack}>
          <Icon>close</Icon>
        </IconButton>
      </View>
      <View style={paletteStyles.container}>
        <TextField
          value={query}
          onChangeText={setQuery}
          placeholder="Jump to..."
          // autoFocus
          style={[
            paletteStyles.input,
            { borderColor: theme[5], backgroundColor: theme[3] },
          ]}
        />
        <View style={{ marginTop: 15, flex: 1 }}>
          {query === "" && (
            <>
              <Text
                variant="eyebrow"
                style={{ marginVertical: 10, marginLeft: 5 }}
              >
                Quick create
              </Text>
              <View style={paletteStyles.quickCreateContainer}>
                {[
                  { name: "Task", icon: "check_circle" },
                  { name: "Note", icon: "sticky_note_2" },
                  { name: "Item", icon: "inventory_2" },
                ].map((card) => (
                  <Pressable
                    key={card.name}
                    style={({ pressed }) => [
                      paletteStyles.quickCreateCard,
                      {
                        borderColor: theme[5],
                        backgroundColor: theme[pressed ? 3 : 1],
                      },
                    ]}
                  >
                    <Icon size={30} style={{ marginLeft: -3 }}>
                      {card.icon}
                    </Icon>
                    <Text style={{ color: theme[11] }} weight={900}>
                      {card.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          <SectionList
            sections={filteredSections}
            ListEmptyComponent={
              <View style={{ flex: 1 }}>
                <Emoji emoji="1F62D" size={40} />
                <Text style={{ fontSize: 20 }} weight={200}>
                  No results found
                </Text>
              </View>
            }
            style={{
              paddingHorizontal: 5,
              flex: 1,
              ...(Platform.OS == "web" && {
                height: 300,
                maxHeight: 300,
                minHeight: 300,
              }),
            }}
            renderItem={({ item }) => <Button item={item} />}
            renderSectionHeader={({ section }) =>
              section.title === "ALL" ? (
                <Text
                  variant="eyebrow"
                  style={{ marginBottom: 10, marginTop: 6 }}
                >
                  {section.title}
                </Text>
              ) : (
                <Text
                  variant="eyebrow"
                  style={{
                    marginBottom: 10,
                    marginTop: 20,
                  }}
                >
                  {section.title}
                </Text>
              )
            }
            keyExtractor={(item: any) =>
              item.slug + JSON.stringify(item.params) || item.label
            }
          />
        </View>
      </View>
    </>
  );
}
