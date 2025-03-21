import { MenuButton } from "@/app/(app)/home";
import { CollectionContext } from "@/components/collections/context";
import { Entity } from "@/components/collections/entity";
import { FadeOnRender } from "@/components/layout/FadeOnRender";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import fuzzysort from "fuzzysort";
import { useEffect, useRef, useState } from "react";
import { Keyboard, Platform, StyleSheet, View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { ScrollView } from "react-native-gesture-handler";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import useSWR from "swr";
import { mutations } from "../../mutations";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingRight: 60,
    paddingTop: 10,
  },
  title: { marginHorizontal: "auto", fontSize: 20 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: -100,
  },
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

  const filtered = fuzzysort
    .go(
      query,
      query.length > 2
        ? [
            ...Object.values(data.entities),
            ...data.labels.reduce(
              (acc, curr) => [...acc, ...Object.values(curr.entities)],
              []
            ),
          ]
        : [],
      { keys: ["name", "note"] }
    )
    .map((t) => t.obj)
    .filter((item) => {
      const matchesFilters = activeFilters.length
        ? activeFilters.some((filter) =>
            filters.find((f) => f.label === filter)?.filter(item)
          )
        : true;

      return matchesFilters;
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
    setTimeout(() => {
      inputRef.current?.focus?.({ preventScroll: true });
    }, 1000);
  }, [inputRef, breakpoints]);

  useHotkeys("esc", () => router.back());

  return (
    <View
      style={{
        flex: 1,
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <MenuButton back gradient />
      <View
        style={{
          gap: 10,
          paddingHorizontal: 20,
          paddingTop: query.length > 2 ? 50 : 40,
          flex: 1,
          backgroundColor: addHslAlpha(
            theme[1],
            Platform.OS === "android" ? 1 : 0.8
          ),
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
                fontFamily: "serifText700",
                opacity: query.length > 2 ? 1 : 0,
                fontSize: 30,
                marginLeft: 5,
                marginTop: query.length > 2 ? 30 : 0,
                marginBottom: query.length > 2 ? 20 : 0,
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
                value={query}
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
                  textAlign: "center",
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
                paddingHorizontal: 20,
              }}
              style={{ marginTop: 20, marginBottom: 5, marginHorizontal: -20 }}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {filters.map((filter) => (
                <Button
                  dense
                  key={filter.label}
                  text={filter.label}
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
                  backgroundColors={{
                    default: addHslAlpha(
                      theme[9],
                      activeFilters.includes(filter.label) ? 0.2 : 0.05
                    ),
                    hovered: addHslAlpha(
                      theme[9],
                      activeFilters.includes(filter.label) ? 0.3 : 0.1
                    ),
                    pressed: addHslAlpha(
                      theme[9],
                      activeFilters.includes(filter.label) ? 0.4 : 0.1
                    ),
                  }}
                />
              ))}
            </ScrollView>
          </View>
          <KeyboardAvoidingView
            behavior="height"
            style={{ marginHorizontal: -20, flex: 1 }}
          >
            <FadeOnRender>
              <FlashList
                onScrollBeginDrag={Keyboard.dismiss}
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
                    onTaskUpdate={mutations.categoryBased.update(mutate)}
                  />
                )}
                stickyHeaderHiddenOnScroll
                ListEmptyComponent={
                  query.length > 2 ? (
                    <View style={styles.empty}>
                      <Icon size={64}>heart_broken</Icon>
                      <Text
                        style={{
                          fontSize: 20,
                          marginTop: 10,
                          color: theme[11],
                          textAlign: "center",
                          marginBottom: 60,
                        }}
                      >
                        Nothing matched your search
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.empty}>
                      <Icon size={64}>search</Icon>
                      <Text
                        style={{
                          fontSize: 20,
                          marginTop: 10,
                          color: theme[11],
                          textAlign: "center",
                        }}
                      >
                        {query.length !== 0
                          ? `Type ${3 - query.length} more character${
                              query.length == 2 ? "" : "s"
                            }`
                          : "Type something to start\nseeing search results"}
                      </Text>
                    </View>
                  )
                }
                centerContent={filtered.length === 0}
              />
            </FadeOnRender>
          </KeyboardAvoidingView>
        </View>
      </View>
    </View>
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
    swrKey: "space/collections/collection" as any,
  };

  return (
    <>
      <CollectionContext.Provider value={contextValue}>
        <SystemBars style="light" />
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

