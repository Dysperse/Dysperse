import { useEffect } from "react";
import { Platform } from "react-native";

export const useKeyboardShortcut = (keys, callback) => {
  useEffect(() => {
    if (Platform.OS === "web") {
      // Bind the keyboard shortcut using Mousetrap
      window.Mousetrap.bind(keys, (e, combo) => {
        e.preventDefault();
        callback(combo);
      });

      // Cleanup: Unbind the keyboard shortcut when the component is unmounted
      return () => {
        window.Mousetrap.unbind(keys);
      };
    }
  }, [keys, callback]);
};
