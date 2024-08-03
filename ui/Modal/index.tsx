import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef, RefObject, useEffect } from "react";
import {
  InteractionManager,
  Platform,
  Pressable,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, { DBottomSheetProps } from "../BottomSheet";
import { useColorTheme } from "../color/theme-provider";

const SetSharedValue = ({ value, from, to }) => {
  useEffect(() => {
    if (Platform.OS === "web") {
      value.value = to;
    } else {
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          value.value = to;
        }, 0);
      });
    }
    return () => {
      value.value = from;
    };
  }, [to, value, from]);
  return null;
};

export const Modal = forwardRef(
  (
    props: Omit<Omit<DBottomSheetProps, "sheetRef">, "onClose"> & {
      maxWidth?: ViewStyle["maxWidth"];
      animation: "NONE" | "SCALE" | "SLIDE";
      onClose?: () => void;
      innerStyles?: ViewStyle;
      height?: ViewStyle["height"];
    },
    ref: RefObject<BottomSheetModal>
  ) => {
    const theme = useColorTheme();
    const state = useSharedValue(0);
    const insets = useSafeAreaInsets();

    const animationConfigs =
      props.animation === "NONE" || props.animation === "SCALE"
        ? { overshootClamping: true, duration: 0.0001 }
        : {
            overshootClamping: true,
            stiffness: 400,
            damping: 40,
          };

    const handleClose = () => {
      ref.current?.close({
        ...animationConfigs,
        damping: 20,
      });
      props.onClose?.();
    };

    const innerStyles = useAnimatedStyle(() => ({
      transformOrigin: Platform.OS === "web" ? "top center" : ["50%", 0, 0],
      transform: [
        {
          scale:
            state.value === 0
              ? 0.8
              : withSpring(1, {
                  stiffness: 400,
                  damping: 50,
                  // overshootClamping: true,
                }),
        },
      ],
    }));

    return (
      <BottomSheet
        {...props}
        maxWidth={"100%"}
        snapPoints={["100%"]}
        sheetRef={ref}
        onClose={handleClose}
        handleComponent={() => null}
        animateOnMount={
          props.animation === "SLIDE" ||
          props.animation === "NONE" ||
          !props.animation
        }
        {...(props.animation !== "SCALE" && { animationConfigs })}
        stackBehavior="push"
        enablePanDownToClose={props.animation !== "SCALE"}
        enableContentPanningGesture={props.animation !== "SCALE"}
        backgroundStyle={{ backgroundColor: "transparent" }}
      >
        <SetSharedValue value={state} from={0} to={1} />
        <Pressable
          style={{
            width: "100%",
            height: "100%",
            padding: 15,
            paddingTop: insets.top + 15,
            paddingBottom: insets.bottom + 15,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={handleClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: props.maxWidth || 500 }}
          >
            <Animated.View
              style={[
                props.animation === "SCALE" && innerStyles,
                {
                  backgroundColor: theme[2],
                  borderRadius: 25,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 25, height: 25 },
                  shadowOpacity: 0.25,
                  shadowRadius: 100,
                  height: props.height,
                },
                props.innerStyles,
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
