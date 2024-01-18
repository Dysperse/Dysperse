import { ContentWrapper } from "@/components/layout/content";
import { useUser } from "@/context/useUser";
import { Avatar } from "@/ui/Avatar";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import useSWR from "swr";

const profileStyles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 25,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  statHeading: {
    fontSize: 27,
    fontFamily: "body_600",
  },
  cardContent: {
    flex: 1,
  },
});

export default function Page() {
  const params = useLocalSearchParams();
  const { data, error } = useSWR(
    typeof params.id === "string"
      ? ["user/profile", { email: decodeURIComponent(params.id) }]
      : null
  );

  const { session } = useUser();

  const theme = useColor(
    data?.profile?.theme || session?.user?.profile?.theme || "violet",
    useColorScheme() === "dark"
  );

  const { width } = useWindowDimensions();
  const themedCardValues = { backgroundColor: theme[2], borderColor: theme[5] };

  return (
    <ColorThemeProvider theme={theme}>
      <ContentWrapper>
        {data?.profile ? (
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: width > 600 ? "row" : "column",
                maxHeight: width > 600 ? "100%" : undefined,
              }}
            >
              <View
                style={{
                  padding: 20,
                  width: width > 600 ? 300 : undefined,
                  paddingRight: 10,
                }}
              >
                <Pressable
                  style={() => [
                    profileStyles.card,
                    themedCardValues,
                    {
                      alignItems: "center",
                      paddingVertical: 40,
                      flexDirection: "column",
                    },
                  ]}
                >
                  <Image
                    source={{
                      uri: data.profile?.picture,
                    }}
                    style={{
                      width: 140,
                      height: 140,
                      borderRadius: 99,
                      marginBottom: 20,
                    }}
                  />
                  <Text heading style={{ fontSize: 40 }} numberOfLines={1}>
                    {data.profile.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      opacity: 0.6,
                      textAlign: "center",
                    }}
                    numberOfLines={1}
                    weight={600}
                  >
                    {data.username && "@"}
                    {data.username || data.email}
                  </Text>
                </Pressable>
              </View>
              <ScrollView
                style={{ flex: 1, height: "100%" }}
                contentContainerStyle={{
                  padding: 20,
                  paddingLeft: 10,
                  gap: 20,
                }}
              >
                <Pressable style={() => [profileStyles.card, themedCardValues]}>
                  <View style={profileStyles.cardContent}>
                    <Text variant="eyebrow">Local Time</Text>
                    <Text style={profileStyles.statHeading}>
                      {dayjs(new Date().toISOString(), data.timeZone).format(
                        "h:mm A"
                      )}
                    </Text>
                  </View>
                  <Avatar size={40}>
                    <Icon>access_time</Icon>
                  </Avatar>
                </Pressable>
                <Pressable style={() => [profileStyles.card, themedCardValues]}>
                  <View style={profileStyles.cardContent}>
                    <Text variant="eyebrow">Last active</Text>
                    <Text style={profileStyles.statHeading}>
                      {dayjs(data.profile.lastActive).fromNow()}
                    </Text>
                  </View>
                  <Avatar size={40} icon="emoji_objects" />
                </Pressable>
                <Pressable style={() => [profileStyles.card, themedCardValues]}>
                  <View style={profileStyles.cardContent}>
                    <Text variant="eyebrow">Birthday</Text>
                    <Text style={profileStyles.statHeading}>
                      {dayjs(data.profile.birthday).format("MMM Do")}
                    </Text>
                    <Text>
                      In{" "}
                      {
                        -dayjs().diff(
                          dayjs(data.profile.birthday).set(
                            "year",
                            new Date().getFullYear() + 1
                          ),
                          "days"
                        )
                      }{" "}
                      days
                    </Text>
                  </View>
                  <Avatar size={40} icon="cake" />
                </Pressable>
                {data.profile.bio && (
                  <Pressable
                    style={() => [profileStyles.card, themedCardValues]}
                  >
                    <View style={profileStyles.cardContent}>
                      <Text variant="eyebrow">About</Text>
                      <Text style={profileStyles.statHeading}>
                        {data.profile.bio}
                      </Text>
                    </View>
                  </Pressable>
                )}
              </ScrollView>
            </View>
          </View>
        ) : error ? (
          <ErrorAlert />
        ) : (
          <View
            style={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spinner />
          </View>
        )}
      </ContentWrapper>
    </ColorThemeProvider>
  );
}
