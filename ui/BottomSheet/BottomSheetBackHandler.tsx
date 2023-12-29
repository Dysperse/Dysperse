import { useBottomSheet } from "@gorhom/bottom-sheet";
import { useEffect } from "react";
import { BackHandler } from "react-native";

export function BottomSheetBackHandler() {
  const { animatedIndex, close } = useBottomSheet();

  useEffect(() => {
    if (animatedIndex)
      BackHandler.addEventListener("hardwareBackPress", () => {
        if (animatedIndex.value !== -1) {
          close();
          return true;
        } else {
          return false;
        }
      });
  }, [animatedIndex, close]);

  return null;
}
