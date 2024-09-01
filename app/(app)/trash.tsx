import { Entity } from "@/components/collections/entity";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Alert from "@/ui/Alert";
import { Button } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { FlashList } from "@shopify/flash-list";
import { useCallback } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";

const DeleteAllButton = ({ handleDelete }) => {
  return (
    <ConfirmationModal
      height={400}
      title="Permanently delete trash?"
      secondary="Careful! You can't undo this."
      onSuccess={handleDelete}
    >
      <Button
        variant="filled"
        large
        bold
        icon="delete"
        iconPosition="end"
        text="Clear"
      />
    </ConfirmationModal>
  );
};

export default function Trash() {
  const { session } = useSession();
  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();
  const { sidebarRef } = useSidebarContext();
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

  console.log(data);

  const isEmpty = data.filter((t) => t.trash).length === 0;

  return (
    <View style={{ flex: 1, maxWidth: 500, marginHorizontal: "auto" }}>
      {Array.isArray(data) ? (
        <FlashList
          contentContainerStyle={{
            paddingVertical: 50,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={{ marginBottom: 20 }}>
              <Alert
                emoji="26A0"
                title="Heads up!"
                subtitle="Items are permanently deleted on the 1st of every month"
              />
              {!isEmpty && <DeleteAllButton handleDelete={handleDelete} />}
            </View>
          )}
          data={data.filter((t) => t.trash)}
          style={{
            flex: 1,
            height: "100%",
          }}
          centerContent={isEmpty}
          ListEmptyComponent={() => (
            <View
              style={{
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
                Nothing to see here!
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Entity
              isReadOnly={false}
              showLabel
              onTaskUpdate={(newTask) => {
                console.log("New task recieved", newTask);
                mutate((oldData) =>
                  oldData.map((t) => (t.id === newTask.id ? newTask : t))
                );
              }}
              item={item}
            />
          )}
          keyExtractor={(item: any) => item.id}
        />
      ) : error ? (
        <ErrorAlert />
      ) : (
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <Spinner />
        </View>
      )}
    </View>
  );
}

