import { createStyle } from "@gluestack-style/react";

export const Link = createStyle({
  _web: {
    outlineWidth: 0,
    ":disabled": {
      cursor: "not-allowed",
    },
    ":focusVisible": {
      outlineWidth: 2,
      outlineColor: "$primary7",
      outlineStyle: "solid",
      _dark: {
        outlineColor: "$primary4",
      },
    },
  },
  _text: {
    ":hover": {
      color: "$info600",
      textDecorationLine: "none",
    },
    ":active": {
      color: "$info700",
    },
    ":disabled": {
      opacity: 0.4,
    },
    _dark: {
      ":hover": {
        color: "$info400",
      },
      ":active": {
        color: "$info300",
      },
    },
  },
});
