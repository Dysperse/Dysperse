import { createStyle } from "@gluestack-style/react";

export const SliderThumb = createStyle({
  bg: "$primary5",
  _dark: {
    bg: "$primary4",
  },
  position: "absolute",
  borderRadius: "$full",
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
  ":disabled": {
    bg: "$primary5",
    _dark: {
      bg: "$primary5",
    },
  },
  _web: {
    //@ts-ignore
    cursor: "pointer",
    ":active": {
      outlineWidth: 4,
      outlineStyle: "solid",
      outlineColor: "$primary4",
      _dark: {
        outlineColor: "$primary5",
      },
    },
    ":focus": {
      outlineWidth: 4,
      outlineStyle: "solid",
      outlineColor: "$primary4",
      _dark: {
        outlineColor: "$primary5",
      },
    },
  },
  defaultProps: {
    hardShadow: "1",
  },
});
