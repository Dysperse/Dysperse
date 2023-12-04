import { createStyle } from "@gluestack-style/react";

export const RadioLabel = createStyle({
  color: "$primary11",
  ":checked": {
    color: "$primary12",
  },
  ":hover": {
    color: "$primary12",
    ":checked": {
      color: "$primary12",
    },
    ":disabled": {
      color: "$primary11",
      ":checked": {
        color: "$primary12",
      },
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
  _dark: {
    color: "$textDark400",
    ":checked": {
      color: "$textDark100",
    },
    ":hover": {
      color: "$textDark100",
      ":checked": {
        color: "$textDark100",
      },
      ":disabled": {
        color: "$textDark400",
        ":checked": {
          color: "$textDark100",
        },
      },
    },
    ":active": {
      color: "$textDark100",
      ":checked": {
        color: "$textDark100",
      },
    },
  },
});
