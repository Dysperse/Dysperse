import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef, RefObject } from "react";
import { Pressable, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import BottomSheet, { DBottomSheetProps } from "../BottomSheet";
import { useColorTheme } from "../color/theme-provider";

export const Modal = forwardRef(
  (
    props: Omit<DBottomSheetProps, "sheetRef"> & {
      maxWidth?: ViewStyle["maxWidth"];
    },
    ref: RefObject<BottomSheetModal>
  ) => {
    const theme = useColorTheme();
    const handleClose = () =>
      ref.current?.close({
        overshootClamping: true,
        stiffness: 400,
        damping: 20,
      });

    return (
      <BottomSheet
        {...props}
        maxWidth={"100%"}
        snapPoints={["100%"]}
        sheetRef={ref}
        onClose={handleClose}
        handleComponent={() => null}
        animationConfigs={{
          overshootClamping: true,
          stiffness: 400,
          damping: 40,
        }}
        backgroundStyle={{ backgroundColor: "transparent" }}
      >
        <Pressable
          style={{
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={handleClose}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View
              style={{
                backgroundColor: theme[2],
                borderRadius: 25,
                width: props.maxWidth || 500,
                maxWidth: "100%",
                shadowColor: "#000",
                shadowOffset: { width: 25, height: 25 },
                shadowOpacity: 0.25,
                shadowRadius: 100,
              }}
            >
              {props.children}
            </Animated.View>
          </Pressable>
        </Pressable>
      </BottomSheet>
    );
  }
);
