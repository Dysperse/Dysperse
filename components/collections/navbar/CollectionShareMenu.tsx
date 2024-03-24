import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Divider from "@/ui/Divider";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import { Menu } from "@/ui/Menu";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { cloneElement, memo, useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { styles } from ".";
import { useCollectionContext } from "../context";

const modalStyles = StyleSheet.create({
  eyebrow: { marginTop: 10, marginBottom: 5, marginLeft: 5 },
});

function FriendEmailSelection({ selected, setSelected, setQuery }) {
  return (
    <View>
      <TextField
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
            style={({ pressed, hovered }: any) => ({
              backgroundColor: theme[pressed ? 4 : hovered ? 3 : 2],
              marginTop: 10,
              width: "100%",
            })}
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
      style={({ pressed, hovered }: any) => [
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
              style={({ pressed, hovered }) => [
                {
                  width: 50,
                  backgroundColor: theme[pressed ? 8 : hovered ? 9 : 10],
                },
                selected.length === 0 && { opacity: 0.3 },
              ]}
              disabled={selected.length === 0 || isLoading}
              onPress={handleSubmit}
            />
          </View>
          <FriendEmailSelection
            setQuery={setQuery}
            selected={selected}
            setSelected={setSelected}
          />
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
  const ref = useRef<BottomSheetModal>(null);
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
  const theme = useColorTheme();
  return (
    <ListItemButton disabled>
      <ProfilePicture
        name={user.user.profile.name}
        image={user.user.profile.picture}
        size={40}
        disabled
      />
      <ListItemText
        primary={user.user.profile.name}
        secondary={capitalizeFirstLetter(
          user.access.toLowerCase().replaceAll("_", " ")
        )}
      />
      {!isReadOnly && (
        <Menu
          height={[320]}
          menuRef={ref}
          trigger={<IconButton icon="more_horiz" />}
        >
          <View style={{ padding: 20, gap: 20, paddingTop: 10 }}>
            {[
              { label: "Can view", value: "READ_ONLY" },
              { label: "Can edit", value: "EDITOR" },
              { label: "Full access", value: "MODERATOR" },
            ].map((button) => (
              <Button
                variant="outlined"
                key={button.value}
                style={
                  user.access === button.value && { backgroundColor: theme[3] }
                }
                onPress={() => {
                  console.log(button.value);
                }}
              >
                <ButtonText>{button.label}</ButtonText>
                {user.access === button.value && <Icon>check</Icon>}
              </Button>
            ))}
            <Divider />
            <Button variant="outlined" onPress={handleDelete}>
              <ButtonText>Remove access</ButtonText>
            </Button>
          </View>
        </Menu>
      )}
    </ListItemButton>
  );
};

const CollectionShareLink = ({ isReadOnly, collection }) => {
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
          <Menu
            trigger={
              <IconButton style={{ marginRight: -10 }} size={40}>
                <Icon>more_horiz</Icon>
              </IconButton>
            }
            height={[390]}
          >
            <View style={{ padding: 20, gap: 10, paddingTop: 10 }}>
              <Text variant="eyebrow">Access</Text>
              {["No access", "Full access", "Can edit", "Can view"].map(
                (button) => (
                  <Button
                    variant="outlined"
                    key={button}
                    onPress={() => {
                      console.log(button);
                    }}
                  >
                    <ButtonText>{button}</ButtonText>
                  </Button>
                )
              )}
              <Text variant="eyebrow" style={{ marginTop: 10 }}>
                Link
              </Text>
              <Button variant="outlined">
                <ButtonText>Revoke link</ButtonText>
              </Button>
            </View>
          </Menu>
        )}
        <IconButton variant="outlined" size={40}>
          <Icon>content_copy</Icon>
        </IconButton>
      </ListItemButton>
    </>
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
    <View style={{ padding: 20, paddingTop: 0 }}>
      <Text variant="eyebrow" style={modalStyles.eyebrow}>
        General
      </Text>
      <CollectionShareLink isReadOnly={isReadOnly} collection={collection} />
      <Text variant="eyebrow" style={[modalStyles.eyebrow, { marginTop: 20 }]}>
        People
      </Text>
      {collection.public && (
        <ListItemButton disabled={isReadOnly}>
          <Avatar
            icon={collection.public ? "people" : "lock"}
            size={40}
            disabled
          />
          <ListItemText
            truncate
            primary={collection.public ? collection.space?.name : "Private"}
            secondary={
              collection.public
                ? `Visible to all members`
                : "Only you & selected members have access"
            }
          />
          <Icon size={45} style={{ opacity: collection.public ? 1 : 0.5 }}>
            toggle_{collection.public ? "on" : "off"}
          </Icon>
        </ListItemButton>
      )}
      {collection.invitedUsers.map((user) => (
        <CollectionInvitedUser
          mutateList={mutateList}
          key={user.user.email}
          user={user}
          isReadOnly={isReadOnly}
        />
      ))}
      {!isReadOnly && (
        <FriendModal onComplete={handleSelectFriends}>
          <ListItemButton>
            <Avatar icon="add" disabled size={40} />
            <ListItemText primary="Invite people" />
          </ListItemButton>
        </FriendModal>
      )}
    </View>
  );
};

export const CollectionShareMenu = memo(function CollectionShareMenu() {
  const ref = useRef<BottomSheetModal>(null);
  const { id } = useLocalSearchParams();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();

  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);

  const collection = useCollectionContext();

  return (
    <>
      {id !== "all" &&
        (breakpoints.md ? (
          <Pressable
            onPress={handleOpen}
            style={({ pressed, hovered }: any) => [
              styles.navbarIconButton,
              {
                backgroundColor: addHslAlpha(
                  theme[pressed ? 8 : hovered ? 9 : 10],
                  0.7
                ),
                width: breakpoints.md ? 120 : 50,
                gap: 15,
              },
            ]}
          >
            <Icon style={{ color: theme[1] }}>ios_share</Icon>
            {breakpoints.md && (
              <Text style={{ color: theme[1] }} weight={400}>
                Share
              </Text>
            )}
          </Pressable>
        ) : (
          <IconButton
            onPress={handleOpen}
            variant="outlined"
            size={40}
            icon="ios_share"
          />
        ))}

      <BottomSheet onClose={handleClose} sheetRef={ref} snapPoints={["60%"]}>
        <View
          style={{
            paddingHorizontal: 25,
            paddingVertical: 10,
          }}
        >
          <Text style={{ fontSize: 30 }} weight={800}>
            Share
          </Text>
        </View>
        <BottomSheetScrollView>
          <CollectionMembers
            mutateList={collection.mutate}
            collection={collection}
          />
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
});
