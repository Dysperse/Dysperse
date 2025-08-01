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
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import Emoji from "@/ui/Emoji";
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
import { BottomSheetFlashList, BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { cloneElement, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

const modalStyles = StyleSheet.create({
  eyebrow: { marginTop: 10, marginBottom: 5, marginLeft: 5 },
});

function FriendEmailSelection({ setQuery }) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  });
  return (
    <View>
      <TextField
        bottomSheet
        inputRef={ref}
        placeholder="Invite by email..."
        variant="filled+outlined"
        onChangeText={setQuery}
      />
    </View>
  );
}

function UserSearchResults({ selected, setSelected, query }) {
  const { data, error, isLoading, isValidating } = useSWR([
    "user/profile",
    { email: query },
  ]);

  return (
    <>
      {data ? (
        data.error ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <Emoji emoji="1f62d" size={50} />
            <Text weight={600} style={{ fontSize: 20 }}>
              Oh no!
            </Text>
            <Text style={{ opacity: 0.6 }}>
              Couldn't find any users with that email.
            </Text>
          </View>
        ) : (
          <ListItemButton
            onPress={() => {
              setSelected((oldData) => {
                if (oldData.find((u) => u.email === data.email))
                  return oldData.filter((u) => u.email !== data.email);
                return [...oldData, data];
              });
            }}
          >
            <Avatar
              image={data.profile.picture}
              size={50}
              style={{ marginRight: 10 }}
            />
            <ListItemText primary={data.profile.name} secondary={data.email} />
            {selected.find((u) => u.email === data.email) ? (
              <Icon>check</Icon>
            ) : null}
          </ListItemButton>
        )
      ) : error ? (
        <ErrorAlert />
      ) : isLoading || isValidating ? (
        <Spinner />
      ) : null}
    </>
  );
}

const friendModalStyles = StyleSheet.create({
  listContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
  },
  user: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  check: {
    position: "absolute",
    bottom: -5,
    right: -5,
  },
});

const FriendUser = ({ friend, selected, setSelected }) => {
  const breakpoints = useResponsiveBreakpoints();

  const theme = useColorTheme();
  return (
    <Pressable
      style={({ pressed, hovered }) => [
        friendModalStyles.user,
        {
          width: "100%",
          paddingHorizontal: breakpoints.md ? 20 : 10,
          backgroundColor: theme[pressed ? 4 : hovered ? 3 : 2],
        },
      ]}
      onPress={() => {
        if (selected.find((u) => u.email === friend.email))
          setSelected(selected.filter((id) => id.email !== friend.email));
        else setSelected([...selected, friend]);
      }}
    >
      <View style={{ position: "relative" }}>
        <ProfilePicture
          disabled
          name={friend?.profile?.name}
          image={friend?.profile?.picture}
          size={breakpoints.md ? 70 : 80}
        />
        {selected.find((i) => i.email === friend.email) && (
          <Avatar
            disabled
            icon="check"
            style={[
              friendModalStyles.check,
              {
                backgroundColor: theme[9],
              },
            ]}
            iconProps={{ style: { color: theme[1] }, bold: true }}
          />
        )}
      </View>
      <Text style={{ opacity: 0.6 }} numberOfLines={1}>
        {friend?.profile?.name}
      </Text>
    </Pressable>
  );
};

const FriendModal = ({ children, onComplete }) => {
  const { data, error } = useSWR(["user/friends"]);
  const ref = useRef<BottomSheetModal>(null);
  const theme = useColorTheme();

  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState("");

  const trigger = cloneElement(children, {
    onPress: () => {
      setIsLoading(false);
      ref.current?.present();
      setQuery("");
      setSelected([]);
    },
  });

  const filteredData = data?.filter(
    (friend) =>
      friend.user.profile.name.toLowerCase().includes(query.toLowerCase()) ||
      friend.user.email.toLowerCase().includes(query.toLowerCase()) ||
      friend.user.username?.toLowerCase()?.includes(query.toLowerCase())
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await onComplete(selected);
      setTimeout(() => {
        ref.current?.forceClose({
          overshootClamping: true,
          damping: 20,
          stiffness: 400,
        });
      }, 100);
    } catch (e) {
      setIsLoading(false);
      console.log(e);
    }
  };

  return (
    <>
      {trigger}
      <BottomSheet
        snapPoints={["75%"]}
        containerStyle={{
          marginTop: 40,
          maxWidth: 500,
          width: "100%",
          marginLeft: "50%",
          transform: [{ translateX: "-50%" }],
        }}
        onClose={() => ref.current?.close()}
        sheetRef={ref}
      >
        <View style={{ height: "100%" }}>
          <View style={{ padding: 20, paddingBottom: 0 }}>
            <View style={friendModalStyles.header}>
              <Text style={{ fontSize: 30 }} weight={900}>
                Select friends
              </Text>
              <IconButton
                icon={
                  isLoading ? (
                    <Spinner color={theme[1]} size={24} />
                  ) : (
                    <Icon style={{ color: theme[1] }}>north</Icon>
                  )
                }
                style={[
                  {
                    width: 50,
                  },
                  selected.length === 0 && { opacity: 0.5 },
                ]}
                backgroundColors={{
                  default: theme[10],
                  hovered: theme[9],
                  pressed: theme[8],
                }}
                disabled={selected.length === 0 || isLoading}
                onPress={handleSubmit}
              />
            </View>
            <FriendEmailSelection setQuery={setQuery} />
          </View>
          <View style={{ flex: 1 }}>
            <BottomSheetFlashList
              numColumns={3}
              data={
                data
                  ? filteredData.length === 0
                    ? query
                      ? [{ type: "userSearch" }]
                      : [{ type: "noFriends" }]
                    : [
                        ...filteredData.map((friend) => ({
                          type: "friend",
                          friend: friend.user,
                        })),
                        ...selected
                          .filter(
                            (i) => !data.find((f) => f.user.email === i.email)
                          )
                          .map((i) => ({
                            type: "selected",
                            friend: i,
                          })),
                      ]
                  : error
                  ? [{ type: "error" }]
                  : [{ type: "loading" }]
              }
              keyExtractor={(item, index) =>
                item.type === "friend" || item.type === "selected"
                  ? item.friend.email
                  : item.type + index
              }
              renderItem={({ item }) => {
                if (item.type === "friend" || item.type === "selected") {
                  return (
                    <FriendUser
                      friend={item.friend}
                      selected={selected}
                      setSelected={setSelected}
                    />
                  );
                }
                if (item.type === "userSearch") {
                  return (
                    <UserSearchResults
                      selected={selected}
                      setSelected={setSelected}
                      query={query}
                    />
                  );
                }
                if (item.type === "noFriends") {
                  return (
                    <Text>
                      You have no friends yet. Invite someone to join you on
                      your journey.
                    </Text>
                  );
                }
                if (item.type === "error") {
                  return <ErrorAlert />;
                }
                if (item.type === "loading") {
                  return <Spinner />;
                }
                return null;
              }}
              contentContainerStyle={friendModalStyles.listContainer}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={Keyboard.dismiss}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </BottomSheet>
    </>
  );
};

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
    if (res.error) return Toast.show({ type: "error" });
    Toast.show({ type: "success", text1: "Access removed" });
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
          <MenuPopover
            trigger={<IconButton icon="more_horiz" />}
            menuRef={ref}
            options={[
              ...[
                { text: "View only", value: "READ_ONLY" },
                { text: "Can edit", value: "EDITOR" },
              ].map((button) => ({
                ...button,
                selected: user.access === button.value,
                callback: async () => {
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
                  Toast.show({ type: "success", text1: "Access updated!" });
                },
              })),
              { divider: true, key: "1" },
              {
                text: "Remove access",
                value: "REMOVE",
                callback: handleDelete,
              },
            ]}
          />
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

