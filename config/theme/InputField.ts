import { createStyle } from "@gluestack-style/react";

export const InputField = createStyle({
  flex: 1,
  height: 56,
  color: "$primary12",
  props: {
    placeholderTextColor: "$primary7",
  },
  _web: {
    cursor: "text",
    ":disabled": {
      cursor: "not-allowed",
    },
  },
  // variants: {}
});
