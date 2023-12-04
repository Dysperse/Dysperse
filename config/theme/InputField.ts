import { createStyle } from "@gluestack-style/react";

export const InputField = createStyle({
  flex: 1,
  color: "$primary12",
  props: {
    placeholderTextColor: "$primary6",
  },
  _web: {
    cursor: "text",
    ":disabled": {
      cursor: "not-allowed",
    },
  },
  // variants: {}
});
