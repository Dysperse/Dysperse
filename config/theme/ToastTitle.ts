import { createStyle } from "@gluestack-style/react";

export const ToastTitle = createStyle({
  fontWeight: "$medium",
  props: {
    size: "md",
  },
  color: "$primary12",
  _dark: {
    color: "$textDark50",
  },
});
