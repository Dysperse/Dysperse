import { CreateLabelModal } from "@/components/labels/createModal";
import { useLabelColors } from "@/components/labels/useLabelColors";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet, { DBottomSheetProps } from "@/ui/BottomSheet";
import { SafeFlashListFix } from "@/ui/BottomSheet/SafeFlashListFix";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import {
  BottomSheetFlatList,
  BottomSheetModal,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import fuzzysort from "fuzzysort";
import React, {
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
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
      bottomSheet
      onChangeText={setQuery}
      style={{
        backgroundColor: theme[3],
        paddingHorizontal: 20,
        borderRadius: 99,
        height: 50,
        shadowRadius: 0,
        flex: 1,
        textAlign: "center",
        fontSize: 18,
        width: "100%",
      }}
      weight={800}
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
      {collections?.length !== 0 && <Text variant="eyebrow">Collections</Text>}
      <BottomSheetFlatList
        horizontal
        ref={ref}
        keyboardShouldPersistTaps="handled"
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

function LabelPickerContent({
  defaultCollection,
  label,
  setLabel,
  multiple,
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
        ?.filter((c, i, arr) => arr.findIndex((a) => a.id === c.id) === i)
        .sort((a, b) => a.name.localeCompare(b.name)) || []
    : [];

  const [selectedCollection, setSelectedCollection] = useState(() => {
    if (defaultCollection === "all") return null;
    const hasLabels = collections.some((c) => c.id === defaultCollection);
    return hasLabels ? defaultCollection : null;
  });

  const hideCreate = useSharedValue(0);

  const hideCreateStyle = useAnimatedStyle(() => ({
    width: 100,
    marginRight: withSpring(hideCreate.value === 1 ? -110 : 0, {
      stiffness: 400,
      damping: 30,
    }),
    opacity: withSpring(hideCreate.value === 1 ? 0 : 1, {
      stiffness: 400,
      damping: 30,
    }),
  }));

  useEffect(() => {
    hideCreate.value = query ? 1 : 0;
  }, [query, hideCreate]);

  return (
    <View
      style={{
        padding: 15,
        height: "100%",
        paddingBottom: 0,
      }}
    >
      {multiple && data?.length > 0 && (
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
        </View>
      )}
      {data?.length > 0 && (
        <View style={[labelPickerStyles.searchBox]}>
          {!hideBack && (
            <IconButton
              onPress={handleClose}
              icon="close"
              size={50}
              variant="filled"
            />
          )}
          <Search query={query} setQuery={setQuery} autoFocus={autoFocus} />
          <Animated.View style={hideCreateStyle}>
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
              <Button
                onPress={handleClose}
                icon="add"
                height={50}
                text="New"
                bold
                variant="filled"
                containerStyle={{ flex: 1 }}
              />
            </CreateLabelModal>
          </Animated.View>
        </View>
      )}
      <LinearGradient
        colors={[theme[2], addHslAlpha(theme[2], 0)]}
        style={{ height: 30, zIndex: 99, marginBottom: -30, width: "100%" }}
      />
      {Array.isArray(data) ? (
        <SafeFlashListFix
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
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 20,
                gap: 5,
                height: "100%",
                marginTop: -20,
              }}
            >
              <Text
                style={{
                  fontSize: 30,
                  fontFamily: "serifText700",
                }}
              >
                {query ? "No labels found" : "No labels yet"}
              </Text>
              <Text style={{ opacity: 0.6, textAlign: "center" }}>
                {query
                  ? "Try searching for something else"
                  : "Labels are a great way to \n group things together"}
              </Text>
              {query === "" && (
                <CreateLabelModal mutate={mutate}>
                  <Button
                    variant="filled"
                    containerStyle={{ marginTop: 5 }}
                    large
                    text="Create one"
                    icon="add"
                  />
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
                    setLabel(
                      label && item.id === (label as any)?.id ? null : item
                    );
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
                  <Icon filled={isSelected} size={30}>
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
  const { height } = useWindowDimensions();

  const handleOpen = useCallback(() => {
    onOpen?.();
    ref.current?.present();
  }, [ref, onOpen]);

  const handleClose = useCallback(async () => {
    await onClose?.();
    ref.current?.close(
      breakpoints.md ? { duration: 0.0001, overshootClamping: true } : undefined
    );
  }, [ref, onClose]);

  const trigger = cloneElement(children || <Pressable />, {
    [triggerProp]: disabled ? undefined : handleOpen,
  });

  const breakpoints = useResponsiveBreakpoints();

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        onClose={handleClose}
        maxWidth={(breakpoints.md ? 450 : "100%") as any}
        snapPoints={[breakpoints.md ? "80%" : height / 2]}
        containerStyle={{
          maxWidth: 500,
          width: "100%",
          marginLeft: "50%",
          transform: [{ translateX: "-50%" }],
        }}
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
        />
      </BottomSheet>
    </>
  );
}

