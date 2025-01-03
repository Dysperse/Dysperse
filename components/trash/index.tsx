import { Entity } from "@/components/collections/entity";
import ContentWrapper from "@/components/layout/content";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useCallback } from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import MenuIcon from "../menuIcon";

const DeleteAllButton = ({ handleDelete }) => {
  const breakpoints = useResponsiveBreakpoints();

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
        containerStyle={[!breakpoints.md && { width: "100%", marginTop: 20 }]}
      >
        <Icon>delete_forever</Icon>
        <ButtonText>Clear</ButtonText>
      </Button>
    </ConfirmationModal>
  );
};

export function Trash() {
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

  return (
    <ContentWrapper noPaddingTop>
      {!breakpoints.md && (
        <IconButton
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            marginTop: insets.top,
            zIndex: 1,
          }}
          icon={<MenuIcon />}
          size={55}
          variant="outlined"
          onPress={() => sidebarRef.current.openDrawer()}
        />
      )}
      <View style={{ paddingHorizontal: 20 }}>
        <View
          style={{
            flexDirection: breakpoints.md ? "row" : "column",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 20,
            paddingHorizontal: 20,
            paddingTop: breakpoints.md ? 50 : 100 + insets.top,
          }}
        >
          <View>
            <Text style={{ fontSize: 40 }} weight={800}>
              Trash
            </Text>
            <Text
              style={{
                opacity: 0.6,
              }}
            >
              Items are permanently deleted on the 1st of every month
            </Text>
          </View>
          <DeleteAllButton handleDelete={handleDelete} />
        </View>
        {Array.isArray(data) ? (
          <FlatList
            data={data.filter((t) => t.trash)}
            style={{
              flex: 1,
              height: "100%",
            }}
            contentContainerStyle={{
              paddingHorizontal: 35,
            }}
            centerContent={data.filter((t) => t.trash).length === 0}
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
              <View style={{ maxWidth: 400, width: "100%" }}>
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
              </View>
            )}
            //   ={100}
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

