import { BottomSheetModal, useBottomSheet } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import React, { cloneElement, ReactNode, RefObject, useRef } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import BottomSheet from "../BottomSheet";
import { Button, DButtonProps } from "../Button";
import { addHslAlpha, useDarkMode } from "../color";
import { useColorTheme } from "../color/theme-provider";

export function DropdownMenuItem(props) {
  const theme = useColorTheme();
  const menu = useBottomSheet();

  return (
    <Button
      backgroundColors={{
        default: addHslAlpha(theme[9], 0),
        pressed: addHslAlpha(theme[9], 0.1),
        hovered: addHslAlpha(theme[9], 0.2),
      }}
      height={45}
      icon={props.icon}
      text={props.text}
      containerStyle={[{ borderRadius: 20 }, props.containerStyle]}
      style={[
        {
          zIndex: 2,
          justifyContent: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 15,
          paddingVertical: 10,
          gap: 13,
        },
        props.disabled && { opacity: 0.5 },
        props.style as StyleProp<ViewStyle>,
      ]}
      {...props}
      onPress={(...e) => {
        props.onPress?.(...e);
        if (props.closeOnSelect) menu.forceClose({ duration: 0 });
      }}
    />
  );
}

export default function DropdownMenu({
  ref,
  children,
  options,
  menuWidth = 175,
  verticalPlacement = "bottom",
  horizontalPlacement = "left",
  horizontalOffset = 0,
  verticalOffset = 5,
  closeOnSelect = true,
  containerStyle,
  scrollable = false,
}: {
  ref?: RefObject<BottomSheetModal>;
  children: any;
  options: (DButtonProps | { renderer: () => ReactNode })[];
  menuWidth?: number;
  verticalPlacement?: "top" | "bottom";
  horizontalPlacement?: "left" | "center" | "right";
  horizontalOffset?: number;
  verticalOffset?: number;
  closeOnSelect?: boolean;
  containerStyle?: ViewStyle;
  scrollable?: boolean;
}) {
  const INITIAL_SCALE_VALUE = 0;
  const triggerRef = useRef(null);
  const theme = useColorTheme();
  const top = useSharedValue(0);
  const left = useSharedValue(0);
  const isDark = useDarkMode();
  const scale = useSharedValue(INITIAL_SCALE_VALUE);

  const _modalRef = useRef<BottomSheetModal>(null);
  const modalRef = ref || _modalRef;

  const trigger = cloneElement(children, {
    ref: triggerRef,
    onPress: () => {
      modalRef.current.present();
      scale.value = 1;
    },
    onLongPress: () => {
      modalRef.current.present();
      scale.value = 1;
    },
    [Platform.OS === "web" ? "onMouseDown" : "onTouchStart"]: (e) => {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        top.value = y + height + verticalOffset;

        // const windowWidth = Dimensions.get("window").width;
        // if (horizontalPlacement !== "center") {
        //   if (x + menuWidth > windowWidth) {
        //     horizontalPlacement = "right";
        //     horizontalPlacementValue.value = "right";
        //   } else {
        //     horizontalPlacement = "left";
        //     horizontalPlacementValue.value = "left";
        //   }
        // }

        switch (horizontalPlacement) {
          case "left":
            left.value = x + horizontalOffset;
            break;
          case "center":
            left.value = x + width / 2 - menuWidth / 2 + horizontalOffset;
            break;
          case "right":
            left.value = x + width - menuWidth + horizontalOffset;
            break;
        }

        if (verticalPlacement === "top") {
          //   const t = Keyboard.isVisible() ? Keyboard.metrics().height : 0;
          // top is now the top of the trigger
          top.value = Dimensions.get("window").height - y + verticalOffset;
        }
      });
    },
  });

  const positionStyle = useAnimatedStyle(() => ({
    [verticalPlacement === "top" ? "bottom" : "top"]: top.value,
    left: left.value,
    transform: [
      {
        scale:
          scale.value == INITIAL_SCALE_VALUE
            ? INITIAL_SCALE_VALUE
            : withSpring(scale.value, {
                stiffness: 400,
                damping: 40,
              }),
      },
    ],
  }));

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={modalRef}
        snapPoints={["100%"]}
        handleComponent={() => null}
        containerStyle={{ backgroundColor: "transparent" }}
        backgroundStyle={{ backgroundColor: "transparent" }}
        animationConfigs={{ duration: 0.001, overshootClamping: true }}
        enablePanDownToClose={false}
        enableContentPanningGesture={false}
        maxBackdropOpacity={0}
        onClose={() => (scale.value = INITIAL_SCALE_VALUE)}
      >
        <Pressable
          onPress={() => {
            modalRef.current.forceClose({ duration: 0.0001 });
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <AnimatedPressable
            style={[
              positionStyle,
              {
                width: menuWidth,
                position: "absolute",
                backgroundColor: addHslAlpha(theme[11], 0.1),
                borderRadius: 20,
                overflow: "hidden",
                transformOrigin: `${
                  verticalPlacement === "top" ? "bottom" : "top"
                } ${horizontalPlacement}`,
                boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)`,
              },
              containerStyle,
            ]}
          >
            <BlurView intensity={35} tint="light">
              <ScrollView
                scrollEnabled={scrollable}
                bounces={scrollable}
                indicatorStyle={isDark ? "white" : "black"}
                style={{ padding: 5 }}
              >
                {options
                  .filter(Boolean)
                  .map((item, index) =>
                    item.renderer ? (
                      item.renderer()
                    ) : (
                      <DropdownMenuItem
                        key={index}
                        closeOnSelect={closeOnSelect}
                        {...item}
                      />
                    )
                  )}
              </ScrollView>
            </BlurView>
          </AnimatedPressable>
        </Pressable>
      </BottomSheet>
    </>
  );
}
