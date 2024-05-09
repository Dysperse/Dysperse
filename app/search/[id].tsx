import { CollectionContext } from "@/components/collections/context";
import { Entity } from "@/components/collections/entity";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { Button } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha, useColor, useDarkMode } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { BlurView } from "expo-blur";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingRight: 60,
    paddingTop: 10,
  },
  title: { marginHorizontal: "auto", fontSize: 20, fontFamily: "body_800" },
  empty: { alignItems: "center", justifyContent: "center", padding: 20 },
  emptyHeading: {
    fontSize: 40,
    fontFamily: "body_800",
    textAlign: "center",
    marginTop: 5,
  },
  emptySubheading: {
    textAlign: "center",
    opacity: 0.6,
    fontSize: 20,
    fontFamily: "body_300",
  },
});

function SearchList({ collection, inputRef, listRef }) {
  const theme = useColorTheme();
  const { data, mutate } = collection;
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);

  const filters = [
    { label: "Important", icon: "push_pin", filter: (item) => item.pinned },
    {
      label: "Today",
      icon: "calendar_today",
      filter: (item) => item.due && dayjs(item.due).isToday(),
    },
    {
      label: "Overdue",
      icon: "schedule",
      filter: (item) =>
        item.due &&
        dayjs(item.due).isBefore(dayjs(), "day") &&
        !item.completionInstances.length,
    },
    {
      label: "Completed",
      icon: "check",
      filter: (task) => !task.recurrenceRule && task.completionInstances.length,
    },
    {
      label: "Repeats",
      icon: "loop",
      filter: (task) => task.recurrenceRule,
    },
  ];

  const handleSearch = (text) => setQuery(text);

  const filtered = [
    ...data.entities,
    ...data.labels.reduce((acc, curr) => [...acc, ...curr.entities], []),
  ]
    .filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.note?.toLowerCase()?.includes(query.toLowerCase())
    )
    .filter((item) => {
      return activeFilters.length
        ? activeFilters.some((filter) =>
            filters.find((f) => f.label === filter)?.filter(item)
          )
        : true;
    })
    .sort((a, b) => {
      if (a.completionInstances.length && !b.completionInstances.length)
        return 1;
      if (!a.completionInstances.length && b.completionInstances.length)
        return -1;
      if (a.recurrenceRule && !b.recurrenceRule) return -1;
      if (!a.recurrenceRule && b.recurrenceRule) return 1;
      return 0;
    });

  useEffect(() => {
    setTimeout(() => inputRef.current.focus(), 500);
  }, []);

  return (
    <>
      <View style={{ paddingTop: 20, gap: 10 }}>
        <View
          style={{
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <TextField
            inputRef={inputRef}
            placeholder="Find tasks..."
            variant="filled+outlined"
            onChangeText={handleSearch}
            style={{ flex: 1, height: 40 }}
          />
          {(query || activeFilters.length > 0) && (
            <Button
              variant="outlined"
              onPress={() => {
                setQuery("");
                setActiveFilters([]);
              }}
              style={{ height: 40 }}
            >
              <Text style={{ color: theme[11] }}>Clear</Text>
            </Button>
          )}
        </View>
        <ScrollView
          horizontal
          contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}
          showsHorizontalScrollIndicator={false}
        >
          {filters.map((filter) => (
            <Chip
              key={filter.label}
              label={filter.label}
              icon={
                <Icon filled={activeFilters.includes(filter.label)}>
                  {filter.icon}
                </Icon>
              }
              outlined={!activeFilters.includes(filter.label)}
              onPress={() => {
                setActiveFilters((prev) =>
                  prev.includes(filter.label)
                    ? prev.filter((f) => f !== filter.label)
                    : [...prev, filter.label]
                );
                inputRef.current.focus();
              }}
            />
          ))}
        </ScrollView>
      </View>
      <FlashList
        ref={listRef}
        data={filtered}
        contentContainerStyle={{
          padding: 25,
          paddingTop: 15,
          paddingHorizontal: 15,
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Entity
            showDate
            showLabel
            isReadOnly={collection.isReadOnly}
            item={item}
            onTaskUpdate={(newTask) => {
              if (!newTask) return;
              mutate(
                (oldData) => {
                  const labelIndex = oldData.labels.findIndex(
                    (l) => l?.id === newTask.label?.id
                  );
                  return labelIndex === -1
                    ? {
                        ...oldData,
                        entities: oldData.entities.map((e) =>
                          e.id === newTask.id ? newTask : e
                        ),
                      }
                    : {
                        ...oldData,
                        labels: oldData.labels.map((l) =>
                          l.id === newTask.label.id
                            ? {
                                ...l,
                                entities: l.entities.map((e) =>
                                  e.id === newTask.id ? newTask : e
                                ),
                              }
                            : l
                        ),
                      };
                },
                {
                  revalidate: false,
                }
              );
            }}
          />
        )}
        stickyHeaderHiddenOnScroll
        ListEmptyComponent={
          <View style={styles.empty}>
            <Emoji emoji="1f494" size={64} />
            <Text style={styles.emptyHeading}>Oh no!</Text>
            <Text style={styles.emptySubheading}>
              Nothing in this collection matched your search.
            </Text>
          </View>
        }
        centerContent={filtered.length === 0}
        ListHeaderComponent={
          filtered.length && (
            <View style={{ paddingHorizontal: 15, paddingBottom: 5 }}>
              <Text variant="eyebrow">
                {filtered.length} result{filtered.length !== 1 && "s"}
              </Text>
            </View>
          )
        }
      />
    </>
  );
}

function Page() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { width, height } = useWindowDimensions();

  const handleClose = () => router.back();

  const listRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  const { id }: any = useLocalSearchParams();
  const { data, mutate, error } = useSWR(
    id
      ? [
          "space/collections/collection",
          id === "all" ? { all: "true", id: "??" } : { id },
        ]
      : null
  );

  const contextValue = {
    data,
    type: "kanban",
    mutate,
    error,
    access: data?.access,
  };

  const isDark = useDarkMode();

  return (
    <BlurView
      tint={isDark ? "dark" : "prominent"}
      style={{
        margin: "auto",
        width: "100%",
        flex: 1,
        borderColor: theme[5],
        borderWidth: 1,
        borderRadius: 25,
        overflow: "hidden",
        maxWidth: breakpoints.md ? 900 : width,
        maxHeight: breakpoints.md ? Math.min(600, height / 1.3) : undefined,
      }}
    >
      <View style={{ flex: 1, backgroundColor: addHslAlpha(theme[2], 0.5) }}>
        <Pressable style={styles.header} onPress={scrollToTop}>
          <IconButton
            variant="outlined"
            size={45}
            icon="arrow_back_ios_new"
            onPress={handleClose}
          />
          <Text style={styles.title}>Search</Text>
        </Pressable>
        <CollectionContext.Provider value={contextValue as any}>
          {data && (
            <SearchList
              inputRef={inputRef}
              listRef={listRef}
              collection={contextValue}
            />
          )}
          {JSON.stringify(id)}
        </CollectionContext.Provider>
      </View>
    </BlurView>
  );
}

export default function Container() {
  const { session } = useUser();
  const theme = useColor(session?.user?.profile?.theme || "mint");

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

  if (!session || session?.error) return <Redirect href="/auth" />;

  return (
    <ColorThemeProvider theme={theme}>
      <BottomSheetModalProvider>
        <StatusBar barStyle="light-content" />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Page />
        </View>
      </BottomSheetModalProvider>
    </ColorThemeProvider>
  );
}
