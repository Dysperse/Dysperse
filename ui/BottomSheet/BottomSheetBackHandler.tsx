import { useBottomSheet } from "@gorhom/bottom-sheet";
import { useEffect } from "react";
import { BackHandler } from "react-native";

export function BottomSheetBackHandler() {
  const { animatedIndex, close } = useBottomSheet();

  useEffect(() => {
    const handleBackPress = () => {
      console.log("back handler triggered", animatedIndex.value);
      if (animatedIndex.value !== -1) {
        close();
        return true;
      } else {
        return false;
      }
    };

    if (animatedIndex)
      BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
    };
  }, [animatedIndex, close]);

  return null;
}
