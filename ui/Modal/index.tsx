import { memo, useCallback, useEffect, useMemo } from "react";
import {
  InteractionManager,
  Keyboard,
  Platform,
  Pressable,
  useWindowDimensions,
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

const Modal = (
  props: Omit<DBottomSheetProps, "onClose"> & {
    maxWidth?: ViewStyle["maxWidth"];
    animation: "NONE" | "SCALE" | "SLIDE" | "BOTH";
    onClose?: () => void;
    innerStyles?: ViewStyle;
    disablePan?: boolean;
    height?: ViewStyle["height"];
    transformCenter?: boolean;
    closeContainerStyles?: ViewStyle;
  }
) => {
  const theme = useColorTheme();
  const state = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const animationConfigs = useMemo(
    () =>
      props.animation === "NONE" || props.animation === "SCALE"
        ? { overshootClamping: true, duration: 0.0001 }
        : {
            overshootClamping: props.animation !== "BOTH",
            stiffness: 400,
            damping: props.animation === "BOTH" ? 35 : 40,
          },
    [props.animation]
  );

  const handleClose = useCallback(() => {
    props.sheetRef.current?.close({
      ...(props.animation === "SCALE"
        ? { duration: 0.0001 }
        : {
            overshootClamping: true,
            damping: 20,
            stiffness: 300,
          }),
    });
    props.onClose?.();
  }, [props]);

  const innerStyles = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale:
            state.value === 0
              ? 0.8
              : withSpring(1, {
                  stiffness: 400,
                  damping: 50,
                }),
        },
      ],
    }),
    []
  );

  const paddingValue = useSharedValue(insets.bottom);
  useEffect(() => {
    Keyboard.addListener("keyboardWillHide", () => {
      paddingValue.value = insets.bottom;
    });
    Keyboard.addListener("keyboardWillShow", () => {
      paddingValue.value = 15;
    });
  }, [insets, paddingValue]);

  const paddingStyle = useAnimatedStyle(() => ({
    paddingBottom: withSpring(paddingValue.value, {
      overshootClamping: true,
      stiffness: 200,
      damping: 20,
    }),
  }));

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  return (
    <BottomSheet
      handleComponent={() => null}
      stackBehavior="push"
      {...props}
      maxWidth={"100%"}
      snapPoints={["100%"]}
      sheetRef={props.sheetRef}
      onClose={handleClose}
      {...((props.animation !== "SCALE" || Platform.OS === "web") && {
        animationConfigs,
      })}
      enablePanDownToClose={
        props.disablePan ? false : props.animation !== "SCALE"
      }
      enableContentPanningGesture={
        props.disablePan ? false : props.animation !== "SCALE"
      }
      backgroundStyle={{ backgroundColor: "transparent" }}
    >
      <SetSharedValue value={state} from={0} to={1} />
      <AnimatedPressable
        style={[
          paddingStyle,
          {
            width: "100%",
            height: "100%",
            padding: 15,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            alignItems: "center",
            justifyContent: "center",
            ...props.closeContainerStyles,
          },
        ]}
        onPress={handleClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: props.maxWidth || 500,
          }}
        >
          <Animated.View
            style={[
              (props.animation === "SCALE" || props.animation === "BOTH") &&
                innerStyles,
              {
                transformOrigin:
                  Platform.OS === "web"
                    ? props.transformCenter
                      ? "center center"
                      : "top center"
                    : ["50%", 0, 0],
                backgroundColor: theme[2],
                borderRadius: 25,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 25, height: 25 },
                shadowOpacity: 0.25,
                shadowRadius: 100,
                height: props.height,
                maxHeight: height - 40,
              },
              props.innerStyles,
            ]}
          >
            {props.children}
          </Animated.View>
          {props.outerContent}
        </Pressable>
      </AnimatedPressable>
    </BottomSheet>
  );
};

export default memo(Modal);

