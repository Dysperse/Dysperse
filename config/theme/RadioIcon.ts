import { createStyle } from "@gluestack-style/react";

export const RadioIcon = createStyle({
  borderRadius: "$full",
  ":checked": {
    color: "$primary6",
    ":hover": {
      color: "$primary7",
      ":disabled": {
        color: "$primary6",
      },
    },
  },
  _dark: {
    ":checked": {
      color: "$primary5",
      ":disabled": {
        color: "$primary5",
      },
      ":hover": {
        ":disabled": {
          color: "$primary5",
        },
        color: "$primary4",
      },
    },
  },
});
