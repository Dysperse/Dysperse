import {
  BottomSheetFlatList,
  BottomSheetModal,
  TouchableOpacity,
} from "@gorhom/bottom-sheet";
import { useColorTheme } from "../color/theme-provider";
import {
  cloneElement,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import BottomSheet from "../BottomSheet";
import { View } from "react-native";
import TextField from "../TextArea";
import Emoji from "../Emoji";
import Text from "../Text";
import ErrorAlert from "../Error";
import useSWR from "swr";
import Icon from "../Icon";

const emojiPickerStyles = StyleSheet.create({
  container: {
    padding: 15,
    paddingTop: 10,
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  emptyHeading: { fontSize: 35, marginTop: 10 },
  emptySubHeading: { opacity: 0.6, textAlign: "center", maxWidth: 200 },
  button: {
    padding: 10,
    flex: 1,
    borderRadius: 999,
  },
});

export function EmojiPicker({ children, emoji, setEmoji }: any) {
  const theme = useColorTheme();
  const ref = useRef<BottomSheetModal>(null);
  const [query, setQuery] = useState("");

  const handleOpen = useCallback(() => {
    ref.current?.present();
    setQuery("");
  }, []);

  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  const { data, error } = useSWR([
    "data",
    {},
    "https://cdn.jsdelivr.net/npm/@emoji-mart",
  ]);

  const filteredData = useMemo(() => {
    return data?.emojis
      ? Object.keys(data.emojis).filter(
          (e) =>
            data.emojis[e].keywords.some((k) => k.includes(query)) ||
            data.emojis[e].name.toLowerCase().includes(query)
        )
      : [];
  }, [data, query]);

  const handleEmojiChange = useCallback(
    (e) => {
      const emoji = data.emojis[e].skins[0].unified;
      setEmoji(emoji);
      handleClose();
    },
    [setEmoji, data, handleClose]
  );

  const EmojiItem = memo(({ item }: any) => (
    <Pressable
      onPress={() => handleEmojiChange(item)}
      style={({ pressed, hovered }: any) => [
        emojiPickerStyles.button,
        {
          backgroundColor: theme[pressed ? 4 : hovered ? 3 : 2],
        },
      ]}
    >
      <Text style={{ fontSize: 30, textAlign: "center" }}>
        {data?.emojis?.[item]?.skins?.[0]?.native}
      </Text>
    </Pressable>
  ));

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        snapPoints={["70%"]}
        onClose={handleClose}
        stackBehavior="push"
      >
        {data ? (
          <View style={emojiPickerStyles.container}>
            <View style={emojiPickerStyles.searchContainer}>
              <TouchableOpacity onPress={handleClose}>
                <Icon>close</Icon>
              </TouchableOpacity>
              <TextField
                style={{ flex: 1 }}
                bottomSheet
                variant="filled"
                placeholder="Find an emoji..."
                onChangeText={(e) => setQuery(e.toLowerCase())}
              />
            </View>
            <BottomSheetFlatList
              data={filteredData}
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              ListEmptyComponent={
                <View style={emojiPickerStyles.emptyContainer}>
                  <Emoji emoji="1f62d" size={50} />
                  <Text heading style={emojiPickerStyles.emptyHeading}>
                    No emojis
                  </Text>
                  <Text style={emojiPickerStyles.emptySubHeading}>
                    Couldn't find any emojis matching your search!
                  </Text>
                </View>
              }
              renderItem={({ item }) => <EmojiItem item={item} />}
              keyExtractor={(item) => item}
              numColumns={4}
              columnWrapperStyle={{
                justifyContent: "space-between",
                gap: 10,
              }}
            />
          </View>
        ) : error ? (
          <ErrorAlert />
        ) : (
          <ActivityIndicator />
        )}
      </BottomSheet>
    </>
  );
}
