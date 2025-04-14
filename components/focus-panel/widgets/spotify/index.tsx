import { useUser } from "@/context/useUser";
import { Button } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Icon from "@/ui/Icon";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import { Linking, Pressable, View } from "react-native";
import useSWR from "swr";
import { SpotifyPreview } from "./SpotifyPreview";

export default function Spotify({ small, handlePin, setParam, widget }) {
  const theme = useColorTheme();
  const { data, mutate } = useSWR(["user/currently-playing"], {
    refreshInterval: 5000,
  });
  const { sessionToken } = useUser();
  const handleSpotifyAuthorization = () => {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/user/currently-playing/redirect?token=${sessionToken}`;
    Linking.openURL(url);
  };

  if (widget.params.hideWhenEmpty && !data?.is_playing && !small) return null;

  return (
    <Pressable
      onPress={() => mutate()}
      onMouseEnter={() => mutate()}
      pointerEvents={small ? "none" : undefined}
      style={{ flex: 1 }}
    >
      {!small && (
        <MenuPopover
          menuProps={{
            style: { marginRight: "auto", marginLeft: -10 },
            rendererProps: { placement: "bottom" },
          }}
          containerStyle={{ width: 250, marginLeft: 20, marginTop: -15 }}
          options={[
            {
              text: widget.pinned ? "Pinned" : "Pin",
              icon: "push_pin",
              callback: handlePin,
              selected: widget.pinned,
            },
            {
              renderer: () => (
                <ConfirmationModal
                  title="Hide when empty?"
                  secondary="You won't be able to see this widget when there are no upcoming tasks."
                  onSuccess={() => setParam("hideWhenEmpty", true)}
                >
                  <MenuItem>
                    <Icon>visibility</Icon>
                    <Text variant="menuItem">Hide when not playing?</Text>
                  </MenuItem>
                </ConfirmationModal>
              ),
            },
          ]}
          trigger={
            <Button
              dense
              textProps={{ variant: "eyebrow" }}
              text="Spotify"
              icon="expand_more"
              iconPosition="end"
              containerStyle={{ marginBottom: 5 }}
              iconStyle={{ opacity: 0.6 }}
            />
          }
        />
      )}
      {data?.error === "AUTHORIZATION_REQUIRED" ? (
        <Pressable
          onPress={handleSpotifyAuthorization}
          style={
            small
              ? undefined
              : ({ pressed, hovered }) => ({
                  padding: 20,
                  backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 5,
                  aspectRatio: 1,
                })
          }
        >
          {!small && (
            <Image
              style={{ width: 24, height: 24 }}
              source={{
                uri: "https://cdn.brandfetch.io/id20mQyGeY/theme/dark/symbol.svg?k=bfHSJFAPEG",
              }}
            />
          )}
          <Text
            style={{
              marginTop: small ? 0 : 5,
              fontSize: small ? 12 : 20,
              textAlign: "center",
              color: theme[11],
            }}
            weight={900}
          >
            See what's playing
          </Text>
          <Text
            style={[
              small && { fontSize: 12 },
              {
                color: theme[11],
                textAlign: "center",
              },
            ]}
          >
            Tap to connect {!small && "your Spotify account"}
          </Text>
        </Pressable>
      ) : data?.is_playing ? (
        <SpotifyPreview small={small} mutate={mutate} data={data} />
      ) : (
        <View
          style={
            small
              ? undefined
              : {
                  padding: 17,
                  height: 70,
                  backgroundColor: theme[2],
                  borderWidth: 1,
                  borderColor: theme[5],
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                }
          }
        >
          <Text
            style={[
              { color: theme[11], opacity: 0.4 },
              small && { fontSize: 13, opacity: 1, textAlign: "center" },
            ]}
            weight={small ? 900 : 300}
          >
            No music playing
          </Text>
        </View>
      )}
    </Pressable>
  );
}
