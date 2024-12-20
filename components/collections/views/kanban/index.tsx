import { useCollectionContext } from "@/components/collections/context";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import IconButton from "@/ui/IconButton";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { CollectionEmpty } from "../CollectionEmpty";
import { Column } from "./Column";
import { KanbanContext } from "./context";

export default function Kanban() {
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
          {data &&
            Object.keys(data.entities)?.length > 0 &&
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
