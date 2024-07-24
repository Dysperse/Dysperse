import ListItemText from "@/ui/ListItemText";
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
import { useFocusPanelContext } from "../../context";
import { useImageColors } from "./useImageColors";

export const SpotifyPreview = ({ data, navigation, mutate }) => {
  const theme = useColorTheme();
  const { panelState, setPanelState, collapseOnBack } = useFocusPanelContext();
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
    <Pressable
      onPress={() => {
        navigation.push("Spotify");
        setPanelState("OPEN");
        if (panelState === "COLLAPSED") collapseOnBack.current = true;
      }}
    >
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: panelState === "COLLAPSED" ? 1 : 0, y: 1 }}
        colors={backgroundColors}
        style={{
          paddingHorizontal: 20,
          borderRadius: 20,
          gap: 20,
          alignItems: "center",
          flexDirection: panelState === "COLLAPSED" ? "column" : "row",
          paddingVertical: 15,
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
            width: panelState === "COLLAPSED" ? 60 : undefined,
          }}
        >
          {panelState !== "COLLAPSED" && (
            <ListItemText
              primary={data.item.name}
              secondary={data.item.artists[0].name}
              primaryProps={{
                weight: 900,
                style: { color: isDark ? "#fff" : "#000" },
              }}
              secondaryProps={{
                style: {
                  marginTop: -3,
                  color: isDark ? "#fff" : "#000",
                  opacity: 0.6,
                },
              }}
            />
          )}
          <View
            style={{
              overflow: "hidden",
              borderRadius: 5,
              width: "100%",
              height: 4,
              marginTop: panelState === "COLLAPSED" ? -5 : 5,
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
    </Pressable>
  );
};
