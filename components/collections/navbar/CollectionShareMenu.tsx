import { ProfileModal } from "@/components/ProfileModal";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text, { getFontName } from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import {
  cloneElement,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { useCollectionContext } from "../context";
import { styles } from "./styles";

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
  const theme = useColorTheme();

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

const CollectionInvitedUser = ({ isReadOnly, mutateList, user }) => {
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
            ref={ref}
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

const CollectionShareLink = ({ isReadOnly }) => {
  const handleCopy = () => Toast.show({ type: "info", text1: "Coming soon!" });

  return (
    <>
      <ListItemButton disabled>
        <Avatar icon="link" size={40} disabled />
        <ListItemText
          truncate
          primary="Invite link"
          secondary="Anyone with the link can join this collection"
        />
        {!isReadOnly && (
          <MenuPopover
            trigger={
              <IconButton style={{ marginRight: -10 }} size={40}>
                <Icon>more_horiz</Icon>
              </IconButton>
            }
            options={[
              ...["No access", "Full access", "Can edit", "Can view"].map(
                (t) => ({
                  text: t,
                  selected: false,
                  callback: () =>
                    Toast.show({ type: "info", text1: "Coming soon!" }),
                })
              ),
            ]}
          />
        )}
        <IconButton
          variant="outlined"
          size={40}
          icon="content_copy"
          onPress={handleCopy}
        />
      </ListItemButton>
    </>
  );
};

const PublishCollection = () => {
  const theme = useColorTheme();

  return (
    <View
      style={{
        padding: 20,
        paddingHorizontal: 30,
        backgroundColor: theme[3],
        borderWidth: 1,
        borderColor: theme[6],
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 25,
        gap: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text
          weight={900}
          style={{
            fontSize: 20,
          }}
        >
          Publish to the{" "}
        </Text>
        <Chip
          style={{ backgroundColor: theme[6], gap: 5 }}
          label={
            <Text
              style={{
                fontFamily: getFontName("jetBrainsMono", 500),
                color: theme[11],
                fontStyle: "italic",
              }}
            >
              DYSVERSE
            </Text>
          }
          icon={<Emoji emoji="1f680" size={20} />}
        />
      </View>
      <Text style={{ opacity: 0.6, textAlign: "center" }}>
        Create a template which anyone can use to create their own collection.
        Your tasks won't be shared.
      </Text>
      <Button variant="outlined">
        <ButtonText>Coming soon</ButtonText>
      </Button>
    </View>
  );
};

const CollectionMembers = ({
  collection: { access, data: collection },
  mutateList,
}) => {
  const { session } = useSession();
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
            id: collection.id,
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
    <View style={{ padding: 10, paddingTop: 0 }}>
      <Text variant="eyebrow" style={[modalStyles.eyebrow, { marginTop: 0 }]}>
        People
      </Text>
      <View
        style={{
          marginHorizontal: -10,
        }}
      >
        <CollectionShareLink isReadOnly={isReadOnly} />
        {!isReadOnly && (
          <FriendModal onComplete={handleSelectFriends}>
            <ListItemButton>
              <Avatar icon="add" disabled size={40} />
              <ListItemText primary="Invite people" />
            </ListItemButton>
          </FriendModal>
        )}
        {collection.invitedUsers.map((user) => (
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
      <PublishCollection />
    </View>
  );
};

export const CollectionShareMenu = memo(function CollectionShareMenu() {
  const ref = useRef<BottomSheetModal>(null);
  const { id } = useLocalSearchParams();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();

  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(
    () =>
      ref.current?.close({
        overshootClamping: true,
        damping: 20,
        stiffness: 400,
      }),
    []
  );

  const collection = useCollectionContext();

  return (
    <>
      {id !== "all" &&
        (breakpoints.md ? (
          <Button
            onPress={handleOpen}
            backgroundColors={{
              default: theme[5],
              hovered: theme[6],
              pressed: theme[7],
            }}
            height={43}
            containerStyle={{
              borderRadius: 20,
            }}
            style={[
              styles.navbarIconButton,
              {
                gap: 10,
                marginLeft: breakpoints.md ? 5 : 0,
                width: breakpoints.md ? 103 : 50,
                paddingLeft: 0,
              },
            ]}
          >
            <Icon>ios_share</Icon>
            {breakpoints.md && <ButtonText weight={400}>Share</ButtonText>}
          </Button>
        ) : (
          <IconButton
            onPress={handleOpen}
            variant="text"
            size={40}
            icon="ios_share"
          />
        ))}

      <BottomSheet
        onClose={handleClose}
        sheetRef={ref}
        snapPoints={["100%"]}
        maxWidth="100%"
        handleComponent={() => null}
        backgroundStyle={{ backgroundColor: "transparent" }}
      >
        <Pressable
          onPress={handleClose}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme[2],
              borderRadius: 25,
              maxWidth: 600,
              maxHeight: 600,
              width: "100%",
              shadowColor: "#000",
              shadowOffset: { width: 25, height: 25 },
              shadowOpacity: 0.25,
              shadowRadius: 100,
            }}
          >
            <View
              style={{
                gap: 20,
                padding: 20,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <IconButton
                icon="close"
                size={55}
                variant="outlined"
                onPress={handleClose}
              />
              <Text
                style={{
                  fontSize: 30,
                  marginHorizontal: "auto",
                  paddingRight: 55,
                }}
                weight={800}
              >
                Share
              </Text>
            </View>
            <BottomSheetScrollView contentContainerStyle={{ padding: 20 }}>
              <CollectionMembers
                mutateList={collection.mutate}
                collection={collection}
              />
            </BottomSheetScrollView>
          </Pressable>
        </Pressable>
      </BottomSheet>
    </>
  );
});
