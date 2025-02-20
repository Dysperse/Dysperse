import * as Haptics from "expo-haptics";
import React from "react";
import { RefreshControlProps } from "react-native";
import { RefreshControl as RefreshControlComponent } from "react-native-gesture-handler";
import { useColorTheme } from "../color/theme-provider";

export default function RefreshControl(props: RefreshControlProps) {
  const theme = useColorTheme();
  return (
    <RefreshControlComponent
      progressBackgroundColor={theme[5]}
      colors={[theme[9]]}
      tintColor={theme[9]}
      {...props}
      onRefresh={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        props.onRefresh && props.onRefresh();
      }}
    />
  );
}

