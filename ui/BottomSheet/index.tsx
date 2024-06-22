import { useModalStack } from "@/context/modal-stack";
import {
  BottomSheetModal,
  BottomSheetProps,
  useBottomSheet,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { RefObject, memo, useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { ColorThemeProvider, useColorTheme } from "../color/theme-provider";
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
  const { forceClose } = useBottomSheet();
  const { stack } = useModalStack();

  useEffect(() => {
    stack.current = [
      ...stack.current,
      () => {
        forceClose({ ...animationConfigs, overshootClamping: true });
      },
    ];
    // console.log("adding", stack.current.length);

    return () => {
      stack.current = stack.current.slice(0, -1);
      // console.log("removing", stack.current.length);
    };
  }, [forceClose, stack, animationConfigs]);
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
      enableDynamicSizing={false}
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
      <ColorThemeProvider theme={theme}>
        <View
          {...(Platform.OS === "web" && { ["aria-modal"]: true })}
          style={{ flex: 1 }}
        >
          {props.disableBackToClose !== true && Platform.OS !== "web" && (
            <BottomSheetBackHandler />
          )}
          {Platform.OS === "web" && props.disableEscapeToClose !== true && (
            <BottomSheetEscapeHandler
              animationConfigs={props.animationConfigs}
            />
          )}
          {props.children}
        </View>
      </ColorThemeProvider>
    </BottomSheetModal>
  );
}

export default memo(BottomSheet);
