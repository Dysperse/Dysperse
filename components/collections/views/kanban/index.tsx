import { useCollectionContext } from "@/components/collections/context";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Emoji from "@/ui/Emoji";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { CollectionEmpty } from "../CollectionEmpty";
import { Column } from "./Column";
import { KanbanContext } from "./context";

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
          {label.entities?.length} item
          {label.entities?.length !== 1 && "s"}
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
      style={{ padding: 20 }}
      contentContainerStyle={{ gap: 20 }}
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

export default function Kanban({ editOrderMode }) {
  const breakpoints = useResponsiveBreakpoints();
  const { data, openLabelPicker, access, isPublic } = useCollectionContext();
  const theme = useColorTheme();

  const [currentColumn, setCurrentColumn] = useState(0);

  const columns = data.kanbanOrder
    ? data.kanbanOrder.map((id) => data.labels.find((l) => l.id === id))
    : [];

  const isReadOnly = access?.access === "READ_ONLY" || isPublic;

  return !data.labels ? null : (
    <KanbanContext.Provider
      value={{
        currentColumn,
        setCurrentColumn,
        columnsLength: data.labels.length,
        hasOther: data.entities.length > 0,
      }}
    >
      {data.labels.length === 0 ? (
        <CollectionEmpty />
      ) : editOrderMode ? (
        <EditKanbanOrder />
      ) : (
        <ScrollView
          horizontal
          contentContainerStyle={[
            { flexDirection: "row", gap: 15 },
            breakpoints.md ? { padding: 15 } : { width: "100%" },
          ]}
          scrollEnabled={breakpoints.md}
        >
          {breakpoints.md
            ? columns.map(
                (label) => label && <Column key={label.id} label={label} />
              )
            : columns[currentColumn] && (
                <Column label={columns[currentColumn]} />
              )}
          {data.entities?.length > 0 &&
            (breakpoints.md || currentColumn === -1) && (
              <Column entities={data.entities} />
            )}
          {breakpoints.md && !isReadOnly && (
            <View
              style={{
                width: 300,
                flex: 1,
                minWidth: 5,
                minHeight: 5,
                backgroundColor: theme[2],
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconButton
                icon="add"
                variant="outlined"
                size={50}
                onPress={openLabelPicker}
              />
            </View>
          )}
          {columns?.length <= 4 &&
            breakpoints.md &&
            [...new Array(4 - columns?.length)].map((_, i) => (
              <View
                key={i}
                style={{
                  width: 300,
                  flex: 1,
                  minWidth: 5,
                  minHeight: 5,
                  backgroundColor: theme[2],
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            ))}
        </ScrollView>
      )}
    </KanbanContext.Provider>
  );
}

