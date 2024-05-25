import { ProfileModal } from "@/components/ProfileModal";
import ContentWrapper from "@/components/layout/content";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { ProfilePicture } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import ConfirmationModal from "@/ui/ConfirmationModal";
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
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { useDebounce } from "use-debounce";

type FriendsPageView = "all" | "requests" | "pending" | "blocked";

const IndeterminateProgressBar = () => {
  const theme = useColorTheme();
  const translateX = useSharedValue(0);
  const { width } = useWindowDimensions();

  useEffect(() => {
    // Start the animation when the component mounts
    translateX.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value * width - 300, // Adjust this value according to your requirements
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <Animated.View style={[styles.indicator, animatedStyle]}>
          <LinearGradient
            colors={["transparent", theme[7], "transparent"]}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 5,
    overflow: "hidden",
    borderRadius: 5,
  },
  indicator: {
    width: "70%",
    height: "100%",
  },
});

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
        height: 400,
        backgroundColor: theme[3],
        borderRadius: 25,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
          }}
        >
          <IndeterminateProgressBar />
        </View>
      )}
      <FlashList
        data={data}
        estimatedItemSize={100}
        centerContent={!data}
        ListEmptyComponent={() => (
          <View
            style={{
              height: 400,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Emoji
              emoji={debouncedQuery.length > 2 ? "1F614" : "1f50d"}
              size={50}
              style={{ marginBottom: 10 }}
            />
            <Text
              style={{ textAlign: "center", opacity: 0.4, color: theme[11] }}
              weight={900}
            >
              {debouncedQuery.length > 2
                ? "No users found"
                : "Start typing to search for users"}
            </Text>
          </View>
        )}
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
              }`}
            />
          </ListItemButton>
        )}
      />
    </View>
  );
};

function AddFriend({ friends, mutate }) {
  const theme = useColorTheme();
  const [loading, setLoading] = useState(false);
  const ref = useRef<BottomSheetModal>(null);
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const { session } = useSession();
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
      <Button
        variant="filled"
        style={{ paddingHorizontal: 25 }}
        onPress={handleOpen}
      >
        <Icon>person_add</Icon>
        <ButtonText>Add</ButtonText>
      </Button>
      <BottomSheet
        maxBackdropOpacity={0.1}
        {...(breakpoints.md && {
          animateOnMount: false,
          animationConfigs: { duration: 0.0000001, overshootClamping: true },
        })}
        enableContentPanningGesture={false}
        sheetRef={ref}
        snapPoints={["100%"]}
        maxWidth="100%"
        handleComponent={() => null}
        backgroundComponent={() => null}
        onClose={handleClose}
      >
        <View
          style={{
            padding: 20,
            gap: 10,
            backgroundColor: theme[2],
            marginTop: "auto",
            marginBottom: breakpoints.md ? "auto" : 20,
            borderRadius: 25,
            maxWidth: 500,
            marginHorizontal: "auto",
            width: "100%",

            shadowColor: "rgba(0, 0, 0, 0.12)",
            shadowOffset: {
              width: 10,
              height: 10,
            },
            shadowRadius: 20,
            shadowOpacity: 1,
          }}
        >
          <IconButton
            size={55}
            variant="outlined"
            style={{ marginBottom: 10 }}
            onPress={handleClose}
          >
            <Icon>close</Icon>
          </IconButton>
          <View
            style={{
              borderWidth: 1,
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 20,
              paddingLeft: 20,
              borderColor: theme[5],
            }}
          >
            <Icon>alternate_email</Icon>
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
                      handleClose();
                    }
                  }}
                  bottomSheet
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  inputRef={(ref) => {
                    setTimeout(() => ref?.focus(), breakpoints.md ? 100 : 500);
                  }}
                  placeholder="Search by email or username..."
                  style={{
                    flex: 1,
                    padding: 20,
                    fontSize: 20,
                    shadowRadius: 0,
                  }}
                />
              )}
            />
          </View>
          <Suggestions setValue={setValue} watch={watch} />
          <Button
            isLoading={loading}
            style={{ height: 70 }}
            variant="filled"
            onPress={handleSubmit(onSubmit)}
          >
            <ButtonText weight={900} style={{ fontSize: 20 }}>
              Send request
            </ButtonText>
            <Icon bold>send</Icon>
          </Button>
        </View>
      </BottomSheet>
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
      const data = await sendApiRequest(
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
      console.log(data);
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

function BlockRequestButton({ mutate, id }) {
  return (
    <ConfirmationModal
      height={410}
      title="Block user?"
      secondary="You can unblock this user any time. We won't let this person know you've blocked them."
      onSuccess={async () => {
        await new Promise((r) => setTimeout(() => r("hi"), 100));
      }}
    >
      <IconButton variant="outlined" size={40} style={{ marginRight: -10 }}>
        <Icon>person_off</Icon>
      </IconButton>
    </ConfirmationModal>
  );
}

function FriendOptionsButton() {
  return (
    <MenuPopover
      trigger={
        <IconButton variant="outlined" size={40} style={{ marginRight: -10 }}>
          <Icon>more_vert</Icon>
        </IconButton>
      }
      menuProps={{
        rendererProps: { placement: "left" },
      }}
      options={[
        { icon: "person_remove", text: "Remove friend" },
        // { icon: "block", text: "Block user" },
      ]}
    />
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

  const Header = () => (
    <>
      <View
        style={{
          paddingBottom: 40,
          paddingTop: 10,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 5,
        }}
      >
        <Text weight={900} style={{ fontSize: 40 }}>
          Friends
        </Text>
        <AddFriend friends={data} mutate={mutate} />
      </View>
      <ButtonGroup
        containerStyle={{ backgroundColor: "transparent", borderRadius: 0 }}
        buttonTextStyle={{
          color: theme[11],
        }}
        buttonStyle={{
          borderBottomWidth: 0,
        }}
        activeComponent={
          <View
            style={{
              width: 20,
              height: 5,
              marginLeft: "auto",
              marginRight: "auto",
              borderRadius: 99,
              backgroundColor: theme[11],
            }}
          />
        }
        selectedButtonStyle={{}}
        scrollContainerStyle={{ minWidth: "100%" }}
        options={[
          { label: "All", value: "all" },
          { label: "Requests", value: "requests" },
          { label: "Pending", value: "pending" },
          // { label: "Blocked", value: "blocked" },
        ]}
        state={[view, setView]}
      />
    </>
  );

  return (
    <ContentWrapper noPaddingTop>
      <IconButton
        onPress={handleBack}
        icon="arrow_back_ios_new"
        style={{ marginBottom: 20, margin: 20 }}
        variant="outlined"
        size={55}
      />
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
        <FlashList
          ListHeaderComponent={Header}
          contentContainerStyle={{ paddingHorizontal: 20 }}
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
                  secondary={`Active ${dayjs(
                    item.user.profile?.lastActive
                  ).fromNow()}`}
                />
                {view === "pending" ? (
                  <DeleteRequestButton mutate={mutate} id={item.user.id} />
                ) : view === "requests" ? (
                  <>
                    {/* <BlockRequestButton mutate={mutate} id={item.user.id} /> */}
                    <DeleteRequestButton
                      reject
                      mutate={mutate}
                      id={item.user.id}
                    />
                    <AcceptRequestButton mutate={mutate} id={item.user.id} />
                  </>
                ) : (
                  <>
                    <FriendOptionsButton />
                  </>
                )}
              </ListItemButton>
            </ProfileModal>
          )}
          estimatedItemSize={100}
        />
      </View>
    </ContentWrapper>
  );
}
