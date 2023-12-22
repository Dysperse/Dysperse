import { ContentWrapper } from "@/components/layout/content";
import { useUser } from "@/context/useUser";
import { Avatar } from "@/ui/Avatar";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Pressable,
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
    <ContentWrapper>
      {data ? (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
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
          <Pressable style={() => [profileStyles.card, themedCardValues]}>
            <View style={profileStyles.cardContent}>
              <Text variant="eyebrow">Local Time</Text>
              <Text style={profileStyles.statHeading}>
                {dayjs(data.profile.lastActive)
                  .tz(data.timeZone)
                  .format("h:mm A")}
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
            <Avatar size={40}>
              <Icon>emoji_objects</Icon>
            </Avatar>
          </Pressable>
          <Text>{JSON.stringify(data, null, 2)}</Text>
        </ScrollView>
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
          <ActivityIndicator />
        </View>
      )}
    </ContentWrapper>
  );
}
