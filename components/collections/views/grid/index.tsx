import { useCollectionContext } from "@/components/collections/context";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Emoji from "@/ui/Emoji";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Column } from "../kanban/Column";
import { ReorderingGrid } from "./ReorderingGrid";
import { GridContext, GridContextSelectedColumn } from "./context";

export function Grid({ editOrderMode }) {
  const theme = useColorTheme();
  const { data } = useCollectionContext();
  const { width } = useWindowDimensions();
  const breakpoints = useResponsiveBreakpoints();

  const [currentColumn, setCurrentColumn] =
    useState<GridContextSelectedColumn>(0);

  if (!Array.isArray(data.labels) || !data.gridOrder) return null;

  // Create a new array for rendering purposes without modifying the original data
  const displayLabels = data.gridOrder.map((id) =>
    data.labels.find((l) => l.id === id)
  );

  if (data.entities.length > 0) displayLabels.push({ other: true });
  if (displayLabels.length % 2 !== 0) displayLabels.push({ empty: true });
  if (displayLabels.length < 4)
    displayLabels.push(
      ...new Array(4 - displayLabels.length).fill({
        empty: true,
      })
    );

  if (editOrderMode) {
    return <ReorderingGrid labels={displayLabels} />;
  }

  const rowCount = 2;
  const itemsPerRow = displayLabels.length / rowCount;
  const rows = [];

  for (let i = 0; i < rowCount; i++) {
    const row = displayLabels.slice(i * itemsPerRow, (i + 1) * itemsPerRow);
    rows.push(
      currentColumn === "HOME" ? (
        <View
          key={i}
          style={{
            flexDirection: "row",
            gap: 15,
            flex: 1,
            minWidth: 5,
            minHeight: 5,
          }}
        >
          {row
            .filter((e) => e)
            .map((label, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  minWidth: 200,
                  minHeight: 5,
                  borderWidth: 2,
                  borderColor: theme[6],
                  borderRadius: 25,
                  justifyContent: "flex-end",
                  padding: 20,
                }}
              >
                <Emoji emoji={label.emoji || "1f4ad"} size={50} />
                <Text style={{ fontSize: 20 }} weight={900}>
                  {label.name}
                </Text>
                <Text weight={200}>
                  {label._count?.entities}
                  {" item"}
                  {label._count?.entities !== 1 ? "s" : ""}
                </Text>
              </View>
            ))}
        </View>
      ) : (
        <View
          key={i}
          style={{
            flexDirection: "row",
            gap: 15,
            flex: 1,
            minWidth: 5,
            minHeight: 5,
          }}
        >
          {row
            .filter((e) => e)
            .map((label, i) => (
              <View
                key={label.id || i}
                style={{
                  flex: 1,
                  minWidth: 5,
                  minHeight: 5,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: theme[2],
                    borderRadius: 25,
                    width:
                      displayLabels.length > 4
                        ? width / 2 - 230
                        : width / 2 - 145,
                  }}
                >
                  {label.empty ? (
                    <></>
                  ) : label.other ? (
                    <Column grid entities={data.entities} />
                  ) : (
                    <Column key={label.id} grid label={label} />
                  )}
                </View>
              </View>
            ))}
        </View>
      )
    );
  }

  return (
    <GridContext.Provider value={{ currentColumn, setCurrentColumn }}>
      <ScrollView
        horizontal
        contentContainerStyle={[
          breakpoints.md || currentColumn === "HOME"
            ? {
                padding: 15,
                gap: 15,
                minWidth: "100%",
                paddingRight: 30,
                flexDirection: "column",
              }
            : { width: "100%" },
          currentColumn === "HOME" && {
            backgroundColor: theme[3],
          },
        ]}
        scrollEnabled={breakpoints.md || currentColumn === "HOME"}
        style={{
          minWidth: "100%",
        }}
      >
        {breakpoints.md ? (
          rows
        ) : currentColumn === "HOME" ? (
          rows
        ) : currentColumn === "OTHER" ? (
          <Column grid entities={data.entities} />
        ) : (
          <Column grid label={displayLabels[currentColumn]} />
        )}
      </ScrollView>
    </GridContext.Provider>
  );
}
