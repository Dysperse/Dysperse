import {
  BottomSheetModal,
  BottomSheetProps,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { BottomSheetBackHandler } from "./BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "./BottomSheetBackdropComponent";
import { useColorTheme } from "../color/theme-provider";
import { Ref } from "react";
import { BottomSheetEscapeHandler } from "./BottomSheetEscapeHandler";
import { Platform } from "react-native";

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

export default function BottomSheet(props: DBottomSheetProps) {
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
        console.log(e);
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
      {props.children}
    </BottomSheetModal>
  );
}
