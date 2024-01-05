import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import * as NavigationBar from "expo-navigation-bar";
import React, { useCallback, useEffect, useState } from "react";
import { Platform, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Page() {
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [fullScreen, setFullScreen] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);
  const insets = useSafeAreaInsets();
  const toggleFullScreen = useCallback(() => setFullScreen((s) => !s), []);

  useEffect(() => {
    if (Platform.OS === "android")
      NavigationBar.setVisibilityAsync(fullScreen ? "hidden" : "visible");
  }, [fullScreen]);

  return (
    <>
      <IconButton
        onPress={toggleFullScreen}
        variant="filled"
        style={{
          position: "absolute",
          top: 20 + insets.top,
          right: 20,
          zIndex: 999,
        }}
      >
        <Icon>{fullScreen ? "close_fullscreen" : "open_in_full"}</Icon>
      </IconButton>
      <StatusBar hidden={fullScreen} />
      <View
        style={{
          transform: fullScreen ? [{ rotate: "90deg" }, { scale: 1.4 }] : [],
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 43 }} weight={900}>
          {currentTime.format("hh:mm:ss A")}
        </Text>
        <Text style={{ fontSize: 30 }} weight={200}>
          {currentTime.format("MMMM Do, YYYY")}
        </Text>
      </View>
    </>
  );
}
