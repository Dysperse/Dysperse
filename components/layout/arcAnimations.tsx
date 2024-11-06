import {
  StackCardInterpolatedStyle,
  StackCardInterpolationProps,
  TransitionPresets,
} from "@react-navigation/stack";
import { Animated } from "react-native";

const { add, multiply } = Animated;

function conditional(
  condition: Animated.AnimatedInterpolation<0 | 1>,
  main: Animated.AnimatedInterpolation<number>,
  fallback: Animated.AnimatedInterpolation<number>
) {
  // To implement this behavior, we multiply the main node with the condition.
  // So if condition is 0, result will be 0, and if condition is 1, result will be main node.
  // Then we multiple reverse of the condition (0 if condition is 1) with the fallback.
  // So if condition is 0, result will be fallback node, and if condition is 1, result will be 0,
  // This way, one of them will always be 0, and other one will be the value we need.
  // In the end we add them both together, 0 + value we need = value we need
  return add(
    multiply(condition, main),
    multiply(
      condition.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
      }),
      fallback
    )
  );
}

export function arcAnimation({
  current,
  next,
  closing,
}: StackCardInterpolationProps): StackCardInterpolatedStyle {
  const progress = add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      // extrapolate: "clamp",
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          // extrapolate: "clamp",
        })
      : 0
  );

  const opacity = progress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1, 0.5],
  });

  const scale = conditional(
    closing,
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      // extrapolate: "clamp",
    }),
    progress.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [0, 1, 0.97],
    })
  );

  return {
    cardStyle: {
      opacity,
      transform: [{ scale }],
    },
  };
}

export const arcAnimationSpec = {
  open: {
    animation: "spring",
    config: {
      stiffness: 200,
      damping: 40,
      overshootClamping: true,
    },
  },
  close: {
    animation: "spring",
    config: {
      stiffness: 200,
      damping: 40,
      overshootClamping: true,
    },
  },
} as any;

export const arcCard = ({ theme, breakpoints, maxWidth, padding = 15 }) =>
  ({
    presentation: "modal",
    detachPreviousScreen: false,
    freezeOnBlur: true,
    animationEnabled: true,
    gestureEnabled: false,
    ...TransitionPresets.ModalPresentationIOS,
    ...(breakpoints.md && {
      cardStyleInterpolator: arcAnimation,
      transitionSpec: arcAnimationSpec,
    }),
    cardStyle: breakpoints.md
      ? {
          maxWidth,
          width: "100%",
          marginHorizontal: "auto",
          marginVertical: padding,
          borderRadius: 25,
          borderWidth: 2,
          borderColor: theme[5],
        }
      : undefined,
  } as any);
