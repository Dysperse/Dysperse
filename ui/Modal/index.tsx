import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef, RefObject } from "react";
import { Pressable, ViewStyle } from "react-native";
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
          <Pressable
            style={{
              backgroundColor: theme[2],
              borderRadius: 25,
              width: props.maxWidth || 500,
              maxWidth: "100%",
            }}
          >
            {props.children}
          </Pressable>
        </Pressable>
      </BottomSheet>
    );
  }
);
