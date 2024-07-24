import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useFocusPanelContext } from "../../context";

export const SpotifyPreview = ({ data, navigation, mutate }) => {
  const theme = useColorTheme();
  const { panelState, setPanelState, collapseOnBack } = useFocusPanelContext();
  const progress = useSharedValue(data.progress_ms / data.item.duration_ms);

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

  return (
    <ListItemButton
      style={{
        paddingHorizontal: 20,
        borderRadius: 20,
        flexDirection: "row",
        gap: 20,
        alignItems: "center",
        borderWidth: 1,
      }}
      pressableStyle={{
        flexDirection: panelState === "COLLAPSED" ? "column" : "row",
        paddingVertical: 15,
      }}
      variant="filled"
      onPress={() => {
        navigation.push("Spotify");
        setPanelState("OPEN");
        if (panelState === "COLLAPSED") collapseOnBack.current = true;
      }}
    >
      <Image
        source={{ uri: data.item.album.images[0].url }}
        style={{ width: 60, height: 60 }}
      />
      <View
        style={{ flex: 1, width: panelState === "COLLAPSED" ? 60 : undefined }}
      >
        {panelState !== "COLLAPSED" && (
          <ListItemText
            primary={data.item.name}
            secondary={data.item.artists[0].name}
            primaryProps={{ weight: 900 }}
            secondaryProps={{ style: { marginTop: -3, opacity: 0.6 } }}
          />
        )}
        <View
          style={{
            overflow: "hidden",
            borderRadius: 5,
            width: "100%",
            height: 4,
            marginTop: panelState === "COLLAPSED" ? -5 : 5,
            backgroundColor: theme[5],
          }}
        >
          <Animated.View
            style={[
              {
                height: "100%",
                borderRadius: 5,
                backgroundColor: theme[11],
              },
              animatedStyle,
            ]}
          />
        </View>
      </View>
    </ListItemButton>
  );
};
