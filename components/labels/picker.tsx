import { CreateLabelModal } from "@/components/labels/createModal";
import { useLabelColors } from "@/components/labels/useLabelColors";
import BottomSheet, { DBottomSheetProps } from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal, useBottomSheet } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import React, {
  cloneElement,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Pressable, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import useSWR from "swr";
import { labelPickerStyles } from "./labelPickerStyles";

const Search = ({ query, setQuery, autoFocus }) => {
  const theme = useColorTheme();
  const searchRef = useRef(null);
  const { forceClose } = useBottomSheet();

  useEffect(() => {
    if (autoFocus) {
      searchRef.current.focus({ preventScroll: true });
    }
  }, [autoFocus]);

  return (
    <TextField
      enterKeyHint="search"
      value={query}
      onChangeText={setQuery}
      bottomSheet
      style={{
        backgroundColor: theme[3],
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 99,
        shadowRadius: 0,
        flex: 1,
        fontSize: 20,
      }}
      onKeyPress={({ nativeEvent }) => {
        if (nativeEvent.key === "Escape") {
          forceClose();
        }
      }}
      inputRef={searchRef}
      // autoFocus={Platform.OS !== "web" && autoFocus}
      placeholder="Search…"
    />
  );
};
function CollectionChips({
  collections,
  selectedCollection,
  setSelectedCollection,
}: any) {
  const ref = useRef(null);
  useEffect(() => {
    if (selectedCollection) {
      ref.current?.scrollToIndex({
        index: collections.findIndex((c) => c.id === selectedCollection),
      });
    }
  }, [selectedCollection, collections]);
  return (
    <View style={{ padding: 10, gap: 10 }}>
      {collections.length !== 0 && <Text variant="eyebrow">Collections</Text>}
      <FlatList
        horizontal
        ref={ref}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise((resolve) => setTimeout(resolve, 500));
          wait.then(() => {
            ref.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          });
        }}
        renderItem={({ item }) => (
          <Chip
            key={item.id}
            outlined={selectedCollection && selectedCollection !== item.id}
            icon={<Emoji emoji={item.emoji || "270c"} size={20} />}
            label={
              <>
                <Text>{item.name}</Text>
                {selectedCollection === item.id && <Icon>check</Icon>}
              </>
            }
            onPress={() =>
              setSelectedCollection((i) => (i === item.id ? null : item.id))
            }
          />
        )}
        data={collections}
        contentContainerStyle={{ gap: 10 }}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const CloseButton = memo(function CloseButton({
  onClose,
  disabled,
}: {
  onClose: any;
  disabled?: boolean;
}) {
  const { close } = useBottomSheet();
  const [loading, setLoading] = useState(false);

  const handleClose = useCallback(async () => {
    setLoading(true);
    await onClose?.();
    close();
    setLoading(false);
  }, [close, onClose]);

  return (
    <Button
      onPress={handleClose}
      disabled={disabled}
      containerStyle={{ marginLeft: "auto" }}
    >
      {loading ? <Spinner /> : <ButtonText>Done</ButtonText>}
    </Button>
  );
});

const LabelPicker = memo(function LabelPicker({
  children,
  label,
  setLabel,
  onClose,
  autoFocus = true,
  multiple = false,
  hideBack = false,
  triggerProp = "onPress",
  sheetProps = {},
  disabled = false,
  defaultCollection,
}: {
  children: React.ReactElement;
  label?: string | any[] | { id: string; name: string; emoji: string };
  setLabel: (label: string | string[]) => void;
  onClose?: any;
  autoFocus?: boolean;
  multiple?: boolean;
  hideBack?: boolean;
  triggerProp?: string;
  sheetProps?: Partial<DBottomSheetProps>;
  disabled?: boolean;
  defaultCollection?: string;
}) {
  const _ref = useRef<BottomSheetModal>(null);
  const ref = sheetProps.sheetRef || _ref;
  const [query, setQuery] = useState("");
  // callbacks
  const searchRef = useRef(null);

  const handleOpen = useCallback(() => {
    ref.current?.present();
  }, [ref]);

  const handleClose = useCallback(async () => {
    await onClose?.();
    ref.current?.close();
  }, [ref, onClose]);

  const trigger = cloneElement(children, {
    [triggerProp]: disabled ? undefined : handleOpen,
  });

  const theme = useColorTheme();
  const colors = useLabelColors();

  const { data, mutate, error } = useSWR(["space/labels"]);

  const [selectedCollection, setSelectedCollection] =
    useState(defaultCollection);

  const collections = Array.isArray(data)
    ? data
        ?.map((l) => l.collections.map((c) => c))
        ?.flat()
        ?.filter((c, i, arr) => arr.findIndex((a) => a.id === c.id) === i) || []
    : [];

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        onClose={handleClose}
        snapPoints={["80%"]}
        keyboardBehavior="interactive"
        enableContentPanningGesture={false}
        {...sheetProps}
      >
        <View
          style={{
            padding: 15,
            height: "100%",
            paddingBottom: 0,
          }}
        >
          {multiple && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                marginBottom: 10,
              }}
            >
              <Text weight={900} style={{ fontSize: 30, textAlign: "center" }}>
                Select labels
              </Text>

              <CloseButton
                disabled={Array.isArray(label) && label.length === 0}
                onClose={onClose}
              />
            </View>
          )}
          <View
            style={[
              labelPickerStyles.searchBox,
              {
                backgroundColor: theme[3],
                borderColor: theme[6],
              },
            ]}
          >
            {!hideBack && (
              <IconButton onPress={handleClose}>
                <Icon>arrow_back_ios_new</Icon>
              </IconButton>
            )}
            <Search query={query} setQuery={setQuery} autoFocus={autoFocus} />
            <CreateLabelModal
              mutate={mutate}
              onClose={() => searchRef.current?.focus()}
              onCreate={(item) => {
                if (multiple && Array.isArray(label)) {
                  if (label.includes(item.id) && typeof label === "object") {
                    setLabel(label.filter((id) => id !== item.id));
                  } else {
                    setLabel([...label, item.id]);
                  }
                } else {
                  setLabel(item.id === (label as any)?.id ? null : item);
                  setTimeout(handleClose, 0);
                }
              }}
            >
              <IconButton style={{ marginRight: 20 }} size={30}>
                <Icon>add_circle</Icon>
              </IconButton>
            </CreateLabelModal>
          </View>
          {Array.isArray(data) ? (
            <FlashList
              estimatedItemSize={55}
              data={data
                .filter((label) =>
                  label.name.toLowerCase().includes(query.toLowerCase())
                )
                .filter((label) =>
                  selectedCollection
                    ? label.collections
                        ?.map((c) => c?.id)
                        .includes(selectedCollection)
                    : true
                )}
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1 }}
              ListHeaderComponent={
                <>
                  <CollectionChips
                    collections={collections}
                    selectedCollection={selectedCollection}
                    setSelectedCollection={setSelectedCollection}
                  />
                  <View
                    style={{
                      padding: 10,
                      paddingBottom: 0,
                      paddingTop: collections.length === 0 ? 0 : 10,
                    }}
                  >
                    {collections.length > 0 && (
                      <Text variant="eyebrow">Labels</Text>
                    )}
                  </View>
                </>
              }
              contentContainerStyle={{ paddingBottom: 100 }}
              ListEmptyComponent={
                <View
                  style={{
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 70,
                    paddingHorizontal: 20,
                    gap: 5,
                  }}
                >
                  <Emoji emoji={query ? "1f914" : "1f62d"} size={50} />
                  <Text style={{ fontSize: 35, marginTop: 10 }}>
                    {query ? "No labels found" : "No labels yet"}
                  </Text>
                  <Text style={{ opacity: 0.6, textAlign: "center" }}>
                    {query
                      ? "Try searching for something else"
                      : "Labels are a great way to \n group things together"}
                  </Text>
                  {query === "" && (
                    <CreateLabelModal mutate={mutate}>
                      <Button>
                        <Icon>add</Icon>
                        <ButtonText>Create one</ButtonText>
                      </Button>
                    </CreateLabelModal>
                  )}
                </View>
              }
              renderItem={({ item }: any) => (
                <Pressable
                  onPress={() => {
                    if (multiple && Array.isArray(label)) {
                      if (
                        label.includes(item.id) &&
                        typeof label === "object"
                      ) {
                        setLabel(label.filter((id) => id !== item.id));
                      } else {
                        setLabel([...label, item.id]);
                      }
                    } else {
                      setLabel(item.id === (label as any)?.id ? null : item);
                      setTimeout(handleClose, 0);
                    }
                  }}
                  style={({ pressed, hovered }) => [
                    labelPickerStyles.labelOption,
                    {
                      backgroundColor:
                        theme[
                          (pressed ? 4 : hovered ? 3 : 2) +
                            ((multiple &&
                              ((label as any)?.id || label).includes(
                                item.id
                              )) ||
                            (!multiple &&
                              ((label as any)?.id || label) == item.id)
                              ? 1
                              : 0)
                        ],
                    },
                  ]}
                >
                  <View
                    style={[
                      labelPickerStyles.labelDot,
                      {
                        backgroundColor: colors[item.color][5],
                      },
                    ]}
                  >
                    <Emoji emoji={item.emoji} size={20} />
                  </View>
                  <ListItemText
                    primary={item.name}
                    secondary={`${item._count.entities} item${
                      item._count.entities !== 1 ? "s" : ""
                    }`}
                  />
                  {((label as any)?.id == item.id || multiple) && (
                    <Icon
                      filled={
                        multiple &&
                        Array.isArray(label) &&
                        label.includes(item.id)
                      }
                      size={30}
                    >
                      {(label as any)?.id == item.id ||
                      (multiple &&
                        Array.isArray(label) &&
                        label.includes(item.id))
                        ? "check_circle"
                        : "circle"}
                    </Icon>
                  )}
                </Pressable>
              )}
            />
          ) : error ? (
            <ErrorAlert />
          ) : (
            <Spinner />
          )}
        </View>
      </BottomSheet>
    </>
  );
});

export default LabelPicker;
