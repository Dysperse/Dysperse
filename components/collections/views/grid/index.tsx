import { useCollectionContext } from "@/components/collections/context";
import { useColorTheme } from "@/ui/color/theme-provider";
import { View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Column } from "../planner/Column";
import { ReorderingGrid } from "./ReorderingGrid";

export function Grid({ editOrderMode }) {
  const { data } = useCollectionContext();
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
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
              style={{ flex: 1, minWidth: 5, minHeight: 5 }}
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
    );
  }

  return (
    <ScrollView
      horizontal
      contentContainerStyle={{
        padding: 15,
        gap: 15,
        minWidth: "100%",
        paddingRight: 30,
        flexDirection: "column",
      }}
      style={{
        minWidth: "100%",
      }}
    >
      {rows}
    </ScrollView>
  );
}
