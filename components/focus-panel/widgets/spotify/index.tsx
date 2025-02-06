import { useUser } from "@/context/useUser";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import { Linking, Pressable, View } from "react-native";
import useSWR from "swr";
import { useFocusPanelContext } from "../../context";
import { SpotifyPreview } from "./SpotifyPreview";

export default function Spotify({ menuActions, params, navigation }) {
  const theme = useColorTheme();
  const { panelState } = useFocusPanelContext();
  const { data, mutate } = useSWR(["user/currently-playing"], {
    refreshInterval: 5000,
  });
  const { sessionToken } = useUser();
  const handleSpotifyAuthorization = () => {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/user/currently-playing/redirect?token=${sessionToken}`;
    Linking.openURL(url);
  };

  return (
    <Pressable onPress={() => mutate()} onMouseEnter={() => mutate()}>
      {data?.error === "AUTHORIZATION_REQUIRED" ? (
        <Pressable
          onPress={handleSpotifyAuthorization}
          style={({ pressed, hovered }) => ({
            padding: 20,
            backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
            aspectRatio: panelState === "COLLAPSED" ? 1 : undefined,
          })}
        >
          <Image
            style={{ width: 24, height: 24 }}
            source={{
              uri: "https://cdn.brandfetch.io/id20mQyGeY/theme/dark/symbol.svg?k=bfHSJFAPEG",
            }}
          />
          <Text
            style={{ marginTop: 5, fontSize: 20, textAlign: "center" }}
            weight={900}
          >
            See what's playing
          </Text>
          <Text style={{ textAlign: "center" }}>
            Tap to connect your Spotify account
          </Text>
        </Pressable>
      ) : data?.is_playing ? (
        <SpotifyPreview navigation={navigation} mutate={mutate} data={data} />
      ) : (
        <View
          style={{
            padding: 17,
            paddingVertical: 13,
            backgroundColor: theme[3],
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{ fontSize: 17, lineHeight: 18, opacity: 0.6 }}
            weight={300}
          >
            No music playing
          </Text>
        </View>
      )}
    </Pressable>
  );
}

