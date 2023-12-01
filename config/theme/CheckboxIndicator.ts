import { createStyle } from "@gluestack-style/react";

export const CheckboxIndicator = createStyle({
  justifyContent: "center",
  alignItems: "center",
  borderColor: "$borderLight400",
  bg: "$transparent",
  borderRadius: 4,

  _web: {
    ":focusVisible": {
      outlineWidth: "2px",
      outlineColor: "$primary7",
      outlineStyle: "solid",
      _dark: {
        outlineColor: "$primary3",
      },
    },
  },

  ":checked": {
    borderColor: "$primary6",
    bg: "$primary6",
  },

  ":hover": {
    borderColor: "$borderLight500",
    bg: "transparent",
    ":invalid": {
      borderColor: "$error700",
    },
    ":checked": {
      bg: "$primary7",
      borderColor: "$primary7",
      ":disabled": {
        borderColor: "$primary6",
        bg: "$primary6",
        opacity: 0.4,
        ":invalid": {
          borderColor: "$error700",
        },
      },
    },
    ":disabled": {
      borderColor: "$borderLight400",
      ":invalid": {
        borderColor: "$error700",
      },
    },
  },

  ":active": {
    ":checked": {
      bg: "$primary8",
      borderColor: "$primary8",
    },
  },
  ":invalid": {
    borderColor: "$error700",
  },
  ":disabled": {
    opacity: 0.4,
  },

  _dark: {
    borderColor: "$borderDark500",
    bg: "$transparent",

    ":checked": {
      borderColor: "$primary5",
      bg: "$primary5",
    },
    ":hover": {
      borderColor: "$borderDark400",
      bg: "transparent",
      ":invalid": {
        borderColor: "$error400",
      },
      ":checked": {
        bg: "$primary4",
        borderColor: "$primary4",
        ":disabled": {
          borderColor: "$primary5",
          bg: "$primary5",
          opacity: 0.4,
          ":invalid": {
            borderColor: "$error400",
          },
        },
      },
      ":disabled": {
        borderColor: "$borderDark500",
        ":invalid": {
          borderColor: "$error400",
        },
      },
    },
    ":active": {
      ":checked": {
        bg: "$primary3",
        borderColor: "$primary3",
      },
    },

    ":invalid": {
      borderColor: "$error400",
    },
    ":disabled": {
      opacity: 0.4,
    },
  },
});
