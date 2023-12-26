import { useEffect } from "react";
import { Platform } from "react-native";
import * as _NavigationBar from "expo-navigation-bar";

export default function NavigationBar({ color }) {
  useEffect(() => {
    // setImmediate(() => {
    if (Platform.OS === "android") {
      _NavigationBar.setBackgroundColorAsync(color);
      _NavigationBar.setBorderColorAsync(color);
      _NavigationBar.setButtonStyleAsync("light");
    }
    // });
  }, [color]);

  return null;
}
