import { HotkeyCallback, Keys } from "react-hotkeys-hook";
import { OptionsOrDependencyArray } from "react-hotkeys-hook/dist/types";
import { Dimensions, Platform } from "react-native";

/**
 * Works on web only
 */
export const useHotkeys: (
  keys: Keys,
  callback: HotkeyCallback,
  options?: OptionsOrDependencyArray,
  dependencies?: OptionsOrDependencyArray
) => any =
  Platform.OS === "web" &&
  !(
    // for chrome extension
    (
      Dimensions.get("window").width === 400 &&
      Dimensions.get("window").height === 400
    )
  )
    ? // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("react-hotkeys-hook").useHotkeys
    : () => {};

