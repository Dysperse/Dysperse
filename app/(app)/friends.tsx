import { ContentWrapper } from "@/components/layout/content";
import { createTab } from "@/components/layout/openTab";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
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
import { Menu } from "@/ui/Menu";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, View, useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

type FriendsPageView = "all" | "requests" | "pending" | "blocked";

function AddFriend({ friends, mutate }) {
  const theme = useColorTheme();
  const [loading, setLoading] = useState(false);
  const ref = useRef<BottomSheetModal>(null);
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const { session } = useSession();

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
      <BottomSheet sheetRef={ref} snapPoints={[280]} onClose={handleClose}>
        <View style={{ padding: 20, paddingTop: 0, gap: 10 }}>
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
                  bottomSheet
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  placeholder="Email or username"
                  style={{
                    flex: 1,
                    padding: 20,
                    fontSize: 20,
                  }}
                />
              )}
            />
          </View>
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
    <Menu
      height={[315]}
      trigger={
        <IconButton variant="outlined" size={40} style={{ marginRight: -10 }}>
          <Icon>more_vert</Icon>
        </IconButton>
      }
    >
      <View style={{ paddingHorizontal: 20, gap: 20 }}>
        <Button style={{ height: 70 }} variant="outlined">
          <ButtonText weight={900} style={{ fontSize: 20 }}>
            Remove friend
          </ButtonText>
        </Button>
        <Button style={{ height: 70 }} variant="outlined">
          <ButtonText weight={900} style={{ fontSize: 20 }}>
            Block
          </ButtonText>
        </Button>
        <Button style={{ height: 70 }} variant="outlined">
          <ButtonText weight={900} style={{ fontSize: 20 }}>
            Cancel
          </ButtonText>
        </Button>
      </View>
    </Menu>
  );
}

function ViewFriendButton({ email }: { email: string }) {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);

  return (
    <IconButton
      onPress={async () => {
        try {
          await createTab(session, {
            slug: "/[tab]/users/[id]",
            params: { id: email },
          });
        } catch (e) {
          Toast.show({
            type: "error",
            text1: "Something went wrong. Please try again later",
          });
        } finally {
          setLoading(false);
        }
      }}
      variant="outlined"
      size={40}
    >
      {loading ? <Spinner /> : <Icon>arrow_forward_ios</Icon>}
    </IconButton>
  );
}

export default function Page() {
  const { session } = useUser();
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  const [view, setView] = useState<FriendsPageView>("all");

  const { data, isLoading, mutate, error } = useSWR([
    "user/friends",
    { requests: "true" },
  ]);
  useHotkeys("esc", () => router.back());

  const Header = () => (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 50 }} weight={100}>
          Friends
        </Text>
        <AddFriend friends={data} mutate={mutate} />
      </View>
      <ButtonGroup
        containerStyle={{ backgroundColor: "transparent", borderRadius: 0 }}
        buttonTextStyle={{
          color: theme[11],
        }}
        selectedButtonStyle={{}}
        scrollContainerStyle={{ minWidth: "100%" }}
        options={[
          { label: "All", value: "all" },
          { label: "Requests", value: "requests" },
          { label: "Pending", value: "pending" },
          { label: "Blocked", value: "blocked" },
        ]}
        state={[view, setView]}
      />
    </>
  );

  return (
    <ContentWrapper>
      <View
        style={{
          flex: 1,
          maxWidth: 500,
          marginHorizontal: "auto",
          width: "100%",
          minWidth: 5,
          minHeight: 5,
        }}
      >
        <FlashList
          ListHeaderComponent={Header}
          contentContainerStyle={{
            paddingHorizontal: 25,
            paddingTop: width > 600 ? 64 : 25,
          }}
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
            <ListItemButton
              variant="outlined"
              style={{ marginTop: 10 }}
              disabled
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
                  <BlockRequestButton mutate={mutate} id={item.user.id} />
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
                  <ViewFriendButton email={item.user.email} />
                </>
              )}
            </ListItemButton>
          )}
          estimatedItemSize={100}
        />
      </View>
    </ContentWrapper>
  );
}
