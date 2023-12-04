import { createStyle } from "@gluestack-style/react";

export const CheckboxLabel = createStyle({
  color: "$primary11",
  ":checked": {
    color: "$primary12",
  },
  ":hover": {
    color: "$primary12",
    ":checked": {
      color: "$primary12",
      ":disabled": {
        color: "$primary12",
      },
    },
    ":disabled": {
      color: "$primary11",
    },
  },
  ":active": {
    color: "$primary12",

    ":checked": {
      color: "$primary12",
    },
  },

  ":disabled": {
    opacity: 0.4,
  },

  _web: {
    MozUserSelect: "none",
    WebkitUserSelect: "none",
    msUserSelect: "none",
  },
  userSelect: "none",
});
