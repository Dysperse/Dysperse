import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
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
import { Image } from "expo-image";
import { router } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
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
        backgroundColors={{
          default: addHslAlpha(theme[9], preview?.key === item.key ? 0.12 : 0),
          hover: addHslAlpha(theme[9], 0.1),
          active: addHslAlpha(theme[9], 0.2),
        }}
        onMouseEnter={() => {
          if (!breakpoints.md) return;
          if (preview?.key !== item.key) {
            setPreview(item);
          }
        }}
      >
        {item.emoji ? <Emoji emoji={item.emoji} /> : <Icon>{item.icon}</Icon>}
        <ListItemText primary={item.label} />
        {item.hasSeen === false && (
          <Chip
            dense
            icon={
              <Icon style={{ color: theme[1] }} filled>
                fiber_manual_record
              </Icon>
            }
            label={<Text style={{ color: theme[1] }}>New</Text>}
            style={{ backgroundColor: theme[11] }}
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
    <ScrollView
      keyboardShouldPersistTaps="handled"
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: 10,
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
          outlined={filter !== name}
          style={({ pressed, hovered }) => ({
            backgroundColor:
              filter !== null && filter !== name
                ? "transparent"
                : filter === name
                ? addHslAlpha(theme[9], 0.1)
                : "transparent",
            zIndex: 99,
            borderColor: addHslAlpha(
              theme[9],
              pressed ? 0.2 : hovered ? 0.15 : 0.1
            ),
          })}
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
  onCreate,
}: {
  preview: any;
  setPreview: (e) => void;
  filtered: any[];
  setFilter: (e) => void;
  filter: string;
  filters: any[];
  onCreate: any;
}) {
  const { height } = useWindowDimensions();
  return (
    <View style={{ flex: 1 }}>
      <FlashList
        showsVerticalScrollIndicator={false}
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
            <Image
              source={{
                uri: "https://assets.dysperse.com/thonk.svg",
              }}
              style={{ width: 487 / 6, height: 397 / 6 }}
            />
            <Text
              style={{
                textAlign: "center",
                marginTop: 10,
                opacity: 0.7,
                fontSize: 20,
              }}
              weight={700}
            >
              We couldn't find anything matching your search
            </Text>
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
    [handleClose, theme, breakpoints]
  );
  const handleKeyPress = (e) => {
    if (Platform.OS === "web") {
      if (e.key === "Escape") {
        handleClose();
      }
    }
    if (breakpoints.md) setPreview(filtered.length > 0 ? filtered[1] : null);
  };

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, [breakpoints]);

  useEffect(() => {
    if (breakpoints.md) setPreview(filtered.length > 0 ? filtered[1] : null);
  }, []);

  return (
    (breakpoints.md || !preview) && (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: breakpoints.md ? 20 : 20,
          borderBottomWidth: 1,
          borderColor: theme[6],
        }}
      >
        <Icon size={breakpoints.md ? 30 : 24}>search</Icon>
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
    )
  );
});

function CommandPalettePreview({ loading, setPreview, preview, onCreate }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  const handleClose = useCallback(() => setPreview(null), [setPreview]);

  return (
    preview && (
      <ScrollView
        style={{
          flex: 1,
          borderLeftWidth: breakpoints.md ? 1 : 0,
          borderColor: theme[6],
          padding: !breakpoints.md ? 20 : 0,
        }}
        centerContent
      >
        {!breakpoints.md && (
          <IconButton
            icon="arrow_back_ios_new"
            onPress={handleClose}
            size={55}
            variant="outlined"
            style={{
              position: "absolute",
              top: 20,
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
              paddingHorizontal: 20,
              gap: 20,
              paddingTop: 55,
            },
            { alignItems: "center" },
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
          <View
            style={[{ flex: breakpoints.md ? 1 : 0 }, { alignItems: "center" }]}
          >
            <Text
              style={[
                { fontSize: 40, lineHeight: 43 },
                { textAlign: "center" },
              ]}
            >
              {preview.label}
            </Text>
            {(preview?.data?.description || preview?.about) && (
              <Text
                style={[
                  { marginTop: 5, fontSize: 20, opacity: 0.6 },
                  { textAlign: "center" },
                ]}
              >
                {preview?.data?.description || preview?.about}
              </Text>
            )}

            {preview.data?.createdBy && (
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                  marginTop: 10,
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

            <View style={{ flexDirection: "row", gap: 5, marginTop: 10 }}>
              {preview.data?._count?.labels ? (
                <Chip
                  style={{ backgroundColor: addHslAlpha(theme[9], 0.1) }}
                  label={`${preview.data._count.labels} label${
                    preview.data._count.labels === 1 ? "" : "s"
                  }`}
                />
              ) : null}
              {preview.data?.pinned && (
                <Chip
                  style={{ backgroundColor: addHslAlpha(theme[9], 0.1) }}
                  label={"Pinned"}
                />
              )}
              {preview.data?.archived && (
                <Chip
                  style={{ backgroundColor: addHslAlpha(theme[9], 0.1) }}
                  label={"Archived"}
                />
              )}
            </View>
          </View>
        </View>

        <View
          style={{
            width: "100%",
            marginTop: "auto",
            padding: 15,
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
  const { mutate } = useSWR(["user/tabs"]);

  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState(null);

  const handlePreviewChange = useCallback((e) => setPreview(e), []);

  const [filter, setFilter] = useState<null | string>(defaultFilter || null);
  const { data: collections } = useSWR(["space/collections"]);
  const { data: sharedCollections } = useSWR(["user/collectionAccess"]);

  const sections = paletteItems(collections, sharedCollections);
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

  const [loading, setLoading] = useState(false);
  const breakpoints = useResponsiveBreakpoints();
  const { sidebarRef } = useSidebarContext() || {};

  const onCreate = useCallback(
    async (tab) => {
      try {
        if (!breakpoints.md && !preview) {
          setPreview(tab);
          return;
        }
        setLoading(true);
        if (tab.onPress) {
          await tab.onPress();
          setLoading(false);
          return;
        }
        const data = await createTab(sessionToken, tab, false);
        mutate((oldData) => [...oldData, data], { revalidate: false });
        handleClose();

        router.replace({
          pathname: data.slug,
          params: {
            tab: data.id,
            ...tab.params,
          },
        });
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
              preview={preview}
              setPreview={handlePreviewChange}
              filtered={filtered}
              filter={filter}
              setFilter={setFilter}
              filters={filters}
              onCreate={onCreate}
            />
          </KeyboardAvoidingView>
        )}
        {(breakpoints.md || preview) && (
          <CommandPalettePreview
            setPreview={setPreview}
            onCreate={onCreate}
            preview={preview}
            loading={loading}
          />
        )}
      </View>
    </View>
  );
}
