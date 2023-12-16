import { useBottomSheet } from "@gorhom/bottom-sheet";
import { useEffect } from "react";
import { BackHandler } from "react-native";
import { ReactNativeKeysKeyCode, useHotkey } from "react-native-hotkeys";

export function BottomSheetBackHandler({ handleClose }) {
  const { animatedIndex } = useBottomSheet();

  useEffect(() => {
    if (animatedIndex)
      BackHandler.addEventListener("hardwareBackPress", () => {
        if (animatedIndex.value !== -1) {
          handleClose();
          return true;
        } else {
          return false;
        }
      });
  }, [animatedIndex]);

  useHotkey(ReactNativeKeysKeyCode.Escape, handleClose);

  return null;
}
