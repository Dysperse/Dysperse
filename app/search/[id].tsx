import { CollectionContext } from "@/components/collections/context";
import { Entity } from "@/components/collections/entity";
import { useUser } from "@/context/useUser";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { Button } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { MenuProvider } from "react-native-popup-menu";
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

function SearchList({ collection, inputRef, listRef, handleClose }) {
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
  const breakpoints = useResponsiveBreakpoints();

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus?.(), breakpoints.md ? 0 : 700);
  }, [inputRef, breakpoints]);

  useHotkeys("esc", () => router.back());

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
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Enter") {
                listRef.current.scrollToOffset({ animated: true, offset: 0 });
              }
              if (nativeEvent.key === "Escape") handleClose();
            }}
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
              onPress={() => {
                setActiveFilters((prev) =>
                  prev.includes(filter.label)
                    ? prev.filter((f) => f !== filter.label)
                    : [...prev, filter.label]
                );
                inputRef.current.focus();
              }}
              style={{
                borderColor:
                  theme[activeFilters.includes(filter.label) ? 8 : 6],
                backgroundColor:
                  theme[activeFilters.includes(filter.label) ? 6 : 1],
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
        estimatedItemSize={95}
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

function Page({ handleClose }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { width, height } = useWindowDimensions();

  const listRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  const { id }: any = useLocalSearchParams();
  const { data, mutate, error, isValidating } = useSWR(
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
    isValidating,
  };

  return (
    <View
      style={{ backgroundColor: "rgba(0,0,0,0.05)", flex: 1, width: "100%" }}
    >
      <View
        style={{
          margin: "auto",
          width: "100%",
          flex: 1,
          borderColor: theme[5],
          borderWidth: breakpoints.md ? 1 : 0,
          borderRadius: 25,
          overflow: "hidden",
          maxWidth: breakpoints.md ? 900 : width,
          maxHeight: breakpoints.md ? Math.min(600, height / 1.3) : undefined,

          shadowColor: "rgba(0, 0, 0, 0.12)",
          shadowOffset: {
            width: 10,
            height: 10,
          },
          shadowOpacity: 1,
          shadowRadius: 30,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ flex: 1, backgroundColor: theme[1] }}
        >
          <Pressable style={styles.header} onPress={scrollToTop}>
            <IconButton
              size={45}
              icon="arrow_back_ios_new"
              onPress={handleClose}
            />
            <Text style={styles.title}>Search</Text>
          </Pressable>
          <CollectionContext.Provider value={contextValue as any}>
            {data && (
              <SearchList
                handleClose={handleClose}
                inputRef={inputRef}
                listRef={listRef}
                collection={contextValue}
              />
            )}
          </CollectionContext.Provider>
        </Pressable>
      </View>
    </View>
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
  const handleClose = () =>
    router.canGoBack() ? router.back() : router.replace("/");

  return (
    <ColorThemeProvider theme={theme}>
      <MenuProvider
        skipInstanceCheck
        customStyles={{
          backdrop: {
            flex: 1,
            opacity: 1,
            ...(Platform.OS === "web" &&
              ({ WebkitAppRegion: "no-drag" } as any)),
          },
        }}
      >
        <BottomSheetModalProvider>
          <StatusBar barStyle="light-content" />
          <Pressable
            onPress={handleClose}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Page handleClose={handleClose} />
          </Pressable>
        </BottomSheetModalProvider>
      </MenuProvider>
    </ColorThemeProvider>
  );
}
