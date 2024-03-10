import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { cloneElement, memo, useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
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
    onPress: () => ref.current?.present(),
  });

  const filteredData = data?.filter(
    (friend) =>
      friend.user.profile.name.toLowerCase().includes(query.toLowerCase()) ||
      friend.user.email.toLowerCase().includes(query.toLowerCase()) ||
      friend.user.username?.toLowerCase()?.includes(query.toLowerCase())
  );

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
              icon={<Icon style={{ color: theme[1] }}>north</Icon>}
              style={({ pressed, hovered }) => ({
                width: 50,
                backgroundColor: theme[pressed ? 8 : hovered ? 9 : 10],
              })}
              onPress={() => {
                onComplete(selected);
                ref.current?.close();
              }}
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

const CollectionMembers = ({ collection: { data: collection } }) => {
  return (
    <View style={{ padding: 20 }}>
      <Text variant="eyebrow" style={modalStyles.eyebrow}>
        Group
      </Text>
      {collection.public && (
        <ListItemButton>
          <Avatar
            icon={collection.public ? "people" : "lock"}
            size={40}
            disabled
          />
          <ListItemText
            primary={collection.public ? "Public" : "Private"}
            secondary={
              collection.public
                ? "Members in this space have access"
                : "Only you & selected members have access"
            }
          />
          <Icon size={45} style={{ opacity: collection.public ? 1 : 0.5 }}>
            toggle_{collection.public ? "on" : "off"}
          </Icon>
        </ListItemButton>
      )}
      <Text variant="eyebrow" style={[modalStyles.eyebrow, { marginTop: 15 }]}>
        People
      </Text>
      <FriendModal
        onComplete={(e) => {
          console.log(e);
        }}
      >
        <ListItemButton>
          <Avatar icon="add" disabled size={40} />
          <ListItemText primary="Invite people" />
        </ListItemButton>
      </FriendModal>
    </View>
  );
};

const CollectionLink = () => {
  return (
    <View style={{ padding: 20 }}>
      <Text>Link</Text>
    </View>
  );
};

export const CollectionShareMenu = memo(function CollectionShareMenu() {
  const ref = useRef<BottomSheetModal>(null);
  const { id } = useLocalSearchParams();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const viewState = useState("Members");

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

      <BottomSheet onClose={handleClose} sheetRef={ref} snapPoints={["80%"]}>
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
        <ButtonGroup
          options={[
            { value: "Members", label: "Members" },
            { value: "Link", label: "Link" },
          ]}
          scrollContainerStyle={{ width: "100%" }}
          state={viewState}
        />
        <BottomSheetScrollView>
          {viewState[0] === "Members" ? (
            <CollectionMembers collection={collection} />
          ) : (
            <CollectionLink />
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
});
