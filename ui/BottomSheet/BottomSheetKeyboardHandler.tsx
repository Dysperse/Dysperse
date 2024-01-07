import { useBottomSheetInternal } from "@gorhom/bottom-sheet";
import { forwardRef, memo, useEffect } from "react";
import { Keyboard, Platform } from "react-native";

const BottomSheetTextInputComponent = forwardRef(() => {
  //#region hooks
  const {
    shouldHandleKeyboardEvents,
    animatedKeyboardHeight,
    animatedKeyboardState,
  } = useBottomSheetInternal();

  useEffect(() => {
    const resetKeyboard = () => {
      if (!shouldHandleKeyboardEvents) return;
      shouldHandleKeyboardEvents.value = false;
      animatedKeyboardHeight.value = 0;
      animatedKeyboardState.value = 0;
    };
    const handleKeyboardShow = () => {
      if (Platform.OS !== "web" && Keyboard.isVisible()) {
        animatedKeyboardHeight.value = Keyboard.metrics().height;
        shouldHandleKeyboardEvents.value = true;
        animatedKeyboardState.value = 1;
      }
    };
    Keyboard.addListener("keyboardDidHide", resetKeyboard);
    Keyboard.addListener("keyboardDidShow", handleKeyboardShow);
    handleKeyboardShow();
    return () => {
      resetKeyboard();
    };
  }, [
    shouldHandleKeyboardEvents,
    animatedKeyboardHeight,
    animatedKeyboardState,
  ]);
  //#endregion
  return null;
});

const BottomSheetKeyboardHandler = memo(BottomSheetTextInputComponent);
export default BottomSheetKeyboardHandler;
