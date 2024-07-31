import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef, RefObject, useEffect } from "react";
import { Pressable, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import BottomSheet, { DBottomSheetProps } from "../BottomSheet";
import { useColorTheme } from "../color/theme-provider";

const SetSharedValue = ({ value, from, to }) => {
  useEffect(() => {
    value.value = to;
    return () => {
      value.value = from;
    };
  }, [to, value]);
  return null;
};

export const Modal = forwardRef(
  (
    props: Omit<Omit<DBottomSheetProps, "sheetRef">, "onClose"> & {
      maxWidth?: ViewStyle["maxWidth"];
      animation: "NONE" | "SCALE" | "SLIDE";
    },
    ref: RefObject<BottomSheetModal>
  ) => {
    const theme = useColorTheme();
    const state = useSharedValue(0);

    const animationConfigs =
      props.animation === "NONE" || props.animation === "SCALE"
        ? { overshootClamping: true, duration: 0.0001 }
        : {
            overshootClamping: true,
            stiffness: 400,
            damping: 40,
          };

    const handleClose = () => ref.current?.close(animationConfigs);

    const innerStyles = useAnimatedStyle(() => ({
      transformOrigin: "top center",
      transform: [
        {
          scale: withSpring(state.value === 0 ? 0.7 : 1, {
            stiffness: 200,
            damping: 30,
            // overshootClamping: true,
          }),
        },
      ],
      // opacity: withSpring(state.value === 0 ? 0 : 1),
    }));

    return (
      <BottomSheet
        {...props}
        maxWidth={"100%"}
        snapPoints={["100%"]}
        sheetRef={ref}
        onClose={handleClose}
        handleComponent={() => null}
        animationConfigs={animationConfigs}
        backgroundStyle={{ backgroundColor: "transparent" }}
      >
        <SetSharedValue value={state} from={0} to={1} />
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
              style={[
                props.animation === "SCALE" && innerStyles,
                {
                  backgroundColor: theme[2],
                  borderRadius: 25,
                  width: props.maxWidth || 500,
                  maxWidth: "100%",
                  shadowColor: "#000",
                  shadowOffset: { width: 25, height: 25 },
                  shadowOpacity: 0.25,
                  shadowRadius: 100,
                  height: props.containerHeight,
                },
              ]}
            >
              {props.children}
            </Animated.View>
          </Pressable>
        </Pressable>
      </BottomSheet>
    );
  }
);
