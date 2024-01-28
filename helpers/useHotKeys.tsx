import { HotkeyCallback, Keys } from "react-hotkeys-hook";
import { OptionsOrDependencyArray } from "react-hotkeys-hook/dist/types";
import { Platform } from "react-native";

/**
 * Works on web only
 */
export const useHotkeys: (
  keys: Keys,
  callback: HotkeyCallback,
  options?: OptionsOrDependencyArray,
  dependencies?: OptionsOrDependencyArray
) => any =
  Platform.OS === "web" ? require("react-hotkeys-hook").useHotkeys : () => {};
