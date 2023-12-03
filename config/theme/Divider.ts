import { createStyle } from "@gluestack-style/react";

export const Divider = createStyle({
  bg: "$primary9",
  variants: {
    orientation: {
      vertical: {
        width: 1,
        height: "$full",
      },
      horizontal: {
        height: 1,
        width: "$full",
      },
    },
  },
  defaultProps: {
    orientation: "horizontal",
  },
});
