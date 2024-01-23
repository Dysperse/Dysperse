import { useCommandPaletteContext } from "@/components/command-palette/context";
import { styles } from "@/components/home/styles";
import { useTabMetadata } from "@/components/layout/bottom-navigation/tabs/useTabMetadata";
import { ContentWrapper } from "@/components/layout/content";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Chip from "@/ui/Chip";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ImageBackground, TouchableOpacity, View } from "react-native";
import useSWR from "swr";
import { ProfileModal } from "../../components/ProfileModal";

function Greeting() {
  const theme = useColorTheme();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 10) {
      setGreeting("Good morning");
    } else if (hour < 16) {
      setGreeting("Good afternoon");
    } else if (hour < 20) {
      setGreeting("Good evening");
    } else {
      setGreeting("Good night");
    }
  }, []);

  return (
    <Text
      weight={100}
      numberOfLines={1}
      style={{
        textAlign: "center",
        color: theme[12],
        fontSize: 70,
        marginBottom: 10,
      }}
    >
      {greeting}
    </Text>
  );
}

function PlanDayPrompt() {
  const theme = useColorTheme();

  return (
    <TouchableOpacity style={{ flex: 1 }}>
      <LinearGradient
        colors={[theme[3], theme[3]]}
        start={[0, 0]}
        end={[1, 1]}
        style={[styles.card]}
      >
        <Icon size={30}>gesture</Icon>
        <View style={{ flex: 1 }}>
          <Text weight={700} style={{ fontSize: 20 }} numberOfLines={1}>
            Plan your day
          </Text>
          <Text
            style={{ fontSize: 14, opacity: 0.7, marginTop: 1.5 }}
            numberOfLines={1}
          >
            Tap to begin
          </Text>
        </View>
        <Icon style={{ marginLeft: "auto" }}>arrow_forward_ios</Icon>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function FriendActivity() {
  const theme = useColorTheme();
  const { data, isLoading, error } = useSWR(["user/friends"]);
  const handleFriendsPress = useCallback(() => router.push("/friends"), []);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 20,
        height: data?.length <= 1 ? 180 : 180 * 2 + 2,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
      }}
    >
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <ErrorAlert />
      ) : (
        Array.isArray(data) &&
        [...data, "ALL_FRIENDS"].map((friend) =>
          friend === "ALL_FRIENDS" ? (
            <TouchableOpacity
              key={"all"}
              onPress={handleFriendsPress}
              style={{
                height: 180,
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                flex: 0.5,
              }}
            >
              <Avatar size={90} disabled>
                <Icon size={30}>groups_2</Icon>
              </Avatar>
              <Text style={{ opacity: 0.6 }}>All Friends</Text>
            </TouchableOpacity>
          ) : (
            <ProfileModal email={friend.user.email} key={friend.user.email}>
              <TouchableOpacity
                style={{
                  height: 180,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  flex: 0.5,
                }}
              >
                <View
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 999,
                    position: "relative",
                  }}
                >
                  <ProfilePicture
                    style={{ pointerEvents: "none" }}
                    name={friend.user.profile?.name || "--"}
                    image={friend.user.profile?.picture}
                    size={90}
                  />
                  <Chip
                    // dense
                    disabled
                    style={{
                      position: "absolute",
                      bottom: -3,
                      right: -3,
                      height: 30,
                      borderWidth: 5,
                      borderColor: theme[1],
                    }}
                    textStyle={{ fontSize: 13 }}
                    label={
                      dayjs(friend.user.profile?.lastActive)
                        .fromNow(true)
                        .includes("few")
                        ? "NOW"
                        : dayjs(friend.user.profile?.lastActive)
                            .fromNow(true)
                            .split(" ")[0]
                            .replace("a", "1") +
                          dayjs(friend.user.profile?.lastActive)
                            .fromNow(true)
                            .split(" ")?.[1]?.[0]
                            .toUpperCase()
                    }
                  />
                </View>
                <Text style={{ opacity: 0.6 }}>
                  {friend.user.profile?.name.split(" ")?.[0]}
                </Text>
              </TouchableOpacity>
            </ProfileModal>
          )
        )
      )}
    </View>
  );
}

function JumpBackIn() {
  const theme = useColorTheme();
  const [data, setData] = useState<Record<
    string,
    string | Record<string, string>
  > | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("recentlyAccessed").then((data) => {
      setLoading(false);
      setData(JSON.parse(data));
    });
  }, []);

  const handlePress = useCallback(() => {
    if (!data) return;
    router.replace({
      pathname: data.slug as string,
      params: {
        tab: data.id,
        ...(data.params as Record<string, string>),
      },
    });
  }, [data]);

  const tabMetadata = useTabMetadata(data?.slug as string, data?.params);

  return (
    data !== null && (
      <TouchableOpacity onPress={handlePress} style={{ flex: 1 }}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme[3],
            },
          ]}
        >
          <Icon size={30}>
            {typeof tabMetadata.icon === "function"
              ? tabMetadata.icon(data?.params)
              : tabMetadata.icon}
          </Icon>
          <View>
            <Text weight={700} style={{ fontSize: 20 }} numberOfLines={1}>
              {capitalizeFirstLetter(tabMetadata.name(data?.params)[0])}
            </Text>
            <Text
              style={{ fontSize: 14, opacity: 0.7, marginTop: 1.5 }}
              numberOfLines={1}
            >
              {tabMetadata.name(data?.params)[1]}
            </Text>
          </View>
          <Icon style={{ marginLeft: "auto" }}>arrow_forward_ios</Icon>
        </View>
      </TouchableOpacity>
    )
  );
}

function JumpTo() {
  const { handleOpen } = useCommandPaletteContext();
  const theme = useColorTheme();

  return (
    <TouchableOpacity onPress={handleOpen}>
      <BlurView
        tint="dark"
        intensity={20}
        style={{
          backgroundColor: addHslAlpha(theme[2], 0.4),
          borderColor: addHslAlpha(theme[5], 0.4),
          borderWidth: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingHorizontal: 20,
          paddingVertical: 15,
          borderRadius: 20,
          marginBottom: 10,
          gap: 20,
        }}
      >
        <Icon size={35}>bolt</Icon>
        <Text style={{ color: theme[11], fontSize: 20 }} weight={300}>
          Jump to a collection, label, or more...
        </Text>
      </BlurView>
    </TouchableOpacity>
  );
}

export default function Index() {
  const theme = useColorTheme();

  const [view, setView] = useState("home");

  return (
    <ContentWrapper>
      <ImageBackground
        source={{
          uri: "https://i.pinimg.com/736x/a0/33/a6/a033a6d215cfdc41dbfd92c5ac5dc8cf.jpg",
        }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: addHslAlpha(theme[1], 0.9),
            alignItems: "center",
          }}
        >
          <ButtonGroup
            state={[view, setView]}
            options={[
              { icon: "home", value: "home" },
              { icon: "upcoming", value: "start" },
              { icon: "more_horiz", value: "edit" },
            ]}
            containerStyle={{
              width: "auto",
              marginTop: 50,
            }}
            buttonStyle={{ flex: 1, borderBottomColor: "transparent" }}
            scrollContainerStyle={{ flex: 1, gap: 15 }}
            buttonTextStyle={{ textAlign: "center" }}
            selectedButtonStyle={{ borderBottomColor: theme[11] }}
          />
          <View
            style={{
              maxWidth: 700,
              paddingHorizontal: 50,
              paddingBottom: 70,
              width: "100%",
              marginHorizontal: "auto",
              marginVertical: "auto",
            }}
          >
            {view === "home" ? (
              <>
                <Greeting />
                <JumpTo />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 20,
                    marginTop: 20,
                    width: "100%",
                  }}
                >
                  <PlanDayPrompt />
                  <JumpBackIn />
                </View>
              </>
            ) : (
              <FriendActivity />
            )}
          </View>
        </View>
      </ImageBackground>
    </ContentWrapper>
  );
}
