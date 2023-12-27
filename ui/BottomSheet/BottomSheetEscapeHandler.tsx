import { useBottomSheet } from "@gorhom/bottom-sheet";
import { useEffect } from "react";
import { BackHandler } from "react-native";
import useKeyboardShortcut from "use-keyboard-shortcut";

export function BottomSheetEscapeHandler({ handleClose }) {
  const { animatedIndex, } = useBottomSheet();

  useKeyboardShortcut(["Shift", "H"], () => alert(animatedPosition.value), {
    overrideSystem: false,
    ignoreInputFields: false,
    repeatOnHold: false,
  });

  return null;
}
