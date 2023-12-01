import { createStyle } from "@gluestack-style/react";

export const Pressable = createStyle({
  _web: {
    ":focusVisible": {
      outlineWidth: "2px",
      outlineColor: "$primary7",
      outlineStyle: "solid",
      _dark: {
        outlineColor: "$primary3",
      },
    },
  },
});
