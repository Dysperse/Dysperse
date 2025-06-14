import { useCollectionContext } from "@/components/collections/context";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Emoji from "@/ui/Emoji";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useCallback } from "react";
import { Platform, StyleSheet, View } from "react-native";
import type { SortableGridRenderItem } from "react-native-sortables";
import Sortable from "react-native-sortables";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#36877F",
    height: 100,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export function Grid() {
  const { session } = useSession();
  const breakpoints = useResponsiveBreakpoints();
  const { data, mutate } = useCollectionContext();
  const theme = useColorTheme();

  const labels = data.gridOrder.map((id) =>
    data.labels.find((l) => l.id === id)
  );

  const renderItem = useCallback<SortableGridRenderItem<string>>(
    ({ item }) => (
      <View
        style={{
          flex: 1,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            flex: 1,
            width: "100%",
            backgroundColor: theme[4],
            borderRadius: 20,
            padding: 10,
            paddingVertical: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <>
            <Emoji emoji={item.emoji} size={50} />
            <Text
              weight={900}
              style={{
                fontSize: 17,
                textAlign: "center",
                marginTop: 10,
                paddingHorizontal: 10,
                marginBottom: 5,
              }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text>
              {Object.keys(item.entities)?.length} item
              {Object.keys(item.entities)?.length !== 1 && "s"}
            </Text>
          </>
        </View>
      </View>
    ),
    []
  );

  return (
    <Sortable.Grid
      dragActivationDelay={
        Platform.OS === "web" && breakpoints.md ? 0 : undefined
      }
      columns={Math.ceil(labels.length / 2)}
      data={labels}
      renderItem={renderItem}
      rowGap={10}
      columnGap={10}
      onActiveItemDropped={(res) => {
        const gridOrder = data.gridOrder;
        const { fromIndex, toIndex } = res;
        const item = gridOrder[fromIndex];
        const newGridOrder = [...gridOrder];
        newGridOrder.splice(fromIndex, 1);
        newGridOrder.splice(toIndex, 0, item);
        mutate(
          (oldData) => ({
            ...oldData,
            gridOrder: newGridOrder,
          }),
          {
            revalidate: false,
          }
        );
        sendApiRequest(
          session,
          "PUT",
          "space/collections",
          {},
          {
            body: JSON.stringify({
              id: data.id,
              gridOrder: newGridOrder,
            }),
          }
        );
      }}
    />
  );
}

export function ReorderingGrid() {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <Grid />
    </View>
  );
}

