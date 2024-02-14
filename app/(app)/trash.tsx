import { Entity } from "@/components/collections/entity";
import { ContentWrapper } from "@/components/layout/content";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { Button, ButtonText } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { FlashList } from "@shopify/flash-list";
import { useCallback } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

const DeleteAllButton = ({ handleDelete }) => (
  <ConfirmationModal
    height={400}
    title="Permanently delete trash?"
    secondary="Careful! You can't undo this."
    onSuccess={handleDelete}
  >
    <Button variant="filled" large>
      <Icon>delete_forever</Icon>
      <ButtonText>Clear</ButtonText>
    </Button>
  </ConfirmationModal>
);

export default function Trash() {
  const { session } = useSession();
  const { data, mutate, error } = useSWR(["space/trash"]);

  const handleDelete = useCallback(async () => {
    try {
      mutate([], {
        revalidate: false,
        populateCache: () => [],
      });
      await sendApiRequest(session, "DELETE", "space/trash");
    } catch (e) {
      Toast.show({ type: "error" });
      mutate(data, {
        revalidate: false,
        populateCache: () => data,
      });
    }
  }, [session, data, mutate]);

  return (
    <ContentWrapper>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 40,
          paddingBottom: 20,
        }}
      >
        <View>
          <Text style={{ fontSize: 40 }} weight={800}>
            Trash
          </Text>
          <Text
            style={{
              fontStyle: "italic",
              opacity: 0.6,
            }}
            weight={200}
          >
            Items are permanently deleted on the 1st of every month{" "}
          </Text>
        </View>
        <DeleteAllButton handleDelete={handleDelete} />
      </View>
      {data ? (
        <FlashList
          data={data}
          style={{
            flex: 1,
            height: "100%",
          }}
          contentContainerStyle={{
            paddingHorizontal: 35,
          }}
          key={data.length}
          ListEmptyComponent={() => (
            <View
              style={{
                paddingTop: 100,
                alignItems: "center",
              }}
            >
              <Emoji size={50} emoji="1f389" />
              <Text
                style={{
                  fontSize: 20,
                  textAlign: "center",
                  padding: 20,
                  opacity: 0.6,
                }}
              >
                No items in trash!
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={{ maxWidth: 400, width: "100%" }}>
              <Entity
                onTaskUpdate={(newTask) => {
                  mutate(
                    data
                      .map((d) => (d.id === newTask.id ? newTask : d))
                      .filter((e) => e.trash),
                    { revalidate: false }
                  );
                }}
                openColumnMenu={() => {}}
                item={item}
              />
            </View>
          )}
          keyExtractor={(item: any) => item.id}
        />
      ) : error ? (
        <ErrorAlert />
      ) : (
        <Spinner />
      )}
    </ContentWrapper>
  );
}
