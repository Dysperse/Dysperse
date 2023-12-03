import { createStyle } from "@gluestack-style/react";

export const ModalContent = createStyle({
  bg: "$primary2",
  rounded: "$md",
  overflow: "hidden",
  ":initial": {
    opacity: 0,
    scale: 0.9,
  },
  ":animate": {
    opacity: 1,
    scale: 1,
  },
  ":exit": {
    opacity: 0,
  },
  ":transition": {
    type: "spring",
    damping: 18,
    stiffness: 200,
    opacity: {
      type: "timing",
      duration: 100,
    },
  },
  // @ts-ignore
  _dark: {
    bg: "$backgroundDark900",
  },

  defaultProps: {
    softShadow: "3",
  },
});
