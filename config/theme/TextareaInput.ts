import { createStyle } from "@gluestack-style/react";

export const TextareaInput = createStyle({
  p: "$2",
  color: "$primary12",
  textAlignVertical: "top",
  flex: 1,
  props: {
    // @ts-ignore
    multiline: true,
    placeholderTextColor: "$primary12",
  },
  _web: {
    cursor: "text",
    ":disabled": {
      cursor: "not-allowed",
    },
  },
});
