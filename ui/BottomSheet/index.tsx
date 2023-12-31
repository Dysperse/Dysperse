import {
  BottomSheetModal,
  BottomSheetProps,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { Ref, memo } from "react";
import { Platform } from "react-native";
import { useColorTheme } from "../color/theme-provider";
import { BottomSheetBackHandler } from "./BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "./BottomSheetBackdropComponent";
import { BottomSheetEscapeHandler } from "./BottomSheetEscapeHandler";

interface DBottomSheetProps extends BottomSheetProps {
  sheetRef: Ref<BottomSheetModal>;
  onClose: () => void;
  maxWidth?: number;
  stackBehavior?: "replace" | "push";
  appearsOnIndex?: number;
  dismissible?: boolean;
  disableBackHandler?: boolean;
  disableEscapeHandler?: boolean;
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
        <BottomSheetBackdropComponent {...d} dismissible={props.dismissible} />
      )}
      onChange={(e) => {
        if (e === -1) props.onClose();
      }}
      backgroundStyle={{
        backgroundColor: theme[2],
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
      }}
      handleIndicatorStyle={{ backgroundColor: theme[5] }}
      containerStyle={{
        maxWidth: props.maxWidth || 600,
        marginHorizontal: "auto",
      }}
      {...props}
    >
      {props.disableBackHandler !== true && <BottomSheetBackHandler />}
      {Platform.OS === "web" && props.disableEscapeHandler !== true && (
        <BottomSheetEscapeHandler handleClose={props.onClose} />
      )}
      {/* {Platform.OS !== "web" && <BottomSheetKeyboardHandler />} */}
      {props.children}
    </BottomSheetModal>
  );
});

export default BottomSheet;
