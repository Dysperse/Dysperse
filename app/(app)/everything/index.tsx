import { Entity } from "@/components/collections/entity";
import { CreateLabelModal } from "@/components/labels/createModal";
import ContentWrapper from "@/components/layout/content";
import { createTab } from "@/components/layout/openTab";
import { useSession } from "@/context/AuthProvider";
import { useStorageContext } from "@/context/storageContext";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR, { KeyedMutator } from "swr";
import { LabelEditModal } from "../[tab]/collections/[id]/LabelEditModal";
import Trash from "../trash";

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

export const LabelDetails = ({
  setSelectedLabel,
  mutateList,
  label,
}: {
  setSelectedLabel: any;
  mutateList: KeyedMutator<any>;
  label: any;
}) => {
  const breakpoints = useResponsiveBreakpoints();
  const { session } = useSession();
  const userTheme = useColorTheme();
  const labelTheme = useColor(label?.color || userTheme);

  const { data, mutate, error } = useSWR([
    "space/labels/label",
    { id: label?.id },
  ]);

  const handleLabelDelete = async () => {
    try {
      sendApiRequest(session, "DELETE", "space/labels/label", {
        id: label.id,
      });
      mutateList((d) => d.filter((f) => f.id !== label.id), {
        revalidate: false,
      });
      setSelectedLabel(null);
    } catch (e) {
      console.log(e);
      Toast.show({ type: "error" });
      mutateList();
    }
  };

  return (
    label && (
      <ScrollView
        style={{ flex: 2 }}
        showsVerticalScrollIndicator={Boolean(data?.entities)}
        contentContainerStyle={{ backgroundColor: labelTheme[1] }}
      >
        <ColorThemeProvider theme={labelTheme}>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              backgroundColor: labelTheme[3],
              padding: 15,
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            {!breakpoints.md && (
              <IconButton
                size={50}
                icon="arrow_back_ios_new"
                variant="outlined"
                style={{ marginRight: "auto" }}
                onPress={() => setSelectedLabel(null)}
              />
            )}
            {data && (
              <LabelEditModal
                label={data}
                onLabelUpdate={(updatedLabel) =>
                  mutateList(
                    (d) =>
                      d.map((l) =>
                        l.id === updatedLabel.id ? { ...l, ...updatedLabel } : l
                      ),
                    {
                      revalidate: false,
                    }
                  )
                }
                trigger={
                  <IconButton size={50} variant="outlined" icon="edit" />
                }
              />
            )}
            <ConfirmationModal
              title="Delete label?"
              secondary="Items won't be deleted"
              onSuccess={handleLabelDelete}
              height={350}
            >
              <IconButton variant="outlined" size={50} icon="delete" />
            </ConfirmationModal>
          </View>
          <LinearGradient
            style={[
              {
                height: 250,
                paddingHorizontal: breakpoints.md ? 100 : 30,
                padding: 20,
                paddingTop: 0,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: breakpoints.md ? "row" : "column",
                position: "relative",
                gap: 25,
              },
              !breakpoints.md && {
                paddingTop: 100,
                height: 350,
              },
            ]}
            colors={[labelTheme[3], labelTheme[2], labelTheme[1]]}
          >
            <Emoji emoji={label.emoji} size={60} />
            <View
              style={[
                !breakpoints.md && { width: "100%" },
                { maxWidth: "100%" },
              ]}
            >
              <Text
                style={[
                  {
                    fontSize: 40,
                    color: labelTheme[11],
                    fontFamily: "serifText800",
                  },
                  !breakpoints.md && { textAlign: "center" },
                ]}
                numberOfLines={1}
                weight={900}
              >
                {label.name}
              </Text>
              <Text
                style={[
                  {
                    fontSize: 20,
                    color: labelTheme[11],
                    opacity: 0.7,
                  },
                  !breakpoints.md && { textAlign: "center" },
                ]}
                weight={300}
              >
                {label._count.entities} item
                {label._count.entities !== 1 ? "s" : ""}
              </Text>
            </View>
          </LinearGradient>
          <View
            style={{
              padding: 20,
              paddingHorizontal: breakpoints.md ? 50 : undefined,
              marginTop: 20,
            }}
          >
            <View
              style={{
                padding: 20,
                gap: 10,
                flexDirection: "row",
                backgroundColor: labelTheme[2],
                borderWidth: 1,
                borderColor: labelTheme[5],
                borderRadius: 20,
              }}
            >
              <View style={{ flex: 1, gap: 5 }}>
                <Text variant="eyebrow">Collections</Text>
                {label.collections.length === 0 ? (
                  <Text style={{ color: labelTheme[7] }} weight={600}>
                    No collections found
                  </Text>
                ) : (
                  <View
                    style={{ flexWrap: "wrap", flexDirection: "row", gap: 15 }}
                  >
                    {label.collections.map((c) => (
                      <Chip key={c.id} label={c.name} icon="folder" />
                    ))}
                  </View>
                )}
              </View>
              {label.integration && (
                <View style={{ flex: 1, gap: 5 }}>
                  <Text variant="eyebrow" style={{ marginBottom: 5 }}>
                    Connected to
                  </Text>
                  <View
                    style={{ flexWrap: "wrap", flexDirection: "row", gap: 15 }}
                  >
                    <Chip
                      label={`${capitalizeFirstLetter(
                        label.integration.name.replaceAll("-", " ")
                      )}`}
                      icon="sync_alt"
                    />
                  </View>
                </View>
              )}
            </View>

            <View
              style={{
                padding: 20,
                gap: 3,
                backgroundColor: labelTheme[2],
                borderWidth: 1,
                borderColor: labelTheme[5],
                borderRadius: 20,
                marginTop: 20,
              }}
            >
              <Text variant="eyebrow">Items</Text>
              <View style={{ marginHorizontal: -10 }}>
                {data?.entities ? (
                  data?.entities?.length === 0 ? (
                    <Text
                      style={{ marginLeft: 10, color: labelTheme[7] }}
                      weight={600}
                    >
                      No items found
                    </Text>
                  ) : (
                    data.entities.map((entity) => (
                      <Entity
                        isReadOnly={false}
                        item={entity}
                        key={entity.id}
                        onTaskUpdate={(newEntity) => {
                          mutate(
                            (oldData) => {
                              const newData = oldData?.entities
                                .map((e) =>
                                  e.id === newEntity.id ? newEntity : e
                                )
                                .sort(
                                  (a, b) =>
                                    a.completionInstances.length -
                                    b.completionInstances.length
                                );
                              return { ...oldData, entities: newData };
                            },
                            { revalidate: false }
                          );
                        }}
                      />
                    ))
                  )
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
            </View>
          </View>
        </ColorThemeProvider>
      </ScrollView>
    )
  );
};

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

const Labels = () => {
  const [selectedLabel, setSelectedLabel] = useState<number | null>(null);
  const theme = useColorTheme();
  const [query, setQuery] = useState("");
  const { data, mutate, error } = useSWR(["space/labels"]);
  const breakpoints = useResponsiveBreakpoints();

  useHotkeys("esc", () => setSelectedLabel(null), {
    ignoreEventWhen: () =>
      document.querySelectorAll('[aria-modal="true"]').length > 0,
  });

  const d =
    Array.isArray(data) &&
    data.map((l) => ({ ...l, selected: l.id === selectedLabel }));

  const selectedLabelData = selectedLabel && d.find((i) => i.selected);

  return (
    <View style={containerStyles.root}>
      {Array.isArray(d) ? (
        <>
          {(breakpoints.md || !selectedLabelData) && (
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
                placeholder="Search labels…"
                autoFocus
              />
              <CreateLabelModal
                mutate={(newLabel) => {
                  mutate(
                    () => [
                      {
                        ...newLabel,
                        _count: { entities: 0 },
                        entities: [],
                        collections: [],
                      },
                      ...d,
                    ],
                    {
                      revalidate: false,
                    }
                  );
                }}
              >
                <Button
                  variant="filled"
                  large
                  containerStyle={{ marginTop: 10 }}
                >
                  <Icon bold>add</Icon>
                  <ButtonText weight={900}>New</ButtonText>
                </Button>
              </CreateLabelModal>
              {error && <ErrorAlert />}
              <FlashList
                estimatedItemSize={60}
                data={d.filter((l) =>
                  l.name.toLowerCase().includes(query.toLowerCase())
                )}
                ListEmptyComponent={() => (
                  <View style={containerStyles.leftEmpty}>
                    <Emoji emoji="1f937" size={40} />
                    <Text
                      style={{ color: theme[9], fontSize: 20 }}
                      weight={600}
                    >
                      No labels found
                    </Text>
                  </View>
                )}
                contentContainerStyle={{ paddingVertical: 20 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <ListItemButton
                    style={{ height: 60 }}
                    variant={item.selected ? "filled" : undefined}
                    onPress={() => {
                      if (breakpoints.md) {
                        setSelectedLabel(item.id);
                      } else {
                        router.push({
                          pathname: `/everything/labels/[id]`,
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
          {selectedLabelData ? (
            <LabelDetails
              mutateList={mutate}
              setSelectedLabel={setSelectedLabel}
              label={selectedLabelData}
            />
          ) : (
            breakpoints.md && (
              <View style={containerStyles.rightEmpty}>
                <Text style={{ color: theme[7], fontSize: 20 }} weight={600}>
                  No label selected
                </Text>
              </View>
            )
          )}
        </>
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

const Collections = () => {
  const [selectedCollection, setSelectedCollection] = useState<number | null>(
    null
  );
  const { isReached } = useStorageContext();
  const theme = useColorTheme();
  const [query, setQuery] = useState("");
  const { data, mutate, error } = useSWR(["space/collections"]);

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
                autoFocus
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
                estimatedItemSize={60}
                data={d.filter((l) =>
                  l.name.toLowerCase().includes(query.toLowerCase())
                )}
                ListEmptyComponent={() => (
                  <View style={containerStyles.leftEmpty}>
                    <Emoji emoji="1f937" size={40} />
                    <Text
                      style={{ color: theme[9], fontSize: 20 }}
                      weight={600}
                    >
                      No collections found
                    </Text>
                  </View>
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
              <View style={containerStyles.rightEmpty}>
                <Text style={{ color: theme[7], fontSize: 20 }} weight={600}>
                  No collection selected
                </Text>
              </View>
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
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<"labels" | "collections" | "deleted">(
    "labels"
  );
  const breakpoints = useResponsiveBreakpoints();

  const handleBack = () => {
    if (router.canGoBack()) return router.back();
    router.replace("/");
  };

  return (
    <ContentWrapper noPaddingTop>
      <LinearGradient
        colors={[theme[2], theme[3]]}
        style={{
          paddingTop: insets.top,
          borderBottomWidth: 1,
          borderBottomColor: theme[5],
          flexDirection: "row",
        }}
      >
        <IconButton
          icon={
            <View
              style={{ alignItems: "center", flexDirection: "row", gap: 15 }}
            >
              <Icon style={{ opacity: 0.6 }}>
                {breakpoints.md ? "arrow_back_ios_new" : "menu"}
              </Icon>
            </View>
          }
          onPress={handleBack}
          style={{
            position: "absolute",
            left: 15,
            top: insets.top + 15,
          }}
        />
        <View style={{ marginHorizontal: "auto", flexDirection: "row" }}>
          {[
            { label: "Labels", value: "labels" },
            { label: "Collections", value: "collections" },
            { label: "Recently deleted", value: "deleted" },
          ].map((button) => (
            <Button
              key={button.label}
              onPress={() => setView(button.value as any)}
              height={64}
              containerStyle={{ minWidth: 0 }}
              style={{ flexDirection: "column", gap: 0, paddingHorizontal: 20 }}
            >
              <ButtonText>{button.label}</ButtonText>
              {view === button.value && (
                <View
                  style={{
                    height: 5,
                    width: 15,
                    marginTop: 3,
                    marginBottom: -8,
                    borderRadius: 99,
                    backgroundColor: theme[11],
                    marginHorizontal: "auto",
                    flexShrink: 0,
                  }}
                />
              )}
            </Button>
          ))}
        </View>
      </LinearGradient>
      {view === "labels" ? (
        <Labels />
      ) : view === "deleted" ? (
        <Trash />
      ) : (
        <Collections />
      )}
    </ContentWrapper>
  );
}

