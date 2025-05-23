import { IndeterminateProgressBar } from "@/components/IndeterminateProgressBar";
import { ProfileModal } from "@/components/ProfileModal";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
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
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import { MenuButton } from "./home";

type FriendsPageView = "all" | "requests" | "pending" | "blocked" | "search";

const Suggestions = ({ watch, setValue }) => {
  const theme = useColorTheme();
  const { sessionToken } = useUser();
  const query = watch("email");
  const [debouncedQuery] = useDebounce(query, 500);

  const [data, setData] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);

  const handleSearch = useCallback(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return setData([]);
    setLoading(true);
    sendApiRequest(sessionToken, "GET", "user/profile", {
      many: "true",
      query: debouncedQuery,
    }).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [debouncedQuery, setData, sessionToken]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme[3],
        borderRadius: 25,
        position: "relative",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: theme[5],
      }}
    >
      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 99,
            height: 5,
          }}
        >
          <IndeterminateProgressBar height={5} />
        </View>
      )}

      {!data || data?.length === 0 ? (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            flexDirection: "row",
            gap: 10,
          }}
        >
          <Icon bold>
            {debouncedQuery.length > 2 ? "heart_broken" : "search"}
          </Icon>
          <Text style={{ textAlign: "center", color: theme[11] }} weight={600}>
            {debouncedQuery.length > 2
              ? "No users found"
              : "Start typing to search for users"}
          </Text>
        </View>
      ) : (
        <FlashList
          keyboardShouldPersistTaps={"always"}
          data={data}
          estimatedItemSize={100}
          centerContent={!data || data?.length === 0}
          contentContainerStyle={{ padding: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ListItemButton
              onPress={() => setValue("email", item.username || item.email)}
            >
              <ProfilePicture
                style={{ pointerEvents: "none" }}
                name={item.profile?.name || "--"}
                image={item.profile?.picture}
                size={40}
              />
              <ListItemText
                primary={item?.profile?.name}
                secondary={`${item?.username ? "@" : ""}${
                  item?.username || item?.email
                } • Active ${dayjs(item?.profile?.lastActive).fromNow()}`}
              />
              {query === item?.email && (
                <Avatar
                  icon="check"
                  style={{
                    backgroundColor: theme[11],
                    borderRadius: 99,
                  }}
                  iconProps={{ style: { color: theme[2] } }}
                />
              )}
            </ListItemButton>
          )}
        />
      )}
    </View>
  );
};

function AddFriend({ friends, mutate, setView }) {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const { session } = useSession();
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();

  const onSubmit = async (values) => {
    try {
      Keyboard.dismiss();
      if (friends.find((friend) => friend.user.username === values.email))
        throw new Error("Friend exists");
      setLoading(true);
      await sendApiRequest(
        session,
        "POST",
        "user/friends",
        {},
        { body: JSON.stringify({ email: values.email }) }
      );
      await mutate();
      Toast.show({
        type: "success",
        text1: "Sent friend request!",
      });
      setLoading(false);
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior="padding"
        style={{
          gap: 20,
          flex: 1,
          padding: 20,
        }}
      >
        <IconButton
          icon="arrow_back_ios_new"
          size={45}
          variant="filled"
          onPress={() => setView("all")}
        />
        {breakpoints.md && (
          <Text style={{ fontSize: 30, marginTop: 20 }} weight={900}>
            Add friends
          </Text>
        )}
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <Controller
            control={control}
            name="email"
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                onKeyPress={(e) => {
                  if (e.nativeEvent.key === "Enter") {
                    handleSubmit(onSubmit)();
                  }
                  if (e.nativeEvent.key === "Escape") {
                    // handleClose();
                  }
                }}
                variant="filled+outlined"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                inputRef={(ref) => ref?.focus()}
                placeholder="Find by email or username…"
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: 20,
                  height: 55,
                  borderRadius: 99,
                  paddingHorizontal: 30,
                  fontSize: 17,
                  shadowRadius: 0,
                }}
              />
            )}
          />
        </View>
        <Suggestions setValue={setValue} watch={watch} />
        <Button
          isLoading={loading}
          height={70}
          variant="filled"
          onPress={handleSubmit(onSubmit)}
          containerStyle={{ marginBottom: insets.bottom + 60 }}
        >
          <ButtonText weight={900} style={{ fontSize: 20 }}>
            Send request
          </ButtonText>
          <Icon bold>send</Icon>
        </Button>
      </KeyboardAvoidingView>
    </>
  );
}

function DeleteRequestButton({ reject = false, mutate, id }) {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    try {
      setLoading(true);
      await sendApiRequest(
        session,
        "DELETE",
        "user/friends",
        {},
        { body: JSON.stringify({ userId: id }) }
      );
      await mutate();
      Toast.show({
        type: "success",
        text1: reject ? "Deleted friend request" : "Canceled friend request",
      });
      setLoading(false);
    } catch {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Something went wrong",
      });
    }
  };

  return (
    <IconButton variant="outlined" onPress={handleDelete} size={40}>
      {loading ? <Spinner /> : <Icon>close</Icon>}
    </IconButton>
  );
}

function AcceptRequestButton({ mutate, id }) {
  const [loading, setLoading] = useState(false);
  const { session, sessionToken } = useUser();
  const handleAccept = async () => {
    try {
      setLoading(true);
      await sendApiRequest(
        sessionToken,
        "PUT",
        "user/friends",
        {},
        {
          body: JSON.stringify({
            accepted: true,
            followerId: id,
            followingId: session.user.id,
          }),
        }
      );

      await mutate();
      Toast.show({
        type: "success",
        text1: "Accepted friend request!",
      });
      setLoading(false);
    } catch {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Something went wrong",
      });
    }
  };

  return (
    <IconButton
      variant="outlined"
      onPress={handleAccept}
      size={40}
      style={{ marginLeft: -10 }}
    >
      {loading ? <Spinner /> : <Icon>check</Icon>}
    </IconButton>
  );
}

function FriendOptionsButton({ id }) {
  const { sessionToken } = useUser();

  return (
    <ConfirmationModal
      height={410}
      title="Remove friend?"
      secondary="You can add this user back any time. We won't let this person know you've removed them."
      onSuccess={async () => {
        sendApiRequest(
          sessionToken,
          "DELETE",
          "user/friends",
          {},
          {
            body: JSON.stringify({
              userId: id,
            }),
          }
        );
      }}
    >
      <IconButton size={40} style={{ marginRight: -10 }}>
        <Icon>person_remove</Icon>
      </IconButton>
    </ConfirmationModal>
  );
}

export default function Page() {
  const { session } = useUser();
  const theme = useColorTheme();
  const [view, setView] = useState<FriendsPageView>("all");

  const { data, isLoading, mutate, error } = useSWR([
    "user/friends",
    { requests: "true" },
  ]);

  const breakpoints = useResponsiveBreakpoints();

  const handleBack = () => {
    if (router.canGoBack()) return router.back();
    router.replace(breakpoints.md ? "/" : "/settings");
  };

  useHotkeys("esc", handleBack, {
    enabled: breakpoints.md,
    ignoreEventWhen: () =>
      document.querySelectorAll('[aria-modal="true"]').length > 0,
  });

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

  const Header = () => (
    <>
      <View
        style={{
          paddingBottom: 20,
          paddingTop: 10,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 5,
        }}
      >
        <Text style={{ fontFamily: "serifText800", fontSize: 35 }}>
          Friends
        </Text>
        <Button
          variant="filled"
          large
          bold
          icon="person_add"
          text="Add"
          onPress={() => setView("search")}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          backgroundColor: theme[3],
          borderRadius: 20,
          marginBottom: 10,
        }}
      >
        {["all", "requests", "pending"].map((button) => (
          <Button
            key={button}
            large
            variant={view === button ? "filled" : undefined}
            backgroundColors={
              view === button
                ? {
                    default: addHslAlpha(theme[9], 0.1),
                    hovered: addHslAlpha(theme[9], 0.1),
                    pressed: addHslAlpha(theme[9], 0.2),
                  }
                : {
                    default: addHslAlpha(theme[9], 0),
                    hovered: addHslAlpha(theme[9], 0.1),
                    pressed: addHslAlpha(theme[9], 0.2),
                  }
            }
            bold={view === button}
            onPress={() => {
              setView(button as any);
              impactAsync(ImpactFeedbackStyle.Light);
            }}
            containerStyle={{ minWidth: 0, flex: 1, borderRadius: 20 }}
            style={{ paddingHorizontal: 15 }}
            text={capitalizeFirstLetter(button)}
          />
        ))}
      </View>
    </>
  );

  return (
    <View style={{ backgroundColor: theme[1], flex: 1 }}>
      {view !== "search" && <MenuButton back gradient />}
      <View
        style={{
          flex: 1,
          width: "100%",
          minWidth: 5,
          minHeight: 5,
          maxWidth: 500,
          marginHorizontal: "auto",
        }}
      >
        <SystemBars style="light" />
        {view === "search" ? (
          <AddFriend setView={setView} friends={data} mutate={mutate} />
        ) : (
          <FlashList
            ListHeaderComponent={Header}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 80 }}
            data={
              data
                ? data.filter((user) => {
                    if (view === "all") return user.accepted === true;
                    if (view === "requests")
                      return (
                        user.accepted === false &&
                        user.followingId === session.user.id
                      );
                    if (view === "pending")
                      return (
                        user.accepted === false &&
                        user.followerId === session.user.id
                      );
                    if (view === "blocked") return user.blocked;
                  })
                : []
            }
            ListEmptyComponent={
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 200,
                }}
              >
                {isLoading ? (
                  <Spinner />
                ) : error ? (
                  <ErrorAlert />
                ) : (
                  <View style={{ gap: 10, alignItems: "center" }}>
                    <Emoji
                      emoji={
                        view === "all"
                          ? "1f97a"
                          : view === "blocked"
                          ? "1f910"
                          : view == "requests"
                          ? "1f614"
                          : "1fae3"
                      }
                      size={50}
                    />
                    <Text
                      style={{ fontSize: 20, textAlign: "center" }}
                      weight={700}
                    >
                      {view === "blocked"
                        ? "You haven't blocked anybody"
                        : view === "pending"
                        ? "You haven't sent any friend requests"
                        : view === "requests"
                        ? "You don't have any requests"
                        : "You don't have any friends"}
                    </Text>
                  </View>
                )}
              </View>
            }
            renderItem={({ item }: any) => (
              <ProfileModal email={item.user.email}>
                <ListItemButton
                  style={{
                    marginTop: 10,
                  }}
                >
                  <ProfilePicture
                    style={{ pointerEvents: "none" }}
                    name={item.user.profile?.name || "--"}
                    image={item.user.profile?.picture}
                    size={40}
                  />
                  <ListItemText
                    truncate
                    primary={item.user.profile?.name}
                    secondary={`Active ${
                      dayjs(item.user.profile?.lastActive).diff(
                        dayjs(),
                        "minute"
                      ) >= -5
                        ? "now"
                        : dayjs(item.user.profile?.lastActive).fromNow()
                    }`}
                  />
                  {view === "pending" ? (
                    <DeleteRequestButton mutate={mutate} id={item.user.id} />
                  ) : view === "requests" ? (
                    <>
                      <DeleteRequestButton
                        reject
                        mutate={mutate}
                        id={item.user.id}
                      />
                      <AcceptRequestButton mutate={mutate} id={item.user.id} />
                    </>
                  ) : (
                    <FriendOptionsButton id={item.user.id} />
                  )}
                </ListItemButton>
              </ProfileModal>
            )}
            estimatedItemSize={100}
          />
        )}
      </View>
    </View>
  );
}
