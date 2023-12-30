import { createTab } from "@/components/layout/sidebar";
import { useUser } from "@/context/useUser";
import { ProfilePicture } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { useState } from "react";
import { View } from "react-native";
import useSWR from "swr";

type FriendsPageView = "all" | "requests" | "pending" | "blocked";

export default function Page() {
  const { sessionToken, session } = useUser();
  const theme = useColorTheme();
  const [view, setView] = useState<FriendsPageView>("all");

  const { data, isLoading, error } = useSWR(["user/friends"]);

  const Header = () => (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 30,
          marginBottom: 10,
        }}
      >
        <Text heading style={{ fontSize: 50 }}>
          Friends
        </Text>
        <Button variant="outlined">
          <Icon>person_add</Icon>
          <ButtonText>Add friend</ButtonText>
        </Button>
      </View>
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
        {[
          { label: "All", value: "all" },
          { label: "Requests", value: "requests" },
          { label: "Pending", value: "pending" },
          { label: "Blocked", value: "blocked" },
        ].map((i: any) => (
          <Chip
            outlined={view !== i.value}
            label={i.label}
            icon={
              view === i.value ? (
                <Icon style={{ marginLeft: -10 }}>check</Icon>
              ) : undefined
            }
            onPress={() => setView(i.value)}
            key={i.value}
            style={{ padding: 20, paddingHorizontal: 20 }}
          />
        ))}
      </View>
    </>
  );

  return (
    <View
      style={{
        paddingTop: 64,
        flex: 1,
        maxWidth: 500,
        marginHorizontal: "auto",
        width: "100%",
      }}
    >
      <FlashList
        ListHeaderComponent={Header}
        style={{
          width: "100%",
          flex: 1,
          paddingHorizontal: 20,
          marginHorizontal: "auto",
        }}
        contentContainerStyle={{
          paddingHorizontal: 20,
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
              height: "100%",
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
                <Text style={{ fontSize: 20 }} weight={700}>
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
            <Icon>arrow_forward_ios</Icon>
          </ListItemButton>
        )}
        estimatedItemSize={100}
      />
    </View>
  );
}
