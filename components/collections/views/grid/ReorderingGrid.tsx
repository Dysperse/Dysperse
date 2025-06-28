import { useCollectionContext } from "@/components/collections/context";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Emoji from "@/ui/Emoji";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { useCallback } from "react";
import { Platform, View } from "react-native";
import type { SortableGridRenderItem } from "react-native-sortables";
import Sortable from "react-native-sortables";

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
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",

          backgroundColor: "#36877F",
          height: 150,
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
            <Emoji emoji={item?.emoji} size={50} />
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
              {item?.name}
            </Text>
            <Text>
              {Object.keys(item?.entities || {})?.length} item
              {Object.keys(item?.entities || {})?.length !== 1 && "s"}
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
      onOrderChange={() => impactAsync(ImpactFeedbackStyle.Light)}
      onDragStart={() => impactAsync(ImpactFeedbackStyle.Medium)}
      onActiveItemDropped={(res) => {
        console.log(res);
        if (res.fromIndex === -1) return;
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
    <View style={{ paddingHorizontal: 20, height: "100%" }}>
      <Grid />
    </View>
  );
}

