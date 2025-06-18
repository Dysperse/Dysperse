import { Entity } from "@/components/collections/entity";
import ContentWrapper from "@/components/layout/content";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Alert from "@/ui/Alert";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import ConfirmationModal from "@/ui/ConfirmationModal";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import RefreshControl from "@/ui/RefreshControl";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { FlashList } from "@shopify/flash-list";
import fuzzysort from "fuzzysort";
import { useCallback, useState } from "react";
import { Keyboard, Platform, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { MenuButton } from "../home";

const containerStyles = StyleSheet.create({
  root: { flexDirection: "row", flex: 1 },
  left: {
    flex: 1,
    borderRightWidth: 1,
    padding: 20,
    paddingBottom: 0,
  },
  rightEmpty: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  leftEmpty: {
    flex: 1,
    height: "100%",
    minHeight: 500,
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

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
        bold
        icon="delete"
        iconPosition="end"
        text="Clear"
        containerStyle={{ marginTop: !breakpoints.md ? -10 : 0 }}
      />
    </ConfirmationModal>
  );
};

export default function Trash() {
  const { session } = useSession();
  const { data, mutate, error, isValidating } = useSWR(["space/trash"]);
  const [query, setQuery] = useState("");

  const filteredData = fuzzysort
    .go(query, data || [], {
      keys: ["name", "note"],
      all: true,
    })
    .map((t) => t.obj);

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

  const isEmpty = (filteredData || []).filter((t) => t.trash).length === 0;
  const insets = useSafeAreaInsets();
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <ContentWrapper
      noPaddingTop
      style={!breakpoints.md && { paddingTop: insets.top + 70 }}
    >
      <MenuButton gradient addInsets />
      <View style={breakpoints.md ? containerStyles.root : { flex: 1 }}>
        <View
          style={[
            breakpoints.md && containerStyles.left,
            breakpoints.md && {
              borderRightColor: theme[5],
            },
          ]}
        >
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={!data} onRefresh={() => mutate()} />
            }
            onScrollBeginDrag={Keyboard.dismiss}
            bounces={breakpoints.md}
            style={
              breakpoints.md
                ? { flex: 1 }
                : { paddingHorizontal: 20, paddingTop: 20 }
            }
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                marginTop: 5,
              }}
            >
              <Text style={{ fontFamily: "serifText700", fontSize: 27 }}>
                Trash
              </Text>
            </View>
            <TextField
              value={query}
              onChangeText={setQuery}
              variant="filled+outlined"
              weight={800}
              placeholder="Search…"
              autoFocus={breakpoints.md && Platform.OS !== "ios"}
              style={{
                borderRadius: 99,
                paddingVertical: 15,
                paddingHorizontal: 20,
                fontSize: 20,
                marginBottom: 10,
              }}
            />
            <Alert
              emoji="26A0"
              title="Items are permanently deleted on the 1st of every month"
              dense
            />
            {!isEmpty && <DeleteAllButton handleDelete={handleDelete} />}
          </ScrollView>
        </View>
        <View
          style={[
            { flex: 2 },
            !breakpoints.md && {
              paddingHorizontal: 20,
              paddingTop: isEmpty ? 0 : 20,
            },
          ]}
        >
          {Array.isArray(filteredData) ? (
            isEmpty ? (
              <View
                style={{
                  alignItems: "center",
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <Icon size={40}>celebration</Icon>
                <Text
                  style={{
                    fontSize: 20,
                    textAlign: "center",
                    color: theme[11],
                  }}
                >
                  Nothing to see here!
                </Text>
              </View>
            ) : (
              <FlashList
                showsVerticalScrollIndicator={false}
                data={filteredData.filter((t) => t.trash)}
                contentContainerStyle={{
                  padding: breakpoints.md ? 20 : 0,
                  paddingTop: 0,
                }}
                style={{ flex: 1, backgroundColor: "red", height: "100%" }}
                refreshControl={
                  <RefreshControl
                    refreshing={isValidating}
                    onRefresh={() => mutate()}
                  />
                }
                renderItem={({ item }) => (
                  <Entity
                    isReadOnly={false}
                    showLabel
                    onTaskUpdate={(newTask) => {
                      mutate((oldData) =>
                        oldData.map((t) => (t.id === newTask.id ? newTask : t))
                      );
                    }}
                    item={item}
                  />
                )}
                keyExtractor={(item: any) => item.id}
              />
            )
          ) : error ? (
            <ErrorAlert />
          ) : (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <Spinner />
            </View>
          )}
        </View>
      </View>
    </ContentWrapper>
  );
}

