import { createStyle } from "@gluestack-style/react";

export const SliderFilledTrack = createStyle({
  bg: "$primary5",
  _dark: {
    bg: "$primary4",
  },
  ":focus": {
    bg: "$primary6",
    _dark: {
      bg: "$primary3",
    },
  },
  ":active": {
    bg: "$primary6",
    _dark: {
      bg: "$primary3",
    },
  },
  ":hover": {
    bg: "$primary6",
    _dark: {
      bg: "$primary3",
    },
  },
});
