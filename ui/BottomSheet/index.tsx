import { useHotkeys } from "@/helpers/useHotKeys";
import {
  BottomSheetModal,
  BottomSheetProps,
  useBottomSheet,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { RefObject, memo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useColorTheme } from "../color/theme-provider";
import { BottomSheetBackHandler } from "./BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "./BottomSheetBackdropComponent";
export interface DBottomSheetProps extends BottomSheetProps {
  sheetRef: RefObject<BottomSheetModal>;
  onClose: () => void;
  maxWidth?: number | string;
  stackBehavior?: "replace" | "push";
  appearsOnIndex?: number;
  dismissible?: boolean;
  disableBackToClose?: boolean;
  disableEscapeToClose?: boolean;
  disableBackdropPressToClose?: boolean;
  maxBackdropOpacity?: number;
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

function BottomSheetEscapeHandler({ animationConfigs }) {
  const { forceClose, animatedIndex } = useBottomSheet();

  useHotkeys(
    "esc",
    () => {
      console.log(animatedIndex.value);
      if (animatedIndex.value === -1) return;
      forceClose(animationConfigs || { overshootClamping: true, damping: 1 });
    },
    {
      enableOnFormTags: true,
      enableOnContentEditable: true,
    }
  );
  return null;
}

function BottomSheet(props: DBottomSheetProps) {
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
          maxBackdropOpacity={props.maxBackdropOpacity ?? 0.5}
          dismissible={
            props.disableBackdropPressToClose !== true && props.dismissible
          }
        />
      )}
      onChange={(e) => {
        if (e === -1) props.onClose();
      }}
      containerStyle={[
        styles.container,
        { maxWidth: props.maxWidth || 500 } as any,
      ]}
      backgroundStyle={[styles.background, { backgroundColor: theme[2] }]}
      handleIndicatorStyle={{ backgroundColor: theme[5], width: 50 }}
      {...props}
    >
      <View aria-modal style={{ flex: 1 }}>
        {props.disableBackToClose !== true && Platform.OS !== "web" && (
          <BottomSheetBackHandler />
        )}
        {Platform.OS === "web" && props.disableEscapeToClose !== true && (
          <BottomSheetEscapeHandler animationConfigs={props.animationConfigs} />
        )}
        {/* {Platform.OS !== "web" && <BottomSheetKeyboardHandler />} */}
        {props.children}
      </View>
    </BottomSheetModal>
  );
}

export default memo(BottomSheet);
