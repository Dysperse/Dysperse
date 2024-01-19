import { useKeyboardShortcut } from "@/helpers/useKeyboardShortcut";
import {
  BottomSheetModal,
  BottomSheetProps,
  useBottomSheet,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { RefObject, memo } from "react";
import { Platform, StyleSheet } from "react-native";
import { useColorTheme } from "../color/theme-provider";
import { BottomSheetBackHandler } from "./BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "./BottomSheetBackdropComponent";
export interface DBottomSheetProps extends BottomSheetProps {
  sheetRef: RefObject<BottomSheetModal>;
  onClose: () => void;
  maxWidth?: number;
  stackBehavior?: "replace" | "push";
  appearsOnIndex?: number;
  dismissible?: boolean;
  disableBackToClose?: boolean;
  disableEscapeToClose?: boolean;
  disableBackdropPressToClose?: boolean;
}

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  container: {
    marginHorizontal: "auto",
  },
});

function BottomSheetEscapeHandler() {
  const { forceClose } = useBottomSheet();
  useKeyboardShortcut(["esc"], () =>
    forceClose({ overshootClamping: true, damping: 1 })
  );
  return null;
}

const BottomSheet = memo(function BottomSheet(props: DBottomSheetProps) {
  const theme = useColorTheme();

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 30,
    overshootClamping: false,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 400,
  });

  return (
    <BottomSheetModal
      keyboardBlurBehavior="restore"
      animationConfigs={animationConfigs}
      stackBehavior="push"
      ref={props.sheetRef}
      backdropComponent={(d) => (
        <BottomSheetBackdropComponent
          {...d}
          dismissible={
            props.disableBackdropPressToClose !== true && props.dismissible
          }
        />
      )}
      onChange={(e) => {
        if (e === -1) props.onClose();
      }}
      containerStyle={[styles.container, { maxWidth: props.maxWidth || 500 }]}
      backgroundStyle={[styles.background, { backgroundColor: theme[2] }]}
      handleIndicatorStyle={{ backgroundColor: theme[5] }}
      {...props}
    >
      {props.disableBackToClose !== true && Platform.OS !== "web" && (
        <BottomSheetBackHandler />
      )}
      {Platform.OS === "web" && props.disableEscapeToClose !== true && (
        <BottomSheetEscapeHandler handleClose={props.onClose} />
      )}
      {/* {Platform.OS !== "web" && <BottomSheetKeyboardHandler />} */}
      {props.children}
    </BottomSheetModal>
  );
});

export default BottomSheet;
