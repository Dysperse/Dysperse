import { useUser } from "@/context/useUser";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import { Linking, Pressable, View } from "react-native";
import useSWR from "swr";
import { useFocusPanelContext } from "../../context";
import { widgetMenuStyles } from "../../widgetMenuStyles";
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
      {panelState !== "COLLAPSED" && (
        <MenuPopover
          options={[...menuActions]}
          containerStyle={{ marginTop: -15 }}
          trigger={
            <Button style={widgetMenuStyles.button} dense>
              <ButtonText weight={800} style={widgetMenuStyles.text}>
                Spotify
              </ButtonText>
              <Icon style={{ color: theme[11] }}>expand_more</Icon>
            </Button>
          }
        />
      )}
      {data?.error === "AUTHORIZATION_REQUIRED" ? (
        <Pressable
          onPress={handleSpotifyAuthorization}
          style={({ pressed, hovered }) => ({
            padding: 20,
            backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
            borderWidth: 1,
            borderColor: theme[5],
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
            padding: 20,
            backgroundColor: theme[3],
            borderWidth: 1,
            borderColor: theme[5],
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            aspectRatio: panelState === "COLLAPSED" ? 1 : undefined,
          }}
        >
          {panelState === "COLLAPSED" ? (
            <Image
              style={{ width: 24, height: 24 }}
              source={{
                uri: "https://cdn.brandfetch.io/id20mQyGeY/theme/dark/symbol.svg?k=bfHSJFAPEG",
              }}
            />
          ) : (
            <Text
              weight={900}
              style={{
                fontSize: 20,
                textAlign: "center",
                color: theme[11],
                opacity: 0.6,
              }}
            >
              Play something on Spotify to see it here!
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}
