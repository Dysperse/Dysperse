import {
  CollectionContext,
  useCollectionContext,
} from "@/components/collections/context";
import { CollectionMenuLayout } from "@/components/collections/menus/layout";
import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { Button } from "@/ui/Button";
import Divider from "@/ui/Divider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { setStringAsync } from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

const Link = ({ collection }) => {
  const theme = useColorTheme();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [defaultView, setDefaultView] = useState(
    collection?.data?.defaultView || "list"
  );
  const { data, mutate, error } = useSWR([
    "space/collections/collection/link",
    { id: collection?.data?.id },
  ]);

  const params = new URLSearchParams({
    type: defaultView,
    // ...(defaultView !== collection?.data?.defaultView && { type: defaultView }),
  });
  const url = `${
    process.env.NODE_ENV === "production"
      ? "https://go.dysperse.com"
      : "http://localhost:8081"
  }/c/${data?.id}${params.toString() ? `?${params}` : ""}`;

  return (
    <>
      {data ? (
        <ScrollView
          style={{
            padding: 20,
            paddingTop: 0,
          }}
        >
          <View
            style={{
              backgroundColor: theme[3],
              padding: 10,
              borderRadius: 20,
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
              height: 60,
              justifyContent: "center",
            }}
          >
            {isLoading ? (
              <Spinner />
            ) : data.disabled ? (
              <Text variant="eyebrow">Link disabled</Text>
            ) : (
              <>
                <TextField
                  value={url.replace("https://", "").replace("http://", "")}
                  style={{ flex: 1 }}
                  variant="filled"
                  editable={false}
                />
                <IconButton
                  onPress={async () => {
                    await setStringAsync(
                      `<iframe src="${url}" width="800px" height="400px" style="border: 2px solid #aaa;border-radius: 25px"></iframe>`
                    );
                    Toast.show({
                      type: "success",
                      text1: "Embed code copied!",
                    });
                  }}
                  icon="code"
                  size={40}
                />
                <IconButton
                  onPress={async () => {
                    await setStringAsync(url);
                    Toast.show({ type: "success", text1: "Link copied!" });
                  }}
                  icon="content_copy"
                  variant="outlined"
                  size={40}
                />
              </>
            )}
          </View>
          <Text variant="eyebrow">Preferences</Text>
          <ListItemButton disabled style={{ marginHorizontal: -13 }}>
            <ListItemText primary="Default view" />
            <MenuPopover
              trigger={
                <Button
                  text={capitalizeFirstLetter(defaultView)}
                  icon={COLLECTION_VIEWS[defaultView].icon}
                  variant="filled"
                />
              }
              options={Object.keys(COLLECTION_VIEWS).map((view) => ({
                text: capitalizeFirstLetter(view),
                icon: COLLECTION_VIEWS[view].icon,
                selected: defaultView === view,
                callback: () => setDefaultView(view),
              }))}
            />
          </ListItemButton>
          <Text variant="eyebrow" style={{ marginTop: 20 }}>
            Permissions
          </Text>
          <View style={{ marginHorizontal: -13 }}>
            {[
              {
                key: "NO_ACCESS",
                text: "No access",
                description: "Disables link sharing",
              },
              {
                key: "READ_ONLY",
                text: "View only",
                description:
                  "Anyone with the link can view, even those who don't have an account.",
              },
            ].map((access) => (
              <ListItemButton
                key={access.key}
                onPress={async () => {
                  setIsLoading(true);
                  const res = await sendApiRequest(
                    session,
                    "PUT",
                    "space/collections/collection/link",
                    {},
                    {
                      body: JSON.stringify({
                        id: collection.data.id,
                        access:
                          access.key === "NO_ACCESS" ? undefined : access.key,
                        disabled: access.key === "NO_ACCESS",
                      }),
                    }
                  );
                  if (res.error) return Toast.show({ type: "error" });
                  mutate(
                    {
                      ...data,
                      access: access.key,
                      disabled: access.key === "NO_ACCESS",
                    },
                    { revalidate: false }
                  );
                  setIsLoading(false);
                  Toast.show({ type: "success", text1: "Access updated!" });
                }}
              >
                <ListItemText
                  primary={access.text}
                  secondary={access.description}
                />
                {(access.key === "NO_ACCESS"
                  ? data.disabled
                  : data.access === access.key && !data.disabled) && (
                  <Icon>check</Icon>
                )}
              </ListItemButton>
            ))}
          </View>

          <Divider style={{ marginBottom: 10, marginTop: 15, height: 1 }} />
          <ListItemButton
            onPress={async () => {
              setIsLoading(true);
              await sendApiRequest(
                session,
                "PUT",
                "space/collections/collection/link",
                {},
                {
                  body: JSON.stringify({
                    id: collection.data.id,
                    refreshId: true,
                  }),
                }
              );
              await mutate();
              setIsLoading(false);
            }}
            style={{ marginHorizontal: -13 }}
          >
            <ListItemText
              primary="Refresh link"
              secondary="We'll create a new link, and old ones will not work"
            />
          </ListItemButton>
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {error ? <ErrorAlert /> : <Spinner />}
        </View>
      )}
    </>
  );
};

function Share() {
  const collection = useCollectionContext();
  useHotkeys("esc", () => router.back());

  return (
    <CollectionMenuLayout title="Link sharing">
      <Link collection={collection} />
    </CollectionMenuLayout>
  );
}

export default function Page() {
  const { id }: any = useLocalSearchParams();
  const { data, mutate, error } = useSWR(
    id
      ? [
          "space/collections/collection",
          id === "all" ? { all: "true", id: "??" } : { id },
        ]
      : null
  );

  const contextValue: CollectionContext = {
    data,
    type: "kanban",
    mutate,
    error,
    access: data?.access,
    openLabelPicker: () => {},
    swrKey: "space/collections/collection",
  };

  return (
    <CollectionContext.Provider value={contextValue}>
      {data && <Share />}
    </CollectionContext.Provider>
  );
}

