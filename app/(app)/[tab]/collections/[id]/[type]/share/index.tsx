import { ProfileModal } from "@/components/ProfileModal";
import {
  CollectionContext,
  useCollectionContext,
} from "@/components/collections/context";
import { PublishCollection } from "@/components/collections/navbar/PublishCollection";
import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button } from "@/ui/Button";
import Divider from "@/ui/Divider";
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
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { setStringAsync } from "expo-clipboard";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { cloneElement, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
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
        inputRef={ref}
        placeholder="Invite by email or username"
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
              Couldn't find any users with that email or username.
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
          width: breakpoints.md ? "20%" : "33.333%",
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
        onClose={() => ref.current?.close()}
        sheetRef={ref}
        snapPoints={["70%"]}
        maxWidth={900}
      >
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
        <ScrollView contentContainerStyle={friendModalStyles.listContainer}>
          {data ? (
            filteredData.length === 0 ? (
              query ? (
                <UserSearchResults
                  selected={selected}
                  setSelected={setSelected}
                  query={query}
                />
              ) : (
                <Text>
                  You have no friends yet. Invite someone to join you on your
                  journey.
                </Text>
              )
            ) : (
              filteredData.map((friend) => (
                <FriendUser
                  friend={friend.user}
                  selected={selected}
                  setSelected={setSelected}
                  key={friend.user.email}
                />
              ))
            )
          ) : error ? (
            <ErrorAlert />
          ) : (
            <Spinner />
          )}
          {data &&
            filteredData.length > 0 &&
            selected
              .filter((i) => !data.find((f) => f.user.email === i.email))
              .map((i) => (
                <FriendUser
                  friend={i}
                  selected={selected}
                  setSelected={setSelected}
                  key={i.email}
                />
              ))}
        </ScrollView>
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

const CollectionShareLink = ({ isReadOnly, navigation }) => {
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

const Link = ({ collection, navigation }) => {
  const theme = useColorTheme();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [defaultView, setDefaultView] = useState(
    collection?.data?.defaultView || "kanban"
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
      ? "https://app.dysperse.com"
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
                  value={url}
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
          <ListItemButton disabled>
            <ListItemText
              primary="Default view"
              secondary="People will see this when this link is opened. They can still toggle between other views as well."
            />
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
          {[
            {
              key: "NO_ACCESS",
              text: "No access",
              description: "Nobody can see your collection",
            },
            {
              key: "READ_ONLY",
              text: "Read only",
              description:
                "Anyone with the link can view this collection, even those who don't have an account.",
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

          <Divider style={{ marginVertical: 20, marginTop: 5, height: 1 }} />
          <ListItemButton
            variant="outlined"
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
          >
            <ListItemText
              primary="Refresh link"
              secondary="This will generate a new link for your collection. The old link will no longer work."
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

const CollectionMembers = ({ collection, mutateList, navigation }) => {
  const { session } = useSession();
  const { data, access } = collection || {};
  const isReadOnly = access?.access === "READ_ONLY";

  const handleSelectFriends = async (friends) => {
    try {
      const userList = friends.map((i) => i.id);
      const res = await sendApiRequest(
        session,
        "POST",
        "space/collections/collection/share",
        {},
        {
          body: JSON.stringify({
            userList,
            id: data?.id,
          }),
        }
      );
      if (res.error) throw new Error(res);
      await mutateList();
      Toast.show({ type: "success", text1: "Invites sent!" });
    } catch (e) {
      Toast.show({ type: "error" });
    }
  };
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
          <FriendModal onComplete={handleSelectFriends}>
            <ListItemButton>
              <Avatar icon="add" disabled size={40} />
              <ListItemText primary="Invite people" />
            </ListItemButton>
          </FriendModal>
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
        {data &&
          data.invitedUsers.map((user) => (
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
      <CollectionShareLink isReadOnly={isReadOnly} navigation={navigation} />
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

function Share({ handleClose }) {
  const theme = useColorTheme();
  const collection = useCollectionContext();
  useHotkeys("esc", () => router.back());

  return (
    <BlurView intensity={30} style={{ flex: 1 }}>
      <IconButton
        size={55}
        icon="close"
        onPress={handleClose}
        style={{
          position: "absolute",
          top: 30,
          left: 30,
          zIndex: 1,
          borderWidth: 2,
        }}
        variant="outlined"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          gap: 10,
          paddingHorizontal: 20,
          paddingTop: 60,
          flex: 1,
          backgroundColor: addHslAlpha(theme[1], 0.8),
        }}
      >
        <View
          style={{
            width: 500,
            maxWidth: "100%",
            marginHorizontal: "auto",
            flex: 1,
          }}
        >
          <View>
            <Text
              style={{
                textAlign: "center",
                fontFamily: "serifText800",
                fontSize: 30,
                marginTop: 30,
                marginBottom: 20,
              }}
            >
              Share
            </Text>
            <Home collection={collection} navigation={{}} />
          </View>
        </View>
      </ScrollView>
    </BlurView>
  );
}

export default function Page() {
  const handleClose = () =>
    router.canGoBack() ? router.back() : router.navigate("/");

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
      {data && <Share handleClose={handleClose} data={data} />}
    </CollectionContext.Provider>
  );
}
