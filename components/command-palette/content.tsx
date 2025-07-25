import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import fuzzysort from "fuzzysort";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { paletteItems } from "../layout/command-palette/list";
import { createTab } from "../layout/openTab";
import { useSidebarContext } from "../layout/sidebar/context";

const PaletteItem = memo(
  function PaletteItem({
    preview,
    setPreview,
    item,
    onCreate,
  }: {
    preview: any;
    setPreview: (e) => void;
    item: any;
    onCreate: any;
  }) {
    const breakpoints = useResponsiveBreakpoints();
    const theme = useColorTheme();
    return (
      <ListItemButton
        style={{ paddingHorizontal: 10, marginLeft: -5 }}
        onPress={() => onCreate(item)}
        variant={preview?.key === item.key ? "filled" : "default"}
        onMouseEnter={() => {
          if (!breakpoints.md) return;
          if (preview?.key !== item.key) {
            setPreview(item);
          }
        }}
      >
        {item.emoji ? <Emoji emoji={item.emoji} /> : <Icon>{item.icon}</Icon>}
        <ListItemText primary={item.label} />
        {!!item.hasSeen && (
          <Button
            dense
            icon="fiber_manual_record"
            text="New"
            iconStyle={{ fontFamily: "symbols_filled" }}
            style={{ backgroundColor: theme[5] }}
          />
        )}
      </ListItemButton>
    );
  },
  (prev, next) => prev.item === next.item
);

const PaletteFilters = memo(({ filters, filter, setFilter }: any) => {
  const theme = useColorTheme();
  return (
    <View
      style={{
        height: 55,
        padding: 20,
        paddingBottom: 0,
        flexDirection: "row",
      }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 10,
          paddingBottom: 10,
          paddingRight: 60,
        }}
        style={{ marginRight: -60 }}
      >
        {filters.map(({ name, icon }) => (
          <Button
            text={name}
            icon={icon}
            key={name}
            onPress={() => {
              if (filter === name) {
                setFilter(null);
              } else {
                setFilter(name);
              }
            }}
            chip
            textStyle={{ fontSize: 15 }}
            variant={filter !== name ? "outlined" : undefined}
            style={[filter === name && { backgroundColor: theme[5] }]}
          />
        ))}
      </ScrollView>
      <LinearGradient
        colors={[addHslAlpha(theme[2], 0), theme[2]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          height: 35,
          width: 60,
          marginRight: -20,
          pointerEvents: "none",
          zIndex: 99,
        }}
      />
    </View>
  );
});

function CommandPaletteList({
  query,
  preview,
  setPreview,
  filtered,
  setFilter,
  filter,
  filters,
  onCreate,
  setQuery,
  showMore,
  setshowMore,
}: {
  query: any;
  preview: any;
  setPreview: (e) => void;
  filtered: any[];
  setFilter: (e) => void;
  filter: string;
  filters: any[];
  onCreate: any;
  setQuery: any;
  showMore: string[];
  setshowMore: (e) => void;
}) {
  const { height } = useWindowDimensions();
  const theme = useColorTheme();

  return (
    <View style={{ flex: 1 }}>
      {filtered.length !== 0 && (
        <PaletteFilters
          filters={filters}
          filter={filter}
          setFilter={setFilter}
        />
      )}
      <LinearGradient
        colors={[theme[2], addHslAlpha(theme[2], 0)]}
        style={{
          height: 35,
          pointerEvents: "none",
          marginBottom: -35,
          zIndex: 99,
          marginTop: 10,
        }}
      />
      <FlashList
        onScrollBeginDrag={() => Keyboard.dismiss()}
        key={query}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={() => (
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              height: Math.min(600, height / 1.5) - 120,
            }}
          >
            <Icon size={50}>heart_broken</Icon>
            <Text
              style={{
                textAlign: "center",
                fontSize: 20,
                color: theme[11],
              }}
            >
              We couldn't find anything{"\n"}matching your search
            </Text>
            <Button
              variant="filled"
              dense
              containerStyle={{ marginBottom: -20 }}
              onPress={() => {
                setFilter(null);
                setQuery("");
              }}
            >
              <ButtonText>Clear filters</ButtonText>
            </Button>
          </View>
        )}
        data={filtered}
        keyExtractor={(item, index) =>
          (typeof item === "string" ? item : item.key) + index
        }
        estimatedItemSize={44}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item, index }) => {
          if (typeof item === "string") {
            return (
              <Text
                style={{
                  marginTop: index === 0 ? 0 : 10,
                  marginBottom: 3,
                  marginLeft: 10,
                }}
                variant="eyebrow"
              >
                {item}
              </Text>
            );
          } else if (item.showMore) {
            return (
              <LinearGradient
                colors={
                  showMore.includes(item.category)
                    ? [addHslAlpha(theme[2], 0), addHslAlpha(theme[2], 0)]
                    : [
                        addHslAlpha(theme[2], 0),
                        addHslAlpha(theme[2], 0.65),
                        addHslAlpha(theme[2], 0.8),
                        theme[2],
                      ]
                }
                style={{
                  height: 75,
                  marginTop: showMore.includes(item.category)
                    ? -30
                    : Platform.OS === "ios"
                    ? -50
                    : -75,
                  justifyContent: "flex-end",
                  marginBottom: 10,
                  marginHorizontal: -20,
                  zIndex: 9999,
                }}
              >
                <Button
                  containerStyle={{ marginHorizontal: "auto" }}
                  textStyle={{ opacity: 0.8 }}
                  iconStyle={{ opacity: 0.8 }}
                  style={{ paddingHorizontal: 20, gap: 10, paddingRight: 15 }}
                  dense
                  pointerEvents="auto"
                  variant="outlined"
                  text={
                    showMore.includes(item.category) ? "See less" : "See all"
                  }
                  icon={
                    showMore.includes(item.category)
                      ? "expand_less"
                      : "expand_more"
                  }
                  iconPosition="end"
                  onPress={() => {
                    setshowMore((prev) =>
                      prev.includes(item.category)
                        ? prev.filter((e) => e !== item.category)
                        : [...prev, item.category]
                    );
                  }}
                />
              </LinearGradient>
            );
          } else {
            return (
              <PaletteItem
                onCreate={onCreate}
                setPreview={setPreview}
                preview={preview}
                item={item}
              />
            );
          }
        }}
      />
    </View>
  );
}

const PaletteHeader = memo(function PaletteHeader({
  query,
  setQuery,
  handleClose,
  preview,
  setPreview,
  filtered,
}: {
  query: string;
  setQuery: (e) => void;
  handleClose: () => void;
  preview: any;
  setPreview: (e) => void;
  filtered: any[];
}) {
  const breakpoints = useResponsiveBreakpoints();
  const ref = useRef(null);
  const { sessionToken } = useUser();

  const theme = useColorTheme();
  const close = useMemo(
    () => (
      <TouchableOpacity
        onPress={handleClose}
        style={{
          paddingVertical: 20,
          paddingHorizontal: 10,
        }}
      >
        {breakpoints.md ? (
          <Text style={{ color: theme[11] }} weight={900}>
            Cancel
          </Text>
        ) : (
          <Icon bold style={{ transform: [{ translateX: 10 }] }}>
            close
          </Icon>
        )}
      </TouchableOpacity>
    ),
    [handleClose, theme, breakpoints, query]
  );
  const handleKeyPress = (e) => {
    if (Platform.OS === "web") {
      if (e.key === "Escape") {
        handleClose();
      }
    }
    if (breakpoints.md) setPreview(filtered.length > 0 ? filtered[0] : null);
  };

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, [breakpoints]);

  useEffect(() => {
    if (breakpoints.md) setPreview(filtered.length > 0 ? filtered[0] : null);
  }, []);

  return (
    (breakpoints.md || !preview) && (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: breakpoints.md ? 20 : 20,
          borderBottomWidth: 1,
          borderColor: theme[5],
        }}
      >
        <Icon size={breakpoints.md ? 30 : 24} style={{ flexShrink: 0 }}>
          search
        </Icon>
        <TextField
          inputRef={ref}
          style={{
            padding: 20,
            flex: 1,
            paddingRight: 0,
            fontSize: breakpoints.md ? 25 : 20,
            shadowRadius: 0,
          }}
          weight={breakpoints.md ? 800 : 400}
          placeholder="What are you looking for?"
          value={query}
          onChangeText={(e) => {
            setQuery(e);
          }}
          // on enter key
          onSubmitEditing={() => {
            if (filtered.length > 0) {
              const item = preview || filtered[0];
              if (item.onPress) {
                item.onPress();
                handleClose();
              } else {
                createTab(sessionToken, item);
                handleClose();
              }
            }
          }}
          onKeyPress={handleKeyPress}
        />
        {close}
      </View>
    )
  );
});

function CommandPalettePreview({ loading, setPreview, preview, onCreate }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();

  const handleClose = useCallback(() => setPreview(null), [setPreview]);
  return (
    preview && (
      <ScrollView
        keyboardShouldPersistTaps="always"
        style={{
          flex: 1,
          borderLeftWidth: breakpoints.md ? 1 : 0,
          borderColor: theme[5],
        }}
        contentContainerStyle={{
          minHeight: "100%",
          padding: 30,
          paddingBottom: insets.bottom + 20,
        }}
        centerContent
      >
        {!breakpoints.md && (
          <IconButton
            icon="arrow_back_ios_new"
            onPress={handleClose}
            size={40}
            style={{
              position: "absolute",
              top: 30,
              left: 20,
              zIndex: 100,
            }}
          />
        )}
        <View
          style={[
            {
              marginTop: "auto",
              flexDirection: "column",
              width: "100%",
              gap: 20,
            },
          ]}
        >
          <Avatar
            style={{
              backgroundColor: addHslAlpha(theme[9], 0.2),
              borderRadius: 20,
            }}
            size={70}
          >
            {preview.emoji ? (
              <Emoji emoji={preview.emoji} size={50} />
            ) : (
              <Icon
                size={40}
                style={{
                  color: theme[11],
                  opacity: preview ? 1 : 0.5,
                }}
              >
                {preview?.icon}
              </Icon>
            )}
          </Avatar>
          <View style={[{ flex: breakpoints.md ? 1 : 0, gap: 10 }]}>
            <Text
              style={{
                fontSize: 30,
                fontFamily: "serifText700",
              }}
              weight={500}
            >
              {preview.label}
            </Text>
            {(preview?.data?.description || preview?.about) && (
              <Text style={[{ opacity: 0.6 }]}>
                {preview?.data?.description || preview?.about}
              </Text>
            )}

            {preview.data?.createdBy && (
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <ProfilePicture
                  size={30}
                  name={preview.data.createdBy.profile.name}
                  image={preview.data.createdBy.profile.picture}
                />
                <Text>Created by {preview.data.createdBy.profile.name}</Text>
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 5 }}>
              {preview.data?._count?.labels ? (
                <Button
                  chip
                  style={{ backgroundColor: addHslAlpha(theme[9], 0.1) }}
                  text={`${preview.data._count.labels} label${
                    preview.data._count.labels === 1 ? "" : "s"
                  }`}
                />
              ) : null}
              {preview.data?.pinned && (
                <Button
                  chip
                  style={{ backgroundColor: addHslAlpha(theme[9], 0.1) }}
                  text={"Pinned"}
                />
              )}
              {preview.data?.archived && (
                <Button
                  chip
                  style={{ backgroundColor: addHslAlpha(theme[9], 0.1) }}
                  text={"Archived"}
                />
              )}
            </View>
          </View>
        </View>

        <View
          style={{
            width: "100%",
            marginTop: "auto",
          }}
        >
          <Button
            isLoading={loading}
            onPress={() => onCreate(preview)}
            variant="filled"
            height={60}
            style={({ pressed, hovered }) => ({
              height: 60,
              backgroundColor:
                theme[loading ? 5 : pressed ? 11 : hovered ? 10 : 9],
            })}
          >
            <ButtonText style={{ fontSize: 20, color: theme[2] }} weight={900}>
              Open
            </ButtonText>
            <Icon style={{ color: theme[2] }} bold>
              north_east
            </Icon>
          </Button>
        </View>
      </ScrollView>
    )
  );
}

export default function CommandPaletteContent({ handleClose, defaultFilter }) {
  const { sessionToken } = useUser();
  const theme = useColorTheme();
  const { mutate } = useSWR(["user/tabs"]);

  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState(null);

  const handlePreviewChange = useCallback((e) => setPreview(e), []);

  const [filter, setFilter] = useState<null | string>(defaultFilter || null);
  const { data: collections } = useSWR(["space/collections"]);
  const { data: labels } = useSWR(["space/labels"]);
  const { data: sharedCollections } = useSWR(["user/collectionAccess"]);

  const sections = paletteItems(collections, sharedCollections, labels);

  const [showMore, setShowMore] = useState<string[]>([]);

  const filtered = sections
    .filter((section) => !filter || section.title === filter)
    .reduce((acc, curr) => {
      const items = fuzzysort
        .go(query, curr.items || [], { keys: ["title", "label"], all: true })
        .map((e) => e.obj);
      if (items.length > 0) {
        acc.push(curr.title);
        if (query === "" && items.length > 6 && !filter) {
          acc.push(
            ...items.slice(0, showMore.includes(curr.title) ? items.length : 6),
            {
              showMore: true,
              category: curr.title,
              key: curr.title + "more",
            }
          );
        } else {
          acc.push(...items);
        }
      }
      return acc;
    }, []);

  const filters = sections
    .filter((section) => {
      const items = fuzzysort
        .go(query, section.items || [], { keys: ["title", "label"], all: true })
        .map((e) => e.obj);
      return items.length > 0;
    })
    .map(({ title, icon }) => ({ name: title, icon }))
    .filter((i) => i.name !== "All");

  const breakpoints = useResponsiveBreakpoints();
  const { desktopCollapsed } = useSidebarContext() || {};

  const [loading, setLoading] = useState(false);
  const { sidebarRef } = useSidebarContext() || {};

  const onCreate = useCallback(
    async (tab) => {
      try {
        Keyboard.dismiss();
        if (
          (!preview || typeof preview === "string") &&
          Platform.OS !== "web"
        ) {
          setPreview(tab);
          return;
        }
        setLoading(true);
        if (tab.onPress) {
          await tab.onPress();
          setLoading(false);
          return;
        }
        handleClose();
        const data = await createTab(sessionToken, tab, false);
        mutate((oldData) => [...oldData, data], { revalidate: false });

        router.replace({
          pathname: data.slug,
          params: {
            tab: data.id,
            ...tab.params,
          },
        });
        if (!breakpoints.md || desktopCollapsed)
          sidebarRef?.current?.closeDrawer?.();
      } catch (e) {
        Toast.show({ type: "error" });
      } finally {
        setLoading(false);
      }
    },
    [handleClose, mutate, sessionToken, breakpoints.md, preview, sidebarRef]
  );

  return (
    <View
      style={[
        {
          width: "100%",
          flex: 1,
        },
      ]}
    >
      <PaletteHeader
        preview={preview}
        handleClose={handleClose}
        query={query}
        setQuery={setQuery}
        setPreview={setPreview}
        filtered={filtered}
      />
      <View style={{ flexDirection: "row", flex: 1 }}>
        {(!preview || breakpoints.md) && (
          <KeyboardAvoidingView
            style={{ flex: breakpoints.md ? 1.5 : 1 }}
            behavior="height"
          >
            <CommandPaletteList
              query={query}
              setQuery={setQuery}
              preview={preview}
              setPreview={handlePreviewChange}
              filtered={filtered}
              showMore={showMore}
              setshowMore={setShowMore}
              filter={filter}
              setFilter={setFilter}
              filters={filters}
              onCreate={onCreate}
            />
          </KeyboardAvoidingView>
        )}
        {(breakpoints.md || preview) && typeof preview !== "string" ? (
          <CommandPalettePreview
            setPreview={setPreview}
            onCreate={onCreate}
            preview={preview}
            loading={loading}
          />
        ) : (
          breakpoints.md && (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                borderLeftWidth: 1,
                padding: 20,
                borderColor: theme[5],
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: theme[11],
                  opacity: 0.2,
                }}
              >
                {Platform.OS === "ios" ? "Tap" : "Hover"} on an item to learn
                more about it
              </Text>
            </View>
          )
        )}
      </View>
    </View>
  );
}

