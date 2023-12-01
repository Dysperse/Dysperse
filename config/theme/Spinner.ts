import { createStyle } from "@gluestack-style/react";

export const Spinner = createStyle({
  props: {
    color: "$primary5",
  },
  _dark: {
    props: {
      color: "$primary4",
    },
  },
});
