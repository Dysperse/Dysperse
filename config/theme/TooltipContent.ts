import { createStyle } from "@gluestack-style/react";

export const TooltipContent = createStyle({
  ":initial": {
    opacity: 0,
    scale: 0.5,
  },
  ":animate": {
    opacity: 1,
    scale: 1,
  },
  ":exit": {
    opacity: 0,
    scale: 0.5,
  },
  ":transition": {
    type: "spring",
    damping: 18,
    stiffness: 250,
    opacity: {
      type: "timing",
      duration: 250,
    },
  },

  py: "$1",
  px: "$3",
  borderRadius: "$sm",
  bg: "$primary12",

  _text: {
    // fontSize: "$bodySmall",
    color: "$primary12",
  },

  // @ts-ignore
  defaultProps: {
    hardShadow: "2",
  },
});
