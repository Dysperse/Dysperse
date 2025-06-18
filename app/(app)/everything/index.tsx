import { Entity } from "@/components/collections/entity";
import { CreateLabelModal } from "@/components/labels/createModal";
import ContentWrapper from "@/components/layout/content";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import MenuIcon from "@/components/menuIcon";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import RefreshControl from "@/ui/RefreshControl";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import fuzzysort from "fuzzysort";
import { useState } from "react";
import { Keyboard, Platform, StyleSheet, View } from "react-native";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR, { KeyedMutator } from "swr";
import { LabelEditModal } from "../[tab]/collections/[id]/LabelEditModal";
import { MenuButton } from "../home";

const containerStyles = StyleSheet.create({
  root: { flexDirection: "row", flex: 1 },
  left: {
    flex: 1,
    borderRightWidth: 1,
    padding: 30,
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

export const handleLabelDelete = async (session, labelId) => {
  try {
    sendApiRequest(session, "DELETE", "space/labels/label", {
      id: labelId,
    });
  } catch (e) {
    console.log(e);
    Toast.show({ type: "error" });
  }
};

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
  const { sidebarRef } = useSidebarContext();
  const labelTheme = useColor(label?.color || userTheme);
  const { tab } = useLocalSearchParams();
  const isTab = !!tab;
  const { data, mutate, error } = useSWR([
    "space/labels/label",
    { id: label?.id },
  ]);

  const handleDelete = async () => {
    try {
      handleLabelDelete(session, label.id);
      mutateList((d) => d.filter((f) => f.id !== label.id), {
        revalidate: false,
      });
      setSelectedLabel(null);
    } catch (e) {
      mutateList();
      console.log(e);
      Toast.show({ type: "error" });
    }
  };

  const insets = useSafeAreaInsets();

  return (
    label && (
      <ScrollView
        style={{ flex: 2 }}
        showsVerticalScrollIndicator={Boolean(data?.entities)}
        contentContainerStyle={{ backgroundColor: labelTheme[1] }}
      >
        <View
          style={{
            height: 1000,
            marginTop: -1000,
            backgroundColor: labelTheme[3],
          }}
        />
        <ColorThemeProvider theme={labelTheme}>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              backgroundColor: labelTheme[3],
              padding: breakpoints.md ? 15 : 20,
              paddingTop: (isTab ? insets.top : 0) + 20,
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            {!breakpoints.md && (
              <IconButton
                size={isTab ? 40 : 50}
                icon={isTab ? <MenuIcon /> : "arrow_back_ios_new"}
                variant={isTab ? "filled" : "outlined"}
                style={{ marginRight: "auto" }}
                onPress={
                  isTab
                    ? () => sidebarRef.current.openDrawer()
                    : () => setSelectedLabel(null)
                }
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
                  <IconButton
                    size={isTab ? 40 : 50}
                    variant={isTab ? undefined : "outlined"}
                    icon="edit"
                  />
                }
              />
            )}
            <ConfirmationModal
              title="Delete label?"
              secondary="Items won't be deleted"
              onSuccess={handleDelete}
              height={350}
            >
              <IconButton
                variant={isTab ? undefined : "outlined"}
                size={isTab ? 40 : 50}
                icon="delete"
              />
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
                paddingTop: 50,
                height: 200,
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
                gap: breakpoints.md ? 10 : 20,
                flexDirection: breakpoints.md ? "row" : undefined,
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
                      <Button
                        chip
                        key={c.id}
                        text={c.name}
                        large
                        icon="folder"
                      />
                    ))}
                  </View>
                )}
              </View>
              {label.integration && (
                <View style={{ flex: 1, gap: 5 }}>
                  <Text
                    variant="eyebrow"
                    style={{ marginBottom: breakpoints.md ? 5 : 0 }}
                  >
                    Connected to
                  </Text>
                  <View
                    style={{ flexWrap: "wrap", flexDirection: "row", gap: 15 }}
                  >
                    <Button
                      chip
                      large
                      text={`${capitalizeFirstLetter(
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
  const insets = useSafeAreaInsets();

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
              <MenuButton gradient addInsets />
              <FlashList
                refreshControl={
                  <RefreshControl
                    refreshing={!data}
                    onRefresh={() => mutate()}
                  />
                }
                onScrollBeginDrag={Keyboard.dismiss}
                estimatedItemSize={60}
                ListHeaderComponent={() => (
                  <>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                        marginTop: breakpoints.md ? 0 : insets.top + 50,
                      }}
                    >
                      <Text
                        style={{ fontFamily: "serifText700", fontSize: 30 }}
                      >
                        Labels
                      </Text>
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
                        <IconButton variant="outlined" size={45} icon="add" />
                      </CreateLabelModal>
                    </View>
                    <TextField
                      value={query}
                      onChangeText={setQuery}
                      variant="filled+outlined"
                      weight={800}
                      placeholder="Search…"
                      style={{
                        borderRadius: 99,
                        paddingVertical: 15,
                        paddingHorizontal: 20,
                        fontSize: 20,
                        marginBottom: 20,
                      }}
                      autoFocus={breakpoints.md && Platform.OS !== "ios"}
                    />
                    {error && <ErrorAlert />}
                  </>
                )}
                data={fuzzysort
                  .go(query, d, {
                    keys: ["name"],
                    all: true,
                  })
                  .map((l) => l.obj)}
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
                          pathname: "/everything/labels/[id]",
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
              <Pressable
                onPress={() => Keyboard.dismiss()}
                style={containerStyles.rightEmpty}
              >
                <Text style={{ color: theme[7], fontSize: 20 }} weight={600}>
                  No label selected
                </Text>
              </Pressable>
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

export default function Page() {
  return (
    <ContentWrapper noPaddingTop>
      <Labels />
    </ContentWrapper>
  );
}

