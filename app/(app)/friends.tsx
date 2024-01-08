import { ContentWrapper } from "@/components/layout/content";
import { createTab } from "@/components/layout/openTab";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { ProfilePicture } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
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
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";

type FriendsPageView = "all" | "requests" | "pending" | "blocked";

function AddFriend({ mutate }) {
  const theme = useColorTheme();
  const [loading, setLoading] = useState(false);
  const ref = useRef<BottomSheetModal>(null);
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const { session } = useSession();

  const onSubmit = async (values) => {
    try {
      Keyboard.dismiss();
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
    } catch {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Something went wrong",
      });
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
                  autoFocus
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  placeholder="Email or username"
                  style={{
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

function DeleteRequestButton({ mutate, id }) {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    try {
      setLoading(true);
      const data = await sendApiRequest(
        session,
        "DELETE",
        "user/friends",
        {},
        { body: JSON.stringify({ userId: id }) }
      );
      await mutate();
      Toast.show({
        type: "success",
        text1: "Deleted request!",
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

export default function Page() {
  const { sessionToken, session } = useUser();
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  const [view, setView] = useState<FriendsPageView>("all");

  const { data, isLoading, mutate, error } = useSWR(["user/friends"]);
  const insets = useSafeAreaInsets();

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
        <Text heading style={{ fontSize: 50 }}>
          Friends
        </Text>
        <AddFriend mutate={mutate} />
      </View>
      <ButtonGroup
        containerStyle={{ backgroundColor: "transparent", borderRadius: 0 }}
        buttonTextStyle={{
          color: theme[11],
        }}
        selectedButtonStyle={{}}
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
                        ? "1fae3"
                        : "1f614"
                    }
                    size={50}
                  />
                  <Text
                    style={{ fontSize: 20, textAlign: "center" }}
                    weight={700}
                  >
                    {view === "blocked"
                      ? "You haven't blocked anybody"
                      : view === "requests"
                      ? "You haven't sent any friend requests"
                      : view === "pending"
                      ? "You don't have any pending requests"
                      : "You don't have any friends"}
                  </Text>
                </View>
              )}
            </View>
          }
          renderItem={({ item }: any) => (
            <ListItemButton
              style={{ backgroundColor: theme[3], marginTop: 10 }}
              onPress={() =>
                createTab(sessionToken, {
                  slug: "/[tab]/users/[id]",
                  params: { id: item.user.email },
                })
              }
            >
              <ProfilePicture
                style={{ pointerEvents: "none" }}
                name={item.user.profile?.name || "--"}
                image={item.user.profile?.picture}
                size={40}
              />
              <ListItemText
                primary={item.user.profile?.name}
                secondary={`Active ${dayjs(
                  item.user.profile?.lastActive
                ).fromNow()}`}
              />
              {view === "pending" ? (
                <DeleteRequestButton mutate={mutate} id={item.user.id} />
              ) : (
                <Icon>arrow_forward_ios</Icon>
              )}
            </ListItemButton>
          )}
          estimatedItemSize={100}
        />
      </View>
    </ContentWrapper>
  );
}
