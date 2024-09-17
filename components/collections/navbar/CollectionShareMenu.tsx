import { ProfileModal } from "@/components/ProfileModal";
import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import { forHorizontalIOS } from "@/components/layout/forHorizontalIOS";
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
import MenuPopover from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationOptions,
} from "@react-navigation/stack";
import { setStringAsync } from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import {
  cloneElement,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { useCollectionContext } from "../context";
import { CollectionInfo } from "./CollectionInfo";
import { PublishCollection } from "./PublishCollection";
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
  return (
    <>
      <ListItemButton onPress={() => navigation.navigate("link")}>
        <Avatar icon="link" size={40} disabled />
        <ListItemText
          truncate
          primary="Public link"
          secondary="Anyone with the link can view this collection"
        />
        <Icon>arrow_forward_ios</Icon>
      </ListItemButton>
    </>
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
    ...(defaultView !== collection?.data?.defaultView && { view: defaultView }),
  });

  const url = `${
    process.env.NODE_ENV === "production"
      ? "https://app.dysperse.com"
      : "http://localhost:8081"
  }/c/${data?.id}${params ? `?${params}` : ""}`;

  return (
    <>
      {data ? (
        <View
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
                  icon={COLLECTION_VIEWS[defaultView]}
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
        </View>
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
    <View style={{ padding: 10, paddingTop: 0 }}>
      <Text variant="eyebrow" style={[modalStyles.eyebrow, { marginTop: 0 }]}>
        People
      </Text>
      <View
        style={{
          marginHorizontal: -10,
        }}
      >
        <CollectionShareLink isReadOnly={isReadOnly} navigation={navigation} />
        {!isReadOnly && (
          <FriendModal onComplete={handleSelectFriends}>
            <ListItemButton>
              <Avatar icon="add" disabled size={40} />
              <ListItemText primary="Invite people" />
            </ListItemButton>
          </FriendModal>
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
        Template
      </Text>
      <PublishCollection collection={collection} navigation={navigation} />
    </View>
  );
};

const Stack = createStackNavigator();

const Navbar = ({ navigation, title, icon = "close", handleClose }) => {
  const theme = useColorTheme();

  return (
    <View
      style={{
        gap: 20,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme[2],
      }}
    >
      <IconButton
        icon={icon}
        size={55}
        variant="outlined"
        onPress={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else handleClose();
        }}
      />
      <Text
        style={{
          fontSize: 30,
          marginHorizontal: "auto",
          paddingRight: 55,
        }}
        weight={800}
      >
        {title}
      </Text>
    </View>
  );
};

const Home = ({ collection, navigation }) => {
  return (
    <BottomSheetScrollView contentContainerStyle={{ padding: 20 }}>
      <CollectionMembers
        mutateList={collection.mutate}
        navigation={navigation}
        collection={collection}
      />
    </BottomSheetScrollView>
  );
};

const Navigator = forwardRef(
  ({ maxHeight, handleClose, collection }: any, ref) => {
    const theme = useColorTheme();
    const screenOptions = useMemo<StackNavigationOptions>(
      () => ({
        cardStyleInterpolator: forHorizontalIOS,
        detachPreviousScreen: false,
        headerShown: true,
        freezeOnBlur: true,
        gestureEnabled: false,
        headerMode: "float",
        cardStyle: {
          height: "100%",
          width: "100%",
          backgroundColor: theme[2],
        },
        header: ({ navigation }) => (
          <Navbar
            title="Share"
            navigation={navigation}
            handleClose={handleClose}
          />
        ),
      }),
      [theme, handleClose]
    );

    const r = useRef<NavigationContainerRef<any>>(null);

    useImperativeHandle(ref, () => ({
      open: () => {
        r.current.navigate("publish");
      },
    }));

    return (
      <>
        <NavigationContainer
          onStateChange={(state) => {
            const height =
              state.routes[state.index].name === "share" ? 500 : 650;
            maxHeight.value = height;
          }}
          ref={r}
          documentTitle={{ enabled: false }}
          independent={true}
          theme={{
            colors: {
              background: theme[3],
              card: theme[2],
              primary: theme[2],
              border: theme[6],
              text: theme[11],
              notification: theme[9],
            },
            dark: true,
          }}
        >
          <Stack.Navigator screenOptions={screenOptions}>
            <Stack.Screen
              name="share"
              component={({ navigation }) => (
                <Home collection={collection} navigation={navigation} />
              )}
            />
            <Stack.Screen
              name="link"
              component={({ navigation }) => (
                <Link collection={collection} navigation={navigation} />
              )}
            />
            <Stack.Screen
              name="publish"
              component={(props) => (
                <CollectionInfo {...props} collection={collection} />
              )}
              options={{
                header: ({ navigation }) => (
                  <Navbar
                    title={
                      collection?.data?.public ? "Publish" : "Edit collection"
                    }
                    navigation={navigation}
                    icon="arrow_back_ios_new"
                    handleClose={handleClose}
                  />
                ),
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </>
    );
  }
);

export const CollectionShareMenu = forwardRef((props, ref) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const { id } = useLocalSearchParams();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const maxHeight = useSharedValue(500);

  const handleOpen = useCallback(() => sheetRef.current?.present(), []);
  const handleClose = useCallback(() => {
    sheetRef.current?.close({
      overshootClamping: true,
      damping: 20,
      stiffness: 400,
    });
    maxHeight.value = 500;
  }, []);

  const maxHeightStyle = useAnimatedStyle(() => ({
    maxHeight: withSpring(maxHeight.value, {
      damping: 40,
      stiffness: 400,
      overshootClamping: true,
    }),
  }));

  const collection = useCollectionContext();

  const navigatorRef = useRef(null);

  useImperativeHandle(ref, () => ({
    openEdit: () => {
      handleOpen();
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          navigatorRef.current?.open();
        }, 100);
      });
    },
  }));

  return (
    <>
      {id !== "all" && (
        <>
          {breakpoints.md ? (
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
          )}
        </>
      )}

      <BottomSheet
        onClose={handleClose}
        sheetRef={sheetRef}
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
          <Animated.View
            style={[
              maxHeightStyle,
              {
                backgroundColor: theme[2],
                borderRadius: 25,
                maxWidth: 600,
                width: "100%",
                overflow: "hidden",
                height: "100%",
                shadowColor: "#000",
                shadowOffset: { width: 25, height: 25 },
                shadowOpacity: 0.25,
                shadowRadius: 100,
              },
            ]}
          >
            <Pressable style={{ flex: 1 }}>
              <Navigator
                ref={navigatorRef}
                maxHeight={maxHeight}
                handleClose={handleClose}
                collection={collection}
              />
            </Pressable>
          </Animated.View>
        </Pressable>
      </BottomSheet>
    </>
  );
});

