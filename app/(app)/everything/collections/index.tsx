import ContentWrapper from "@/components/layout/content";
import { createTab } from "@/components/layout/openTab";
import { useSession } from "@/context/AuthProvider";
import { useStorageContext } from "@/context/storageContext";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import RefreshControl from "@/ui/RefreshControl";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useState } from "react";
import { Keyboard, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { MenuButton } from "../../home";

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

const OpenCollectionButton = ({ collection }) => {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);

  return (
    <IconButton
      onPress={async () => {
        try {
          setLoading(true);
          await createTab(session, {
            slug: `/[tab]/collections/[id]/[type]`,
            params: {
              id: collection.id,
              type: "kanban",
            },
          });
        } catch (e) {
          console.log(e);
          Toast.show({ type: "error" });
        } finally {
          setLoading(false);
        }
      }}
      variant="outlined"
      size={55}
      icon="open_in_new"
      disabled={loading}
    />
  );
};

export const CollectionDetails = ({
  mutateList,
  setSelectedCollection,
  collection,
}: any) => {
  const { session } = useSession();

  const handleDelete = async () => {
    try {
      sendApiRequest(session, "DELETE", "space/collections", {
        id: collection.id,
      });
      mutateList((d) => d.filter((f) => f.id !== collection.id), {
        revalidate: false,
      });
      setSelectedCollection(null);
    } catch (e) {
      console.log(e);
      Toast.show({ type: "error" });
      mutateList();
    }
  };

  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={{
        flex: 2,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {!breakpoints.md && (
        <IconButton
          size={55}
          icon="arrow_back_ios_new"
          style={{ position: "absolute", top: 10, left: 10 }}
          onPress={() => setSelectedCollection(null)}
        />
      )}
      <Emoji emoji={collection.emoji} size={60} />
      <View
        style={{
          gap: 5,
          marginVertical: 20,
          alignItems: "center",
          width: "100%",
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{ fontSize: 40, fontFamily: "serifText800" }}
          weight={900}
          numberOfLines={1}
        >
          {collection.name}
        </Text>
        <Text style={{ fontSize: 20, opacity: 0.6 }} weight={300}>
          Created by {collection.createdBy.profile.name}
        </Text>
        {collection.integrationId && (
          <Text style={{ fontSize: 20, opacity: 0.6 }} weight={300}>
            Connected to{" "}
            {capitalizeFirstLetter(
              collection.integration.name.replaceAll("-", " ")
            )}
          </Text>
        )}
        <Text style={{ fontSize: 20, opacity: 0.6 }} weight={300}>
          {collection._count.labels} label
          {collection._count.labels !== 1 && "s"} &bull;{" "}
          {collection._count.entities} item
          {collection._count.entities !== 1 && "s"}
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <OpenCollectionButton collection={collection} />
        <ConfirmationModal
          title="Delete collection?"
          secondary="Items or labels won't be deleted"
          onSuccess={handleDelete}
          height={400}
        >
          <IconButton variant="outlined" size={55} icon="delete" />
        </ConfirmationModal>
      </View>
    </View>
  );
};

const Collections = () => {
  const [selectedCollection, setSelectedCollection] = useState<number | null>(
    null
  );
  const { isReached } = useStorageContext();
  const theme = useColorTheme();
  const [query, setQuery] = useState("");
  const { data, mutate, error, isValidating } = useSWR(["space/collections"]);

  useHotkeys("esc", () => setSelectedCollection(null), {
    ignoreEventWhen: () =>
      document.querySelectorAll('[aria-modal="true"]').length > 0,
  });

  const d =
    Array.isArray(data) &&
    data.map((l) => ({ ...l, selected: l.id === selectedCollection }));

  const selectedCollectionData =
    selectedCollection && d.find((i) => i.selected);
  const breakpoints = useResponsiveBreakpoints();
  return (
    <View style={containerStyles.root}>
      {Array.isArray(d) ? (
        <>
          {(breakpoints.md || !selectedCollectionData) && (
            <View
              style={[
                containerStyles.left,
                {
                  borderRightColor: theme[5],
                },
              ]}
            >
              <TextField
                value={query}
                onChangeText={setQuery}
                variant="filled+outlined"
                style={{ height: 50, fontSize: 20 }}
                weight={900}
                placeholder="Search collections…"
                autoFocus={breakpoints.md}
              />
              {!isReached && (
                <Button
                  variant="filled"
                  large
                  containerStyle={{ marginTop: 10 }}
                  onPress={() => router.push("/collections/create")}
                >
                  <Icon bold>add</Icon>
                  <ButtonText weight={900}>New</ButtonText>
                </Button>
              )}
              <FlashList
                refreshControl={
                  <RefreshControl
                    refreshing={isValidating}
                    onRefresh={() => mutate()}
                  />
                }
                onScrollBeginDrag={Keyboard.dismiss}
                estimatedItemSize={60}
                data={d.filter((l) =>
                  l.name.toLowerCase().includes(query.toLowerCase())
                )}
                ListEmptyComponent={() => (
                  <Pressable
                    onPress={Keyboard.dismiss}
                    style={containerStyles.leftEmpty}
                  >
                    <Emoji emoji="1f937" size={40} />
                    <Text
                      style={{ color: theme[9], fontSize: 20 }}
                      weight={600}
                    >
                      No collections found
                    </Text>
                  </Pressable>
                )}
                contentContainerStyle={{ paddingVertical: 20 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <ListItemButton
                    style={{ height: 60 }}
                    variant={item.selected ? "filled" : undefined}
                    onPress={() => {
                      if (breakpoints.md) {
                        setSelectedCollection(item.id);
                      } else {
                        router.push({
                          pathname: `/everything/collections/[id]`,
                          params: { id: item.id },
                        });
                      }
                    }}
                  >
                    <Emoji emoji={item.emoji} size={30} />
                    <ListItemText
                      truncate
                      primary={item.name}
                      secondary={`${item._count.entities} item${
                        item._count.entities !== 1 ? "s" : ""
                      }`}
                    />
                  </ListItemButton>
                )}
                keyExtractor={(item) => item.id.toString()}
              />
            </View>
          )}
          {selectedCollectionData ? (
            <CollectionDetails
              mutateList={mutate}
              setSelectedCollection={setSelectedCollection}
              collection={selectedCollectionData}
            />
          ) : (
            breakpoints.md && (
              <Pressable
                onPress={Keyboard.dismiss}
                style={containerStyles.rightEmpty}
              >
                <Text style={{ color: theme[7], fontSize: 20 }} weight={600}>
                  No collection selected
                </Text>
              </Pressable>
            )
          )}
        </>
      ) : error ? (
        <ErrorAlert />
      ) : (
        <View
          style={{
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <Spinner />
        </View>
      )}
    </View>
  );
};

export default function Page() {
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <ContentWrapper
      noPaddingTop
      style={!breakpoints.md && { paddingTop: insets.top + 70 }}
    >
      {!breakpoints.md && <MenuButton gradient addInsets />}
      <Collections />
    </ContentWrapper>
  );
}
