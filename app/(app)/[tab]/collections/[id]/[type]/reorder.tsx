import {
  CollectionContext,
  useCollectionContext,
} from "@/components/collections/context";
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
import { Platform, ScrollView, View } from "react-native";
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

  return data.kanbanOrder ? (
    <ScrollView
      horizontal
      contentContainerStyle={{ gap: 20, padding: 20, paddingTop: 0 }}
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
const ReorderColumn = ({ label, index, handleColumnReorder }) => {
  const theme = useColorTheme();
  const { data } = useCollectionContext();
  const breakpoints = useResponsiveBreakpoints();

  const handleNext = () => {
    handleColumnReorder(label.id, index - 1);
  };

  const handlePrev = () => {
    handleColumnReorder(label.id, index + 1);
  };

  return (
    <View
      style={{
        width: 320,
        height: "100%",
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
        flexDirection: "row",
      }}
      key={label.id}
    >
      <IconButton
        icon="arrow_back_ios_new"
        disabled={index === 0}
        onPress={handleNext}
      />

      <View style={{ gap: 10, flex: 1, alignItems: "center" }}>
        <Emoji emoji={label.emoji} size={40} />
        <Text
          style={{ fontSize: 20, marginTop: 5 }}
          weight={900}
          numberOfLines={1}
        >
          {label.name}
        </Text>
        <Text style={{ fontSize: 17, opacity: 0.6, marginTop: -5 }}>
          {Object.keys(label.entities)?.length} item
          {Object.keys(label.entities)?.length !== 1 && "s"}
        </Text>
      </View>
      <IconButton
        icon="arrow_forward_ios"
        disabled={index === data.labels.length - 1}
        onPress={handlePrev}
      />
    </View>
  );
};

function Reorder({ handleClose }) {
  const theme = useColorTheme();
  useHotkeys("esc", () => router.back());

  return (
    <View style={{ flex: 1 }}>
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
          paddingTop: 60,
          flex: 1,
          backgroundColor: addHslAlpha(
            theme[1],
            Platform.OS === "android" ? 1 : 0.8
          ),
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontFamily: "serifText800",
            fontSize: 40,
            marginVertical: 40,
            marginBottom: 0,
          }}
        >
          Reorder labels
        </Text>
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              textAlign: "center",
              marginBottom: 15,
              opacity: 0.6,
            }}
          >
            Changes only apply to Kanban view
          </Text>
        </View>
        <EditKanbanOrder />
      </View>
    </View>
  );
}

export default function Page() {
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
    <CollectionContext.Provider value={contextValue}>
      {data && <Reorder handleClose={handleClose} />}
    </CollectionContext.Provider>
  );
}
