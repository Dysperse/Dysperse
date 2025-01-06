import { Entity } from "@/components/collections/entity";
import ContentWrapper from "@/components/layout/content";
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
import { MenuButton } from "../home";

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

  const isEmpty = (data || []).filter((t) => t.trash).length === 0;
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <ContentWrapper noPaddingTop style={{ paddingTop: insets.top + 70 }}>
      {!breakpoints.md && <MenuButton gradient addInsets />}
      <View style={{ flex: 1, maxWidth: 500, marginHorizontal: "auto" }}>
        <Text
          style={{
            fontSize: 35,
            marginBottom: 10,
            marginTop: 40,
            fontFamily: "serifText800",
          }}
        >
          Recently deleted
        </Text>
        <View style={{ marginBottom: 20 }}>
          <Alert
            emoji="26A0"
            title="Items are permanently deleted on the 1st of every month"
            dense
          />
          {!isEmpty && <DeleteAllButton handleDelete={handleDelete} />}
        </View>
        {Array.isArray(data) ? (
          <FlashList
            showsVerticalScrollIndicator={false}
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
    </ContentWrapper>
  );
}

