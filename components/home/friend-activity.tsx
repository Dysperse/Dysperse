import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import Chip from "@/ui/Chip";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { useCallback } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { getProfileLastActiveRelativeTime } from "../../app/(app)";
import { ProfileModal } from "../ProfileModal";

const styles = StyleSheet.create({
  allFriends: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 10,
    gap: 10,
  },
  scrollContainer: { borderWidth: 1, borderRadius: 20, width: "100%" },
  scrollContentContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 10,
  },
  badge: { width: 10, borderRadius: 99, height: 10 },

  skeletonContainer: {
    height: 90,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  skeletonCircle: {
    width: 60,
    height: 60,
    borderRadius: 999,
    marginBottom: -5,
    position: "relative",
  },
  skeletonText: { height: 15, width: 60, borderRadius: 99, marginTop: 2 },
  friendBadge: {
    position: "absolute",
    bottom: -3,
    right: -3,
    height: 30,
    borderWidth: 5,
    paddingHorizontal: 7,
  },
});

export function FriendActivity() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { data, isLoading, error } = useSWR(["user/friends"]);
  const { height } = useWindowDimensions();
  const handleFriendsPress = useCallback(() => router.push("/friends"), []);

  const friends = Array.isArray(data) && [...data, "ALL_FRIENDS"];
  const red = useColor("red");

  if (friends.length < 8)
    for (let i = friends.length; i < 8; i++) {
      friends.push({ placeholder: i });
    }

  const { session } = useUser();
  const { data: friendData } = useSWR(["user/friends", { requests: "true" }]);

  const hasRequest =
    Array.isArray(friendData) &&
    Boolean(
      friendData?.find(
        (user) =>
          user.accepted === false && user.followingId === session?.user?.id
      )
    );

  return (
    <View>
      <View style={styles.container}>
        <Text variant="eyebrow">Recent Activity</Text>
        {hasRequest && (
          <View style={[styles.badge, { backgroundColor: red[9] }]} />
        )}
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContentContainer,
          Platform.OS === "web" && { paddingBottom: 0 },
        ]}
        style={[
          styles.scrollContainer,
          {
            borderColor: theme[4],
            backgroundColor: theme[2],
          },
        ]}
        horizontal={breakpoints.md}
      >
        {isLoading ? (
          <View
            style={{
              height: breakpoints.md ? height / 3 - 25 : "100%",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spinner />
          </View>
        ) : Array.isArray(friends) ? (
          friends.map((friend, i) =>
            friend === "ALL_FRIENDS" ? (
              <TouchableOpacity
                key={"all"}
                onPress={handleFriendsPress}
                style={[
                  styles.skeletonContainer,
                  !breakpoints.md && { width: "33.333%", height: 115 },
                ]}
              >
                <Avatar size={60} disabled>
                  <Icon size={30}>groups_2</Icon>
                </Avatar>
                <View style={styles.allFriends}>
                  <Text style={{ opacity: 0.6 }} numberOfLines={1}>
                    All Friends
                  </Text>
                  {hasRequest && (
                    <View style={[styles.badge, { backgroundColor: red[9] }]} />
                  )}
                </View>
              </TouchableOpacity>
            ) : !friend.user ? (
              <View
                key={Math.random()}
                style={[
                  styles.skeletonContainer,
                  !breakpoints.md && { width: "33.333%", height: 115 },
                ]}
              >
                <View
                  style={[
                    styles.skeletonCircle,
                    { backgroundColor: theme[~~(7 - i / 2)] },
                  ]}
                />
                <View
                  style={[
                    styles.skeletonText,
                    { backgroundColor: theme[~~(7 - i / 2)] },
                  ]}
                />
              </View>
            ) : (
              <ProfileModal email={friend.user.email} key={friend.user.email}>
                <TouchableOpacity
                  style={[
                    styles.skeletonContainer,
                    !breakpoints.md && {
                      width: "33.333%",
                      height: 115,
                    },
                  ]}
                >
                  <View style={styles.skeletonCircle}>
                    <ProfilePicture
                      style={{ pointerEvents: "none" }}
                      name={friend.user.profile?.name || "--"}
                      image={friend.user.profile?.picture}
                      size={60}
                    />
                    <Chip
                      dense
                      disabled
                      style={[
                        styles.friendBadge,
                        { borderColor: theme[2] },
                        getProfileLastActiveRelativeTime(
                          friend.user.profile?.lastActive
                        ) === "NOW" && {
                          backgroundColor: theme[10],
                          height: 26,
                          width: 26,
                          paddingHorizontal: 0,
                        },
                      ]}
                      textStyle={{ fontSize: 13 }}
                      textWeight={700}
                      label={getProfileLastActiveRelativeTime(
                        friend.user.profile?.lastActive
                      ).replace("NOW", "")}
                    />
                  </View>
                  <Text style={{ opacity: 0.6 }}>
                    {friend.user.profile?.name.split(" ")?.[0]}
                  </Text>
                </TouchableOpacity>
              </ProfileModal>
            )
          )
        ) : (
          error && <ErrorAlert />
        )}
      </ScrollView>
    </View>
  );
}
