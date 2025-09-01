import { ProfileModal } from "@/components/ProfileModal";
import {
  CollectionContext,
  useCollectionContext,
} from "@/components/collections/context";
import { CollectionMenuLayout } from "@/components/collections/menus/layout";
import { PublishCollection } from "@/components/collections/navbar/PublishCollection";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import Divider from "@/ui/Divider";
import DropdownMenu from "@/ui/DropdownMenu";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { showErrorToast } from "@/utils/errorToast";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { toast } from "sonner-native";
import useSWR from "swr";

const modalStyles = StyleSheet.create({
  eyebrow: { marginTop: 10, marginBottom: 5, marginLeft: 5 },
});

const CollectionInvitedUser = ({ isReadOnly, mutateList, user }: any) => {
  const { session } = useSession();
  const ref = useRef(null);
  const handleDelete = async () => {
    const res = await sendApiRequest(
      session,
      "DELETE",
      "space/collections/collection/share",
      { id: user.id }
    );
    if (res.error) return showErrorToast();
    toast.success("Access removed");
    mutateList(
      (d) => ({
        ...d,
        invitedUsers: d.invitedUsers.filter((i) => i.id !== user.id),
      }),
      {
        revalidate: false,
      }
    );
    setTimeout(() => {
      ref.current?.close();
    }, 100);
  };

  return (
    <ProfileModal email={user.user.email}>
      <ListItemButton>
        <ProfilePicture
          name={user.user.profile.name}
          image={user.user.profile.picture}
          size={40}
          disabled
        />
        <ProfileModal email={user.user.email}>
          <ListItemText
            primary={user.user.profile.name}
            secondary={capitalizeFirstLetter(
              user.access.toLowerCase().replaceAll("_", " ")
            )}
          />
        </ProfileModal>
        {!isReadOnly && (
          <DropdownMenu
            ref={ref}
            horizontalPlacement="right"
            options={[
              ...[
                { text: "View only", value: "READ_ONLY" },
                { text: "Can edit", value: "EDITOR" },
              ].map((button) => ({
                ...button,
                selected: user.access === button.value,
                onPress: async () => {
                  await sendApiRequest(
                    session,
                    "PUT",
                    "space/collections/collection/access",
                    {
                      id: user.id,
                      access: "EDITOR",
                    }
                  );
                  mutateList((oldData) => {
                    const newUser = { ...user, access: button.value };
                    return {
                      ...oldData,
                      invitedUsers: oldData.invitedUsers.map((i) =>
                        i.id === user.id ? newUser : i
                      ),
                    };
                  });
                  toast.success("Access updated!");
                },
              })),
              { renderer: () => <Divider /> },
              {
                text: "Remove access",
                onPress: handleDelete,
              },
            ]}
          >
            <IconButton icon="more_horiz" iconProps={{ bold: true }} />
          </DropdownMenu>
        )}
      </ListItemButton>
    </ProfileModal>
  );
};

const CollectionShareLink = () => {
  const pathname = usePathname();
  return (
    <ListItemButton
      onPress={() => router.replace(pathname.replace("/share", "/share/link"))}
      style={{ marginHorizontal: -10 }}
    >
      <Avatar icon="link" size={40} disabled />
      <ListItemText
        truncate
        primary="Public link"
        secondary="Anyone with the link can view this collection"
      />
      <Icon>arrow_forward_ios</Icon>
    </ListItemButton>
  );
};

const CollectionMembers = ({ collection, mutateList, navigation }) => {
  const { data, access } = collection || {};
  const pathname = usePathname();
  const isReadOnly = access?.access === "READ_ONLY";

  useEffect(() => {
    mutateList();
  }, [pathname]);

  return (
    <View style={{ padding: 10, paddingTop: 0, marginTop: -20 }}>
      <Text variant="eyebrow" style={[modalStyles.eyebrow, { marginTop: 0 }]}>
        People
      </Text>
      <View
        style={{
          marginHorizontal: -10,
        }}
      >
        {!isReadOnly && (
          <ListItemButton
            onPress={() =>
              router.push(pathname.replace("/share", "/share/friends"))
            }
          >
            <Avatar icon="add" disabled size={40} />
            <ListItemText primary="Invite people" />
          </ListItemButton>
        )}
        {collection.data?.createdBy && (
          <ProfileModal email={collection.data.createdBy.email}>
            <ListItemButton>
              <ProfilePicture
                disabled
                name={collection.data.createdBy.profile.name}
                size={40}
                image={collection.data.createdBy.profile.picture}
              />
              <ListItemText
                primary={collection.data.createdBy.profile.name}
                secondary="Owner"
              />
            </ListItemButton>
          </ProfileModal>
        )}
        {data?.invitedUsers?.map((user) => (
          <CollectionInvitedUser
            mutateList={mutateList}
            key={user.user.email}
            user={user}
            isReadOnly={isReadOnly}
          />
        ))}
      </View>
      <Text variant="eyebrow" style={[modalStyles.eyebrow, { marginTop: 20 }]}>
        Publish
      </Text>
      <CollectionShareLink />
      <PublishCollection collection={collection} navigation={navigation} />
    </View>
  );
};

const Home = ({ collection, navigation }) => {
  return (
    <ScrollView>
      <CollectionMembers
        mutateList={collection.mutate}
        navigation={navigation}
        collection={collection}
      />
    </ScrollView>
  );
};

function Share() {
  const collection = useCollectionContext();
  useHotkeys("esc", () => router.back());

  return (
    <CollectionMenuLayout title="Share">
      <Home collection={collection} navigation={{}} />
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
    swrKey: "space/collections/collection" as any,
  };

  return (
    <CollectionContext.Provider value={contextValue}>
      {data && <Share />}
    </CollectionContext.Provider>
  );
}

