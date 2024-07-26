import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { addHslAlpha, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Linking, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import useSWR from "swr";
import { Navbar } from "../../panel";
import { useImageColors } from "./useImageColors";

const SpotifyLargePreview = ({ data, navigation, mutate }) => {
  const theme = useColorTheme();
  const progress = useSharedValue(data.progress_ms / data.item.duration_ms);
  const colors = useImageColors(data.item.album.images[0].url);

  useEffect(() => {
    progress.value = data.progress_ms / data.item.duration_ms;
  }, [data.progress_ms, data.item.duration_ms]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (progress.value < 1) {
        progress.value += 0.05 / (data.item.duration_ms / 1000); // Increase based on the duration
      } else {
        clearInterval(interval);
        mutate(); // Refresh the data when the song ends
      }
    }, 50); // Update every 50ms

    return () => clearInterval(interval);
  }, [data, mutate]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  const isDark = useDarkMode();

  const backgroundColors = [
    (isDark ? colors?.dominant : colors?.lightVibrant) || theme[2],
    (isDark ? colors?.muted : colors?.lightMuted) || theme[5],
  ];

  const textColor = isDark ? "hsl(0, 0%, 100%)" : "hsl(0, 0%, 0%)";

  return (
    <LinearGradient
      colors={backgroundColors}
      style={{
        flex: 1,
        marginTop: -70,
        paddingTop: 70,
        zIndex: -1,
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: data.item.album.images[0].url }}
          style={{
            borderRadius: 5,
            width: "100%",
            aspectRatio: 1,
            shadowRadius: 20,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: {
              width: 10,
              height: 10,
            },
          }}
        />
        <Text
          style={{
            fontSize: 30,
            marginTop: 20,
            color: textColor,
          }}
          weight={900}
        >
          {data.item.name}
        </Text>
        <Text
          style={{
            opacity: 0.6,
            fontSize: 25,
            color: addHslAlpha(textColor, 0.7),
          }}
        >
          {data.item.artists.map((a) => a.name).join(", ")}
        </Text>
        <View
          style={{
            overflow: "hidden",
            borderRadius: 99,
            width: "100%",
            height: 10,
            marginTop: 10,
            backgroundColor: addHslAlpha(textColor, 0.2),
          }}
        >
          <Animated.View
            style={[
              {
                height: "100%",
                borderRadius: 99,
                backgroundColor: textColor,
              },
              animatedStyle,
            ]}
          />
        </View>

        <Pressable
          onPress={() => Linking.openURL(data.item.external_urls.spotify)}
          style={({ pressed, hovered }) => ({
            marginTop: 20,
            borderRadius: 20,
            padding: 20,
            backgroundColor: addHslAlpha(
              textColor,
              pressed ? 0.2 : hovered ? 0.1 : 0.05
            ),
          })}
        >
          <Text
            weight={900}
            style={{
              fontSize: 13,
              color: textColor,
              opacity: 0.6,
            }}
          >
            ALBUM
          </Text>
          <Text
            style={{
              fontSize: 20,
              color: textColor,
            }}
            weight={900}
          >
            {data.item.album.name}
          </Text>
          <Text
            style={{
              opacity: 0.6,
              fontSize: 15,
              color: addHslAlpha(textColor, 0.7),
            }}
          >
            Released {dayjs(data.item.album.release_date).fromNow()}
          </Text>
        </Pressable>

        <Button
          height={70}
          containerStyle={{ marginTop: 10 }}
          variant="filled"
          backgroundColors={{
            default: isDark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.05)",
            pressed: isDark
              ? "rgba(255, 255, 255, 0.2)"
              : "rgba(0, 0, 0, 0.15)",
            hovered: isDark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.15)",
          }}
          borderColors={{
            default: "transparent",
            pressed: "transparent",
            hovered: "transparent",
          }}
          onPress={() => Linking.openURL(data.item.external_urls.spotify)}
        >
          <ButtonText weight={900} style={{ fontSize: 20, color: textColor }}>
            Open in Spotify
          </ButtonText>
          <Icon style={{ color: textColor }} bold>
            north_east
          </Icon>
        </Button>
      </ScrollView>
    </LinearGradient>
  );
};

export function FocusPanelSpotify({ navigation }) {
  const isDark = useDarkMode();
  const { data, error, mutate } = useSWR(["user/currently-playing"], {
    refreshInterval: 5000,
  });

  return (
    <>
      <Navbar
        title="Spotify"
        navigation={navigation}
        foregroundColor={isDark ? "white" : "black"}
        backgroundColor={data?.is_playing ? "transparent" : undefined}
      />
      {data?.is_playing ? (
        <SpotifyLargePreview
          navigation={navigation}
          data={data}
          mutate={mutate}
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text
            weight={900}
            style={{ fontSize: 20, textAlign: "center", opacity: 0.6 }}
          >
            Play something on Spotify to see it here!
          </Text>
        </View>
      )}
    </>
  );
}
