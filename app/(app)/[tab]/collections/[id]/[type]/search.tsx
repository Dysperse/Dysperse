import { CollectionContext } from "@/components/collections/context";
import { Entity } from "@/components/collections/entity";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { BlurView } from "expo-blur";
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
    <BlurView
      intensity={30}
      style={{
        flex: 1,
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <IconButton
        size={55}
        icon="close"
        onPress={handleClose}
        style={{
          position: "absolute",
          top: 30,
          left: 30,
          zIndex: 1,
          borderWidth: 2,
        }}
        variant="outlined"
      />
      <View
        style={{
          gap: 10,
          paddingHorizontal: 20,
          paddingTop: 60,
          flex: 1,
          backgroundColor: addHslAlpha(theme[1], 0.8),
        }}
      >
        <View
          style={{
            width: 450,
            maxWidth: "100%",
            marginHorizontal: "auto",
            flex: 1,
          }}
        >
          <View>
            <Text
              style={{
                textAlign: "center",
                fontFamily: "serifText800",
                fontSize: 30,
                marginTop: 30,
                marginBottom: 20,
              }}
            >
              {filtered.length} result{filtered.length !== 1 && "s"}
            </Text>
            <View
              style={{
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
                    listRef.current.scrollToOffset({
                      animated: true,
                      offset: 0,
                    });
                  }
                  if (nativeEvent.key === "Escape") handleClose();
                }}
                variant="filled+outlined"
                onChangeText={handleSearch}
                weight={900}
                style={{
                  flex: 1,
                  height: 60,
                  paddingHorizontal: 20,
                  fontSize: 20,
                  borderRadius: 999,
                }}
              />
              {(query || activeFilters.length > 0) && (
                <Button
                  variant="outlined"
                  onPress={() => {
                    setQuery("");
                    setActiveFilters([]);
                  }}
                  height={60}
                  containerStyle={{ maxWidth: 120 }}
                >
                  <Text weight={900} style={{ color: theme[11] }}>
                    Clear
                  </Text>
                </Button>
              )}
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={{
                gap: 10,
              }}
              style={{ marginTop: 20, marginBottom: 5 }}
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
                    borderColor: addHslAlpha(
                      theme[11],
                      activeFilters.includes(filter.label) ? 0.5 : 0.2
                    ),
                    backgroundColor: addHslAlpha(
                      theme[11],
                      activeFilters.includes(filter.label) ? 0.1 : 0
                    ),
                  }}
                />
              ))}
            </ScrollView>
          </View>
          <View style={{ marginHorizontal: -20, flex: 1 }}>
            <FlashList
              ref={listRef}
              keyboardShouldPersistTaps="handled"
              data={filtered}
              style={{ backgroundColor: "red" }}
              contentContainerStyle={{
                padding: 25,
                paddingTop: 15,
                paddingHorizontal: 15,
              }}
              estimatedItemSize={150}
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
            />
          </View>
        </View>
      </View>
    </BlurView>
  );
}

export default function Page() {
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const handleClose = () =>
    router.canGoBack() ? router.back() : router.navigate("/");

  const { id }: any = useLocalSearchParams();
  const { data, mutate, error } = useSWR(
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
    openLabelPicker: () => {},
    swrKey: "space/collections/collection",
  };

  return (
    <>
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
    </>
  );
}

