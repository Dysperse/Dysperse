import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import {
  ReactElement,
  cloneElement,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";
import useSWR from "swr";
import BottomSheet from "../BottomSheet";
import Emoji from "../Emoji";
import ErrorAlert from "../Error";
import Icon from "../Icon";
import IconButton from "../IconButton";
import Spinner from "../Spinner";
import Text from "../Text";
import TextField from "../TextArea";

const emojiPickerStyles = StyleSheet.create({
  container: {
    padding: 5,
    paddingTop: 5,
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 15,
  },
  closeButton: {
    marginLeft: 15,
    marginBottom: 15,
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
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    borderRadius: 999,
  },
});

export function EmojiPicker({
  children,
  setEmoji,
}: {
  children: ReactElement;
  setEmoji: (emoji: string) => void;
}) {
  const ref = useRef<BottomSheetModal>(null);
  const [query, setQuery] = useState("");

  const handleOpen = useCallback(() => {
    ref.current?.present();
    setQuery("");
  }, []);

  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  const { data, error } = useSWR(
    "https://assets.dysperse.com/emojis.json",
    (e) => fetch(e).then((r) => r.json())
  );

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
      style={({ pressed }) => [
        emojiPickerStyles.button,
        { opacity: pressed ? 0.5 : 1 },
      ]}
    >
      <Text style={{ fontSize: 30, textAlign: "center", width: 40 }}>
        {data?.emojis?.[item]?.skins?.[0]?.native}
      </Text>
    </Pressable>
  ));

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        snapPoints={["80%"]}
        enableContentPanningGesture={false}
        onClose={handleClose}
        stackBehavior="push"
      >
        {data ? (
          <View style={emojiPickerStyles.container}>
            <IconButton
              size={55}
              variant="outlined"
              style={emojiPickerStyles.closeButton}
              onPress={handleClose}
            >
              <Icon>close</Icon>
            </IconButton>
            <View style={emojiPickerStyles.searchContainer}>
              <TextField
                style={{
                  flex: 1,
                  paddingVertical: 15,
                  paddingHorizontal: 20,
                  fontSize: 20,
                }}
                bottomSheet
                variant="filled+outlined"
                placeholder="Find an emoji…"
                onChangeText={(e) => setQuery(e.toLowerCase())}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FlashList
                keyboardShouldPersistTaps="handled"
                data={filteredData}
                estimatedItemSize={117.5}
                contentContainerStyle={{ paddingTop: 10 }}
                ListEmptyComponent={
                  <View style={emojiPickerStyles.emptyContainer}>
                    <Emoji emoji="1f62d" size={50} />
                    <Text style={emojiPickerStyles.emptyHeading}>
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
              />
            </View>
          </View>
        ) : error ? (
          <ErrorAlert />
        ) : (
          <Spinner />
        )}
      </BottomSheet>
    </>
  );
}

