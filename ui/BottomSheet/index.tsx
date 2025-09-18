import { useModalStack } from "@/context/modal-stack";
import {
  BottomSheetModal,
  BottomSheetProps,
  useBottomSheet,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { RefObject, memo, useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { ColorThemeProvider, useColorTheme } from "../color/theme-provider";
import { BottomSheetBackHandler } from "./BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "./BottomSheetBackdropComponent";

export interface DBottomSheetProps extends BottomSheetProps {
  sheetRef: RefObject<BottomSheetModal>;
  onClose?: () => void;
  maxWidth?: number | string;
  stackBehavior?: "replace" | "push";
  appearsOnIndex?: number;
  dismissible?: boolean;
  disableBackToClose?: boolean;
  disableEscapeToClose?: boolean;
  disableBackdropPressToClose?: boolean;
  maxBackdropOpacity?: number;
  keyboardControllerBehavior?: any;
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

function BottomSheetEscapeHandler({
  animationConfigs,
}: {
  animationConfigs: any;
}) {
  const { forceClose } = useBottomSheet();
  const { stack } = useModalStack();

  useEffect(() => {
    stack.current = [
      ...stack.current,
      () => {
        forceClose({
          overshootClamping: true,
          stiffness: 400,
          damping: 20,
          ...animationConfigs,
        });
      },
    ];

    return () => {
      stack.current = stack.current.slice(0, -1);
    };
  }, [forceClose, stack, animationConfigs]);

  return null;
}

function BottomSheet(props: DBottomSheetProps) {
  const theme = useColorTheme();
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 125,
    overshootClamping: false,
    stiffness: 1500,
  });

  return (
    <BottomSheetModal
      animationConfigs={animationConfigs}
      stackBehavior="push"
      enableDynamicSizing={false}
      ref={props.sheetRef}
      backdropComponent={(d) => (
        <BottomSheetBackdropComponent
          {...d}
          maxBackdropOpacity={props.maxBackdropOpacity ?? 0.1}
          dismissible={
            props.disableBackdropPressToClose !== true && props.dismissible
          }
        />
      )}
      onChange={(e) => {
        if (e === -1) props.onClose?.();
      }}
      containerStyle={[
        styles.container,
        {
          maxWidth: props.maxWidth || 500,
          marginLeft: "50%",
          width: "100%",
          transform: [{ translateX: "-50%" }],
        } as any,
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
          <KeyboardAvoidingView
            behavior={props.keyboardControllerBehavior || "padding"}
            style={Platform.OS === "web" && { flex: 1 }}
          >
            {props.disableBackToClose !== true && Platform.OS === "android" && (
              <BottomSheetBackHandler />
            )}
            {Platform.OS === "web" && props.disableEscapeToClose !== true && (
              <BottomSheetEscapeHandler
                animationConfigs={props.animationConfigs}
              />
            )}
            {props.children}
          </KeyboardAvoidingView>
        </View>
      </ColorThemeProvider>
    </BottomSheetModal>
  );
}

export default memo(BottomSheet);

