import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { paletteItems } from "../layout/command-palette/list";
import { createTab } from "../layout/openTab";
import { useCommandPaletteContext } from "./context";

const PaletteItem = memo(
  function PaletteItem({
    preview,
    setPreview,
    item,
    handleClose,
  }: {
    preview: any;
    setPreview: (e) => void;
    item: any;
    handleClose;
  }) {
    const { sessionToken } = useUser();
    const [loading, setLoading] = useState(false);
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
        handleClose();
      } catch (e) {
        setLoading(false);
        alert("Something went wrong. Please try again later");
      }
    };
    return (
      <ListItemButton
        variant={preview?.key === item.key ? "filled" : "default"}
        style={{ paddingHorizontal: 10, marginLeft: -10 }}
        onPress={() => handlePress(item)}
        onHoverIn={() => {
          if (preview?.key !== item.key) {
            setPreview(item);
          }
        }}
      >
        {item.emoji ? <Emoji emoji={item.emoji} /> : <Icon>{item.icon}</Icon>}
        <ListItemText primary={item.label} />

        {loading && <Spinner />}
      </ListItemButton>
    );
  },
  (prev, next) => prev.item === next.item
);

const PaletteFilters = memo(({ filters, filter, setFilter }: any) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: 10,
        paddingTop: 5,
        paddingBottom: 10,
        paddingRight: 20,
      }}
      style={{
        marginRight: -20,
      }}
    >
      {filters.map(({ name, icon }) => (
        <Chip
          label={name}
          icon={icon}
          key={name}
          onPress={() => {
            if (filter === name) {
              setFilter(null);
            } else {
              setFilter(name);
            }
          }}
          style={{
            backgroundColor:
              filter !== null && filter !== name ? "transparent" : undefined,
          }}
        />
      ))}
    </ScrollView>
  );
});

function CommandPaletteList({
  preview,
  setPreview,
  filtered,
  setFilter,
  filter,
  filters,
  handleClose,
}: {
  preview: any;
  setPreview: (e) => void;
  filtered: any[];
  setFilter: (e) => void;
  filter: string;
  filters: any[];
  handleClose: () => void;
}) {
  const { height } = useWindowDimensions();
  return (
    <View style={{ flex: 1 }}>
      <FlashList
        ListEmptyComponent={() => (
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              height: height / 1.5 - 30,
            }}
          >
            <Text style={{ textAlign: "center", fontSize: 40 }}>
              .·´¯`(&gt;▂&lt;)´¯`·.
            </Text>
            <Text>We couldn't find anything matching your search</Text>
          </View>
        )}
        data={filtered}
        ListHeaderComponent={() =>
          filtered.length !== 0 && (
            <PaletteFilters
              filters={filters}
              filter={filter}
              setFilter={setFilter}
            />
          )
        }
        keyExtractor={(item) => (typeof item === "string" ? item : item.key)}
        estimatedItemSize={44}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => {
          if (typeof item === "string") {
            return (
              <Text style={{ marginTop: 10 }} variant="eyebrow">
                {item}
              </Text>
            );
          } else {
            return (
              <PaletteItem
                handleClose={handleClose}
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
      <TouchableOpacity onPress={handleClose}>
        <Text style={{ color: theme[11] }}>Cancel</Text>
      </TouchableOpacity>
    ),
    [handleClose, theme]
  );
  const handleKeyPress = (e) => {
    if (Platform.OS === "web") {
      if (e.key === "Escape") {
        handleClose();
      }
    }
    setPreview(filtered.length > 0 ? filtered[1] : null);
  };

  useEffect(() => {
    setTimeout(() => ref.current?.focus(), breakpoints.md ? 50 : 500);
  }, [breakpoints]);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: theme[6],
      }}
    >
      <Icon size={30}>search</Icon>
      <TextField
        inputRef={ref}
        style={{
          padding: 20,
          flex: 1,
          fontSize: 25,
          fontFamily: "body_800",
          shadowRadius: 0,
        }}
        placeholder="What are you looking for?"
        value={query}
        onChangeText={(e) => {
          setQuery(e);
        }}
        // on enter key
        onSubmitEditing={() => {
          if (filtered.length > 0) {
            const item = preview || filtered[1];
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
  );
});

function CommandPalettePreview({ preview }) {
  const theme = useColorTheme();

  return (
    preview && (
      <View
        style={{
          flex: 1,
          borderLeftWidth: 1,
          borderColor: theme[6],
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Avatar size={70} style={{ marginBottom: 10 }}>
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
        <Text heading style={{ fontSize: 40 }}>
          {preview.label}
        </Text>
        {preview?.data?.description && <Text>{preview.data.description}</Text>}
        {preview.data?.createdBy && (
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <ProfilePicture
              size={30}
              name={preview.data.createdBy.profile.name}
              image={preview.data.createdBy.profile.picture}
            />
            <Text>Created by {preview.data.createdBy.profile.name}</Text>
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 5, marginTop: 10 }}>
          {preview.data?._count?.labels && (
            <Chip label={preview.data._count.labels + " labels"} />
          )}
          {preview.data?.pinned && <Chip label={"Pinned"} />}
          {preview.data?.archived && <Chip label={"Archived"} />}
        </View>
      </View>
    )
  );
}

function CommandPaletteContent({ handleClose }) {
  const theme = useColorTheme();
  const { height } = useWindowDimensions();

  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState(null);

  const handlePreviewChange = useCallback((e) => setPreview(e), []);

  const [filter, setFilter] = useState<null | string>(null);
  const { data: collections } = useSWR(["space/collections"]);
  const { data: labels } = useSWR(["space/labels"]);

  const sections = paletteItems(collections, labels);
  const filters = sections
    .map(({ title, icon }) => ({ name: title, icon }))
    .filter((i) => i.name !== "All");

  const flattened = sections
    .filter((section) => !filter || section.title === filter)
    .reduce((acc, curr) => {
      acc.push(curr.title);
      acc.push(...curr.items);
      return acc;
    }, []);

  const filtered = flattened.filter((item) => {
    if (typeof item === "string") {
      return (
        sections
          .find((section) => section.title === item)
          .items.find((item) =>
            item.label?.toLowerCase()?.includes(query.toLowerCase())
          ) !== undefined
      );
    } else {
      return item.label?.toLowerCase()?.includes(query.toLowerCase());
    }
  });

  return (
    <View
      style={{
        backgroundColor: theme[2],
        borderWidth: 1,
        borderColor: theme[6],
        margin: "auto",
        width: "100%",
        maxWidth: 900,
        borderRadius: 20,
        shadowColor: theme[1],
        shadowOffset: {
          width: 10,
          height: 10,
        },
        shadowOpacity: 1,
        shadowRadius: 30,
      }}
    >
      <PaletteHeader
        preview={preview}
        handleClose={handleClose}
        query={query}
        setQuery={setQuery}
        setPreview={setPreview}
        filtered={filtered}
      />
      <View style={{ flexDirection: "row", height: height / 1.5 }}>
        <View style={{ flex: 1.5 }}>
          <CommandPaletteList
            preview={preview}
            setPreview={handlePreviewChange}
            filtered={filtered}
            filter={filter}
            setFilter={setFilter}
            filters={filters}
            handleClose={handleClose}
          />
        </View>
        <CommandPalettePreview preview={preview} />
      </View>
    </View>
  );
}

const CommandPalette = memo(function CommandPalette() {
  const { handleClose, sheetRef } = useCommandPaletteContext();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <BottomSheet
      enableContentPanningGesture={false}
      snapPoints={["100%"]}
      sheetRef={sheetRef}
      onClose={handleClose}
      maxWidth="100%"
      handleComponent={() => null}
      backgroundStyle={{
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
      {...(breakpoints.md && {
        maxBackdropOpacity: 0.1,
        animationConfigs: {
          overshootClamping: true,
          duration: 0.0001,
        },
      })}
    >
      <CommandPaletteContent handleClose={handleClose} />
    </BottomSheet>
  );
});

export default CommandPalette;
