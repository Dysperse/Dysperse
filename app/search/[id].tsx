import { CollectionContext } from "@/components/collections/context";
import { Entity } from "@/components/collections/entity";
import { RouteDialogWrapper } from "@/components/layout/route-dialog";
import { RouteDialogContent } from "@/components/layout/route-dialog/content";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
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
  title: { marginHorizontal: "auto", fontSize: 20 },
  empty: { alignItems: "center", justifyContent: "center", padding: 20 },
  emptyHeading: {
    fontSize: 40,
    textAlign: "center",
    marginTop: 5,
  },
  emptySubheading: {
    textAlign: "center",
    opacity: 0.6,
    fontSize: 20,
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
      filter: (item) => item.start && dayjs(item.start).isToday(),
    },
    {
      label: "Overdue",
      icon: "schedule",
      filter: (item) =>
        item.start &&
        dayjs(item.start).isBefore(dayjs(), "day") &&
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
    inputRef.current?.focus?.({ preventScroll: true });
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
            placeholder="Find tasks…"
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

function Page({ handleClose }: { handleClose: () => void }) {
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

  const contextValue: CollectionContext = {
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
      <RouteDialogContent
        title="Search"
        handleClose={handleClose}
        onHeaderPress={scrollToTop}
      >
        <CollectionContext.Provider value={contextValue}>
          {data && (
            <SearchList
              handleClose={handleClose}
              inputRef={inputRef}
              listRef={listRef}
              collection={contextValue}
            />
          )}
        </CollectionContext.Provider>
      </RouteDialogContent>
    </View>
  );
}

export default function Container() {
  const handleClose = () =>
    router.canGoBack() ? router.back() : router.replace("/");

  return (
    <RouteDialogWrapper>
      <Page handleClose={handleClose} />
    </RouteDialogWrapper>
  );
}
