import { createStyle } from "@gluestack-style/react";

export const SelectInput = createStyle({
  _web: {
    w: "$full",
  },
  pointerEvents: "none",
  flex: 1,
  h: "$full",
  color: "$primary12",
  props: {
    placeholderTextColor: "$primary12",
  },
});
