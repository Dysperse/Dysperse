import { useSession } from "@/context/AuthProvider";
import BottomSheet from "@/ui/BottomSheet";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import useKeyboardShortcut from "use-keyboard-shortcut";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Platform,
  SectionList,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { createTab, getSidebarItems } from "../sidebar";
import { useUser } from "@/context/useUser";
import useSWR from "swr";

interface CommandPaletteContextValue {
  openPalette: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue>({
  openPalette: () => null,
});

export const useCommandPalette = () => {
  return useContext(CommandPaletteContext);
};

const commandPaletteStyles = StyleSheet.create({
  input: {
    fontSize: 18,
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerContainer: {
    flexDirection: "row",
    padding: 10,
    paddingHorizontal: 15,
    gap: 10,
    paddingBottom: 5,
    alignItems: "center",
    justifyContent: "space-between",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    height: 210,
  },
});

function Button({ item }: any) {
  const [loading, setLoading] = useState(false);
  const { sessionToken } = useUser();

  const { mutate } = useSWR(["user/tabs"]);

  const handlePress = async (tab) => {
    try {
      setLoading(true);
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
        paddingHorizontal: 20,
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
      {loading && <ActivityIndicator />}
    </TouchableOpacity>
  );
}

function PaletteList({ query }: { query: string }) {
  const theme = useColorTheme();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

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

  return isLoading ? (
    <ActivityIndicator />
  ) : (
    <SectionList
      sections={filteredSections}
      ListEmptyComponent={
        <View style={commandPaletteStyles.emptyContainer}>
          <Emoji emoji="1F62D" size={40} />
          <Text style={{ fontSize: 20 }} weight={200}>
            No results found
          </Text>
        </View>
      }
      contentContainerStyle={{ paddingBottom: 30 }}
      style={{ height: 250 }}
      renderItem={({ item }) => <Button item={item} />}
      renderSectionHeader={({ section }) =>
        section.title === "ALL" ? (
          <View style={{ paddingHorizontal: 20 }}>
            <View
              style={{
                height: 2,
                backgroundColor: theme[4],
                borderRadius: 9,
                marginVertical: 10,
              }}
            />
            <Text variant="eyebrow" style={{ marginBottom: 10, marginTop: 6 }}>
              {section.title}
            </Text>
          </View>
        ) : (
          <Text
            variant="eyebrow"
            style={{
              paddingHorizontal: 20,
              marginBottom: 10,
              marginTop: 20,
            }}
          >
            {section.title}
          </Text>
        )
      }
      keyExtractor={(item: any) => item.slug + JSON.stringify(item.params)}
    />
  );
}

export function CommandPaletteProvider({ children }) {
  const theme = useColorTheme();

  const ref = useRef<BottomSheetModal>(null);
  const { width } = useWindowDimensions();

  // callbacks
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);

  const [query, setQuery] = useState("");

  useKeyboardShortcut(["Control", "K"], () => handleOpen(), {
    overrideSystem: true,
    ignoreInputFields: true,
    repeatOnHold: false,
  });

  return (
    <CommandPaletteContext.Provider value={{ openPalette: handleOpen }}>
      {children}
      <BottomSheet
        detached
        sheetRef={ref}
        snapPoints={["100%"]}
        maxWidth={width}
        handleComponent={() => null}
        backgroundStyle={{
          backgroundColor: "transparent",
          borderRadius: 0,
        }}
        // backdropComponent={() => null}
        onClose={handleClose}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            width: "100%",
          }}
        >
          <View
            style={{
              padding: 20,
              paddingTop: 100,
              width: "100%",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "100%",
                maxWidth: 600,
                shadowColor: theme[9],
                shadowRadius: 100,
                backgroundColor: theme[2],
                borderColor: theme[5],
                borderRadius: 20,
                borderWidth: 1,
                shadowOpacity: 1,
                elevation: 50,
              }}
            >
              <View style={commandPaletteStyles.headerContainer}>
                <Chip
                  dense
                  icon={<Icon>electric_bolt</Icon>}
                  label="Jump"
                  textStyle={{ fontSize: 16 }}
                  style={{ borderRadius: 10 }}
                />
                <TouchableOpacity onPress={handleClose} style={{ padding: 10 }}>
                  <Icon style={{ color: theme[8] }}>expand_more</Icon>
                </TouchableOpacity>
              </View>
              <TextField
                onKeyPress={(e) => e.key === "Escape" && handleClose()}
                bottomSheet
                placeholder="Search labels, tasks, notes, & more..."
                placeholderTextColor={theme[6]}
                style={[
                  commandPaletteStyles.input,
                  {
                    ...(Platform.OS === "web" && ({ outline: "none" } as any)),
                  },
                ]}
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
              <PaletteList query={query} />
            </View>
          </View>
        </View>
      </BottomSheet>
    </CommandPaletteContext.Provider>
  );
}
