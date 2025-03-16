import { useCollectionContext } from "@/components/collections/context";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import Emoji from "@/ui/Emoji";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { View } from "react-native";
import { DraggableGrid } from "react-native-draggable-grid";

export function ReorderingGrid() {
  const { session } = useSession();
  const theme = useColorTheme();

  const { data: collectionData, mutate } = useCollectionContext();

  const labels = collectionData.gridOrder.map((id) =>
    collectionData.labels.find((l) => l.id === id)
  );

  if (collectionData.entities.length > 0) labels.push({ other: true });
  if (labels.length % 2 !== 0) labels.push({ empty: true });
  if (labels.length < 4)
    labels.push(
      ...new Array(4 - labels.length).fill({
        empty: true,
      })
    );

  const updateLabelOrder = async (newOrder) => {
    const data = newOrder.map((l) => l.key).filter((e) => e);

    

    mutate(
      (oldData) => ({
        ...oldData,
        gridOrder: data,
        labels: newOrder.map((e) => e.label),
      }),
      {
        revalidate: false,
      }
    );

    await sendApiRequest(
      session,
      "PUT",
      "space/collections",
      {},
      { body: JSON.stringify({ id: collectionData.id, gridOrder: data }) }
    );
  };

  return (
    <View style={{ padding: 10 }}>
      <DraggableGrid
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
        numColumns={labels.length / 2}
        renderItem={(data: any) => (
          <View
            style={{
              flex: 1,
              width: 200,
              minHeight: 200,
              borderRadius: 20,
              padding: 10,
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
                padding: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!data.key ? null : (
                <>
                  <Emoji emoji={data.label.emoji} size={50} />
                  <Text
                    weight={900}
                    style={{
                      fontSize: 20,
                      textAlign: "center",
                      marginTop: 10,
                      paddingHorizontal: 10,
                      marginBottom: 5,
                    }}
                    numberOfLines={1}
                  >
                    {data.label.name}
                  </Text>
                  <Text>
                    {Object.keys(data.label.entities)?.length} item
                    {Object.keys(data.label.entities)?.length !== 1 && "s"}
                  </Text>
                </>
              )}
            </View>
          </View>
        )}
        data={labels
          .map((label) => ({
            label,
            key: label?.id,
          }))
          .filter((e) => e.key)}
        onDragRelease={updateLabelOrder}
      />
    </View>
  );
}

