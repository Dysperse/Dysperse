import { ContentWrapper } from "@/components/layout/content";
import { createTab } from "@/components/layout/openTab";
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
import { View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSWR from "swr";

type FriendsPageView = "all" | "requests" | "pending" | "blocked";

export default function Page() {
  const { sessionToken, session } = useUser();
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  const [view, setView] = useState<FriendsPageView>("all");

  const { data, isLoading, error } = useSWR(["user/friends"]);
  const insets = useSafeAreaInsets();

  const Header = () => (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 20 + insets.top,
          marginBottom: 10,
        }}
      >
        <Text heading style={{ fontSize: 50 }}>
          Friends
        </Text>
        <Button variant="filled" style={{ paddingHorizontal: 25 }}>
          <Icon>person_add</Icon>
          <ButtonText>Add</ButtonText>
        </Button>
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
            paddingTop: width > 600 ? 64 : 80,
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
              <Icon>arrow_forward_ios</Icon>
            </ListItemButton>
          )}
          estimatedItemSize={100}
        />
      </View>
    </ContentWrapper>
  );
}
