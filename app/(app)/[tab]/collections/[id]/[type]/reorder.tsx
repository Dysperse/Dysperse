import { MenuButton } from "@/app/(app)/home";
import {
  CollectionContext,
  useCollectionContext,
} from "@/components/collections/context";
import { ReorderingGrid } from "@/components/collections/views/grid/ReorderingGrid";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Emoji from "@/ui/Emoji";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router, useLocalSearchParams } from "expo-router";
import { Platform, Pressable, ScrollView, View } from "react-native";
import ReorderableList, {
  ReorderableListReorderEvent,
  useReorderableDrag,
} from "react-native-reorderable-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSWR from "swr";

function EditKanbanOrder() {
  const { session } = useSession();
  const { data, mutate } = useCollectionContext();

  const updatedKanbanOrder = data
    ? [
        ...data.kanbanOrder.filter((id) =>
          data.labels.some((label) => label.id === id)
        ),
        ...data.labels
          .filter((label) => !data.kanbanOrder.includes(label.id))
          .map((label) => label.id),
      ]
    : [];

  const handleColumnReorder = (id, newIndex) => {
    const currentIndex = updatedKanbanOrder.indexOf(id);
    const newOrder = [...updatedKanbanOrder];
    newOrder.splice(currentIndex, 1);
    newOrder.splice(newIndex, 0, id);

    sendApiRequest(
      session,
      "PUT",
      "space/collections",
      {},
      { body: JSON.stringify({ id: data.id, kanbanOrder: newOrder }) }
    );

    mutate(
      (data) => ({
        ...data,
        kanbanOrder: newOrder,
      }),
      {
        revalidate: false,
      }
    );
  };

  const insets = useSafeAreaInsets();

  return data.kanbanOrder ? (
    <ScrollView
      horizontal
      contentContainerStyle={{
        gap: 20,
        padding: 20,
        paddingTop: 0,
        paddingBottom: 0,
        marginBottom: insets.bottom,
      }}
    >
      {updatedKanbanOrder.map((label, index) => {
        const t = data.labels.find((i) => i.id === label);
        if (t)
          return (
            <ReorderColumn
              index={index}
              label={t}
              key={label}
              handleColumnReorder={handleColumnReorder}
            />
          );
      })}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Spinner />
    </View>
  );
}
const ReorderColumn = ({
  list,
  label,
  drag,
  index,
  handleColumnReorder,
}: {
  list?: boolean;
  label: any;
  drag;
  index: number;
  handleColumnReorder: (id: any, newIndex: any) => void;
}) => {
  const theme = useColorTheme();
  const { data } = useCollectionContext();
  const breakpoints = useResponsiveBreakpoints();

  const handleNext = () => handleColumnReorder(label.id, index - 1);
  const handlePrev = () => handleColumnReorder(label.id, index + 1);

  return (
    <Pressable
      onLongPress={Platform.OS !== "web" && drag}
      style={{
        width: list ? undefined : 250,
        height: list ? undefined : "100%",
        borderRadius: 20,
        backgroundColor: theme[3],
        ...(breakpoints.md && {
          borderRadius: 20,
          borderWidth: 1,
          borderColor: addHslAlpha(theme[5], 0.7),
        }),
        alignItems: "center",
        justifyContent: "space-between",
        gap: 30,
        padding: 20,
        marginBottom: 10,
        flexDirection: "row",
      }}
      key={label.id}
    >
      {Platform.OS === "web" ||
        (!list && (
          <IconButton
            icon={list ? "arrow_upward" : "arrow_back_ios_new"}
            disabled={index === 0}
            onPress={handleNext}
          />
        ))}
      <View
        style={{
          gap: list ? 20 : 10,
          flex: 1,
          alignItems: "center",
          flexDirection: list || breakpoints.md ? "row" : "column",
        }}
      >
        <Emoji
          emoji={label.emoji}
          size={!breakpoints.md ? 30 : list && breakpoints.md ? 24 : 40}
        />
        <View style={{ gap: 5, alignItems: list ? undefined : "center" }}>
          <Text
            style={{
              fontSize: !breakpoints.md ? 15 : list && breakpoints.md ? 17 : 20,
              marginTop: !breakpoints.md ? 0 : list && breakpoints.md ? 0 : 5,
            }}
            weight={breakpoints.md ? 500 : 900}
            numberOfLines={1}
          >
            {label.name}
          </Text>
          <Text
            style={{
              fontSize: !breakpoints.md ? undefined : 17,
              opacity: 0.6,
              marginTop: list && breakpoints.md ? 0 : -5,
            }}
          >
            {Object.keys(label.entities)?.length} item
            {Object.keys(label.entities)?.length !== 1 && "s"}
          </Text>
        </View>
      </View>
      {Platform.OS === "web" ||
        (!list && (
          <IconButton
            icon={list ? "arrow_downward" : "arrow_forward_ios"}
            disabled={index === data.labels.length - 1}
            onPress={handlePrev}
          />
        ))}
      {Platform.OS !== "web" && list && <IconButton icon="drag_indicator" />}
    </Pressable>
  );
};

const RenderEditItem = ({ item, index, updatedListOrder }) => {
  const { session } = useSession();
  const { data, mutate } = useCollectionContext();
  const drag = useReorderableDrag();

  const handleColumnReorder = (id, newIndex) => {
    const currentIndex = updatedListOrder.indexOf(id);
    const newOrder = [...updatedListOrder];
    newOrder.splice(currentIndex, 1);
    newOrder.splice(newIndex, 0, id);

    sendApiRequest(
      session,
      "PUT",
      "space/collections",
      {},
      { body: JSON.stringify({ id: data.id, listOrder: newOrder }) }
    );

    mutate(
      (data) => ({
        ...data,
        listOrder: newOrder,
      }),
      {
        revalidate: false,
      }
    );
  };

  const t = data.labels.find((i) => i.id === item);
  if (t)
    return (
      <ReorderColumn
        list
        drag={drag}
        index={index}
        label={t}
        key={item}
        handleColumnReorder={handleColumnReorder}
      />
    );
};

function EditListView() {
  const { session } = useSession();
  const { data, mutate } = useCollectionContext();

  const updatedListOrder = data
    ? [
        ...(data.listOrder || []).filter((id) =>
          data.labels.some((label) => label.id === id)
        ),
        ...(data.labels || [])
          .filter((label) => !(data.listOrder || []).includes(label.id))
          .map((label) => label.id),
      ]
    : [];

  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    const newOrder = [...updatedListOrder];
    newOrder.splice(from, 1);
    newOrder.splice(to, 0, updatedListOrder[from]);

    sendApiRequest(
      session,
      "PUT",
      "space/collections",
      {},
      { body: JSON.stringify({ id: data.id, listOrder: newOrder }) }
    );

    mutate(
      (data) => ({
        ...data,
        listOrder: newOrder,
      }),
      {
        revalidate: false,
      }
    );
  };

  return data ? (
    <ReorderableList
      onReorder={handleReorder}
      data={updatedListOrder}
      keyExtractor={(item) => item}
      renderItem={({ item, index }) => (
        <RenderEditItem
          updatedListOrder={updatedListOrder}
          item={item}
          index={index}
        />
      )}
      contentContainerStyle={{ padding: 20, paddingTop: 0 }}
    />
  ) : (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Spinner />
    </View>
  );
}

function Reorder() {
  const theme = useColorTheme();
  const { type: view } = useLocalSearchParams();
  useHotkeys("esc", () => router.back());

  return (
    <View style={{ flex: 1 }}>
      <MenuButton back gradient />
      <View
        style={{
          gap: 10,
          paddingTop: 60,
          flex: 1,
          backgroundColor: addHslAlpha(
            theme[1],
            Platform.OS === "android" ? 1 : 0.8
          ),
        }}
      >
        <View style={{ paddingHorizontal: 25 }}>
          <Text
            style={{
              fontFamily: "serifText700",
              fontSize: 30,
              marginVertical: 40,
              marginBottom: 5,
            }}
          >
            Reorder labels
          </Text>
          <Text
            style={{
              marginBottom: 15,
              opacity: 0.6,
            }}
          >
            Changes only apply to {view} view
          </Text>
        </View>
        {
          {
            kanban: <EditKanbanOrder />,
            list: <EditListView />,
            grid: <ReorderingGrid />,
          }[view as string]
        }
      </View>
    </View>
  );
}

export default function Page() {
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
    <CollectionContext.Provider value={contextValue}>
      {data && <Reorder />}
    </CollectionContext.Provider>
  );
}

