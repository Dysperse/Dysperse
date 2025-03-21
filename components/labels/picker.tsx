import { CreateLabelModal } from "@/components/labels/createModal";
import { useLabelColors } from "@/components/labels/useLabelColors";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { DBottomSheetProps } from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Modal from "@/ui/Modal";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal, useBottomSheet } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import fuzzysort from "fuzzysort";
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
          forceClose({ duration: 0.0001, overshootClamping: true });
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
  const theme = useColorTheme();

  useEffect(() => {
    const t = collections.findIndex((c) => c.id === selectedCollection);
    if (t !== -1) ref.current?.scrollToIndex({ index: t });
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
          <Button
            chip
            key={item.id}
            variant={
              selectedCollection && selectedCollection !== item.id
                ? "outlined"
                : undefined
            }
            height={35}
            containerStyle={{ borderRadius: 15 }}
            icon={<Emoji emoji={item.emoji || "270c"} size={20} />}
            text={
              <>
                <Text style={{ color: theme[11] }}>{item.name}</Text>
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

const CloseButton = memo(function CloseButton({ onClose }: { onClose: any }) {
  const { forceClose } = useBottomSheet();
  const [loading, setLoading] = useState(false);

  const handleClose = useCallback(async () => {
    setLoading(true);
    await onClose?.();
    forceClose({ duration: 0.0001, overshootClamping: true });
    setLoading(false);
  }, [forceClose, onClose]);

  return (
    <Button
      onPress={handleClose}
      // disabled={disabled}
      containerStyle={{ marginLeft: "auto" }}
      variant="filled"
      style={{ paddingHorizontal: 20 }}
      isLoading={loading}
    >
      <ButtonText>Done</ButtonText>
      <Icon>check</Icon>
    </Button>
  );
});

function LabelPickerContent({
  defaultCollection,
  label,
  setLabel,
  multiple,
  onClose,
  handleClose,
  autoFocus,
  hideBack,
  disableIntegratedItems,
  disabledLabels,
}) {
  const theme = useColorTheme();
  const colors = useLabelColors();

  const [query, setQuery] = useState("");
  const searchRef = useRef(null);

  const disabled = (item) =>
    Array.isArray(disabledLabels) &&
    (disabledLabels.includes(item.id) ||
      (disableIntegratedItems && item.integrationId));

  const { data, mutate, error } = useSWR(["space/labels"]);

  const collections = Array.isArray(data)
    ? data
        ?.map((l) => l.collections.map((c) => c))
        ?.flat()
        ?.filter((c, i, arr) => arr.findIndex((a) => a.id === c.id) === i) || []
    : [];

  const [selectedCollection, setSelectedCollection] = useState(() => {
    if (defaultCollection === "all") return null;
    const hasLabels = collections.some((c) => c.id === defaultCollection);
    return hasLabels ? defaultCollection : null;
  });

  return (
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
          <Text weight={900} style={{ fontSize: 25, textAlign: "center" }}>
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
          <IconButton onPress={handleClose} style={{ marginLeft: 10 }}>
            <Icon>close</Icon>
          </IconButton>
        )}
        <Search query={query} setQuery={setQuery} autoFocus={autoFocus} />
        <CreateLabelModal
          collectionId={selectedCollection}
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
          <IconButton style={{ marginRight: 10 }} size={30}>
            <Icon>add_circle</Icon>
          </IconButton>
        </CreateLabelModal>
      </View>
      {Array.isArray(data) ? (
        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={62}
          data={fuzzysort
            .go(query, data, { key: "name", all: true })
            .map((t) => t.obj)
            .sort(
              // sort by selected on top
              (a, b) =>
                (a.id === (label as any)?.id ||
                (multiple && Array.isArray(label) && label.includes(a.id))
                  ? -1
                  : 1) -
                (b.id === (label as any)?.id ||
                (multiple && Array.isArray(label) && label.includes(b.id))
                  ? -1
                  : 1)
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
                // height: "100%",
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 70,
                paddingHorizontal: 20,
                gap: 5,
              }}
            >
              <Text style={{ fontSize: 30, marginTop: 10 }}>
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
          renderItem={({ item }: any) => {
            const isSelected =
              (label as any)?.id == item.id ||
              (multiple && Array.isArray(label) && label.includes(item.id));

            return (
              <ListItemButton
                disabled={disabled(item)}
                onPress={() => {
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
                style={[
                  { paddingVertical: 0, marginBottom: 5 },
                  disabled(item) && item.integrationId && { opacity: 0.5 },
                ]}
                variant={isSelected ? "filled" : undefined}
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
                  secondary={
                    disabled(item)
                      ? !disabledLabels.includes(item.id)
                        ? "Already connected with another integration"
                        : "Already selected"
                      : `${item._count.entities} item${
                          item._count.entities !== 1 ? "s" : ""
                        }`
                  }
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
                    {isSelected ? "check_circle" : "circle"}
                  </Icon>
                )}
              </ListItemButton>
            );
          }}
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {error ? <ErrorAlert /> : <Spinner />}
        </View>
      )}
    </View>
  );
}

export default function LabelPicker({
  children,
  label,
  setLabel,
  onClose,
  onOpen,
  autoFocus = true,
  multiple = false,
  hideBack = false,
  triggerProp = "onPress",
  sheetProps = {},
  disabled = false,
  defaultCollection,
  disableIntegratedItems = false,
  disabledLabels,
}: {
  children?: React.ReactElement;
  label?: string | any[] | { id: string; name: string; emoji: string };
  setLabel: (label: string | string[]) => void;
  onClose?: any;
  onOpen?: any;
  autoFocus?: boolean;
  multiple?: boolean;
  hideBack?: boolean;
  triggerProp?: string;
  sheetProps?: Partial<DBottomSheetProps>;
  disabled?: boolean;
  defaultCollection?: string;
  disableIntegratedItems?: boolean;
  disabledLabels?: string[];
}) {
  const _ref = useRef<BottomSheetModal>(null);
  const ref = sheetProps.sheetRef || _ref;

  const handleOpen = useCallback(() => {
    onOpen?.();
    ref.current?.present();
  }, [ref, onOpen]);

  const handleClose = useCallback(async () => {
    await onClose?.();
    ref.current?.close({ duration: 0.0001, overshootClamping: true });
  }, [ref, onClose]);

  const trigger = cloneElement(children || <Pressable />, {
    [triggerProp]: disabled ? undefined : handleOpen,
  });

  const breakpoints = useResponsiveBreakpoints();

  return (
    <>
      {trigger}
      <Modal
        animation="SCALE"
        sheetRef={ref}
        onClose={handleClose}
        maxWidth={(breakpoints.md ? 450 : "100%") as any}
        height={500}
        {...sheetProps}
      >
        <LabelPickerContent
          disabledLabels={disabledLabels}
          disableIntegratedItems={disableIntegratedItems}
          defaultCollection={defaultCollection}
          label={label}
          setLabel={setLabel}
          multiple={multiple}
          hideBack={hideBack}
          autoFocus={autoFocus}
          handleClose={handleClose}
          onClose={onClose}
        />
      </Modal>
    </>
  );
}

