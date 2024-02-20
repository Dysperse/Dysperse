import { useCollectionContext } from "@/components/collections/context";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Column } from "./Column";
import { KanbanContext } from "./context";

export function Kanban() {
  const breakpoints = useResponsiveBreakpoints();
  const { data } = useCollectionContext();
  const theme = useColorTheme();

  const [currentColumn, setCurrentColumn] = useState(0);

  return !data.labels ? null : (
    <KanbanContext.Provider
      value={{
        currentColumn,
        setCurrentColumn,
        columnsLength: data.labels.length,
      }}
    >
      <ScrollView
        horizontal
        contentContainerStyle={[
          {
            flexDirection: "row",
            gap: 15,
          },
          breakpoints.md
            ? {
                padding: 15,
              }
            : {
                width: "100%",
              },
        ]}
        scrollEnabled={breakpoints.md}
      >
        {breakpoints.md
          ? data.labels.map(
              (label) => label && <Column key={label.id} label={label} />
            )
          : data.labels[currentColumn] && (
              <Column label={data.labels[currentColumn]} />
            )}
        {data.entities?.length > 0 &&
          (breakpoints.md || currentColumn === -1) && (
            <Column entities={data.entities} />
          )}
        {data.labels?.length <= 4 &&
          [...new Array(4 - data.labels?.length)].map((_, i) => (
            <View
              key={i}
              style={{
                width: 300,
                flex: 1,
                minWidth: 5,
                minHeight: 5,
                backgroundColor: theme[2],
                borderRadius: 20,
              }}
            />
          ))}
      </ScrollView>
    </KanbanContext.Provider>
  );
}
