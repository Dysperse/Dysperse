import { useSpeechRecognitionEvent } from "expo-speech-recognition";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const Bar = ({ sharedValue }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    height: `${sharedValue.value * 100}%`,
  }));
  return <Animated.View style={[styles.bar, animatedStyle]} />;
};

const VolumeBars = () => {
  const [volume, setVolume] = useState(0);
  const barValues = [
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
  ];

  useSpeechRecognitionEvent("volumechange", (event) => {
    const vol = Math.max(event.value ?? 0, 0);
    setVolume(vol);
  });

  useEffect(() => {
    const normalized = Math.min(volume / 2, 1);
    barValues.forEach((barValue) => {
      const randomFactor = 0.6 + Math.random() * 0.4;
      barValue.value = withTiming(normalized * randomFactor, { duration: 200 });
    });
  }, [volume]);

  return (
    <View style={styles.container}>
      {barValues.map((barValue, idx) => (
        <Bar key={idx} sharedValue={barValue} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    width: "100%",
    gap: 2,
    transform: [{ translateX: -1.5 }, { translateY: 3 }],
    justifyContent: "space-between",
  },
  bar: {
    width: 4,
    backgroundColor: "#fff",
    minHeight: 5,
    borderRadius: 4,
  },
});

export default VolumeBars;
