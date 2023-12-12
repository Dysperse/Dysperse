import { useBottomSheet } from "@gorhom/bottom-sheet";
import { useEffect } from "react";
import { BackHandler, Platform } from "react-native";

export function BottomSheetBackHandler({ handleClose }) {
  const { animatedIndex } = useBottomSheet();

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => {
      if (animatedIndex.value !== -1) {
        handleClose();
        return true;
      } else {
        return false;
      }
    });

    if (Platform.OS === "web") {
      const close = (e) => {
        if (e.key === "Escape") handleClose();
      };
      // Add event listener for the "Esc" key press
      window.addEventListener("keydown", close);

      // Remove event listener on component unmount
      return () => {
        window.removeEventListener("keydown", close);
      };
    }
  }, []);
  return null;
}
