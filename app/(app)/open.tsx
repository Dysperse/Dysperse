import { getSidebarItems } from "@/components/layout/command-palette/list";
import { createTab } from "@/components/layout/openTab";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { Avatar } from "@/ui/Avatar";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { memo, useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import useSWR from "swr";

const paletteStyles = StyleSheet.create({
  navbar: { flexDirection: "row", padding: 15 },
  container: { flex: 1 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 25,
    fontSize: 20,
    paddingVertical: 20,
  },
  inputContainer: {
    position: "relative",
    flexDirection: "row",
    paddingHorizontal: 20,
    alignItems: "center",
    height: 65,
  },
  clearInputButton: {
    position: "absolute",
    right: 30,
    top: 15,
  },
  quickCreateContainer: {
    gap: 10,
    marginTop: 5,
    flexDirection: "row",
  },
  contentContainer: {
    paddingTop: 15,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  quickCreateCard: {
    borderWidth: 1,
    borderRadius: 15,
    flex: 1,
    padding: 15,
    paddingVertical: 10,
    height: 100,
    gap: 3,
    justifyContent: "flex-end",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    gap: 13,
    marginTop: 15,
    alignItems: "center",
    marginBottom: 5,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 15,
    paddingHorizontal: 15,
  },
});

function Button({ item }: any) {
  const [loading, setLoading] = useState(false);
  const { sessionToken } = useUser();
  const theme = useColorTheme();

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
      style={paletteStyles.button}
      onPress={() => handlePress(item)}
    >
      <Avatar
        icon={item.icon}
        style={{ backgroundColor: "transparent" }}
        size={20}
      >
        {item.collection && (
          <Emoji size={23} emoji={item.collection.emoji || "1f4e6"} />
        )}
      </Avatar>
      <Text style={{ flex: 1, color: theme[11] }}>
        {item?.collection?.name || item.label}
      </Text>
      {loading && <Spinner />}
    </TouchableOpacity>
  );
}

const Header = memo(({ handleBack }: any) => (
  <View style={paletteStyles.navbar}>
    <IconButton variant="outlined" size={55} onPress={handleBack}>
      <Icon>close</Icon>
    </IconButton>
  </View>
));
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
  const handleClear = () => setQuery("");

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <Header handleBack={handleBack} />
      <View style={paletteStyles.container}>
        <View style={paletteStyles.inputContainer}>
          <TextField
            contextMenuHidden
            value={query}
            onChangeText={setQuery}
            placeholder="Jump to..."
            // autoFocus
            style={[
              paletteStyles.input,
              { borderColor: theme[5], backgroundColor: theme[3] },
            ]}
          />
          {query !== "" && (
            <IconButton
              onPress={handleClear}
              style={paletteStyles.clearInputButton}
            >
              <Icon>close</Icon>
            </IconButton>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <FlashList
            contentContainerStyle={paletteStyles.contentContainer}
            ListHeaderComponent={
              query === "" && (
                <>
                  <View style={paletteStyles.sectionTitleContainer}>
                    <Avatar>
                      <Icon>add</Icon>
                    </Avatar>
                    <Text variant="eyebrow">Quick create</Text>
                  </View>
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
              )
            }
            estimatedItemSize={50}
            data={
              // workaround section list because it doesn't use reanimated. flatten the filteredSections array. copy headings too
              filteredSections.flatMap((section) => [
                { ...section, data: [] },
                ...section.data,
              ])
            }
            renderItem={({ item }) =>
              item.data ? (
                <View style={paletteStyles.sectionTitleContainer}>
                  <Avatar theme={item.theme} icon={item.icon} />
                  <Text variant="eyebrow">{item.title}</Text>
                </View>
              ) : (
                <Button item={item} />
              )
            }
            keyExtractor={(item: any) =>
              item.slug + JSON.stringify(item.params) || item.title
            }
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
