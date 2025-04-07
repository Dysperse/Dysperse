import { useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import { Image } from "expo-image";
import { useEffect } from "react";
import { Linking, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useImageColors } from "./useImageColors";

export const SpotifyPreview = ({ data, mutate }) => {
  const theme = useColorTheme();
  const progress = useSharedValue(data.progress_ms / data.item.duration_ms);
  const colors = useImageColors(data.item.album.images[0].url);

  useEffect(() => {
    progress.value = data.progress_ms / data.item.duration_ms;
  }, [data]);

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

  return (
    <Pressable
      style={{
        backgroundColor: theme[2],
        borderRadius: 20,
        borderWidth: 1,
        flexDirection: "row",
        padding: 20,
        gap: 20,
        borderColor: theme[5],
      }}
      onPress={() => {
        Linking.openURL(data.item.external_urls.spotify);
      }}
    >
      <Image
        source={{ uri: data.item.album.images[0].url }}
        style={{ width: 70, height: 70, borderRadius: 3 }}
      />
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme[11],
              fontFamily: "serifText700",
              fontSize: 20,
              marginBottom: 3,
            }}
            numberOfLines={1}
          >
            {data.item.name}
          </Text>
          <Text
            style={{
              color: theme[11],
              opacity: 0.6,
              marginBottom: 3,
            }}
            weight={600}
            numberOfLines={1}
          >
            {data.item.artists.map((artist) => artist.name).join(", ")}
          </Text>
        </View>
        <View
          style={{
            overflow: "hidden",
            borderRadius: 5,
            width: "100%",
            height: 10,
            marginTop: 2,
            backgroundColor: theme[4],
          }}
        >
          <Animated.View
            style={[
              {
                height: "100%",
                borderRadius: 5,
                backgroundColor: theme[7],
              },
              animatedStyle,
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
};

