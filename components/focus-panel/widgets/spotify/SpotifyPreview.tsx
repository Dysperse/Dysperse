import { useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Pressable, View } from "react-native";
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
  const backgroundColors = [
    (isDark ? colors?.darkVibrant : colors?.lightVibrant) || theme[2],
    (isDark ? colors?.darkMuted : colors?.lightMuted) || theme[5],
  ];

  return (
    <Pressable>
      {({ pressed, hovered }) => (
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{
            x: 1,
            y: 1,
          }}
          colors={backgroundColors}
          style={{
            borderRadius: 20,
            gap: 20,
            opacity: pressed ? 0.8 : hovered ? 0.9 : 1,
            alignItems: "center",
            flexDirection: "row",
            padding: 17,
            backgroundColor: theme[3],
          }}
        >
          <Image
            source={{ uri: data.item.album.images[0].url }}
            style={{ width: 60, height: 60, borderRadius: 3 }}
          />
          <View
            style={{
              flex: 1,
            }}
          >
            <View
              style={{
                overflow: "hidden",
                borderRadius: 5,
                width: "100%",
                height: 4,
                marginTop: 7,
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)",
              }}
            >
              <Animated.View
                style={[
                  {
                    height: "100%",
                    borderRadius: 5,
                    backgroundColor: isDark ? "#fff" : "#000",
                  },
                  animatedStyle,
                ]}
              />
            </View>
          </View>
        </LinearGradient>
      )}
    </Pressable>
  );
};

