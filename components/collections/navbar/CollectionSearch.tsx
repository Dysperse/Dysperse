import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet from "@/ui/BottomSheet";
import { Button } from "@/ui/Button";
import Chip from "@/ui/Chip";
import { useColorTheme } from "@/ui/color/theme-provider";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useCollectionContext } from "../context";
import { Entity } from "../entity";

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

function SearchList({ collection, listRef }) {
  const theme = useColorTheme();
  const { data, mutate } = collection;
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const inputRef = useRef(null);

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
    });

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
            placeholder="Search"
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
        <BottomSheetScrollView
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
        </BottomSheetScrollView>
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

export const CollectionSearch = ({ data }) => {
  const breakpoints = useResponsiveBreakpoints();
  const ref = useRef<BottomSheetModal>(null);
  const handleOpen = () => ref.current?.present();
  const handleClose = () => ref.current?.dismiss();
  const collection = useCollectionContext();
  const listRef = useRef(null);

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  return (
    <>
      <IconButton
        size={breakpoints.md ? 50 : 40}
        style={[breakpoints.md && { borderRadius: 20 }]}
        icon="search"
        onPress={handleOpen}
        variant={breakpoints.md ? "filled" : "outlined"}
      />
      <BottomSheet
        sheetRef={ref}
        snapPoints={["90%"]}
        index={0}
        enableContentPanningGesture={false}
        onClose={handleClose}
      >
        <Pressable style={styles.header} onPress={scrollToTop}>
          <IconButton
            variant="outlined"
            size={45}
            icon="arrow_back_ios_new"
            onPress={handleClose}
          />
          <Text style={styles.title}>Search</Text>
        </Pressable>
        <SearchList listRef={listRef} collection={collection} />
      </BottomSheet>
    </>
  );
};
