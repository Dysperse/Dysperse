import { createStyle } from "@gluestack-style/react";

export const Button = createStyle({
  borderRadius: "$md",
  backgroundColor: "$primary3",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",

  background: "transparent",
  _text: { color: "$primary11" },
  _icon: { color: "$primary11" },
  _spinner: { props: { color: "$primary11" } },

  variants: {
    action: {
      primary: {
        borderColor: "$transparent",
        borderWidth: "$2",
        ":hover": { bg: "$primary3", borderColor: "$primary3" },
        ":active": { bg: "$primary4", borderColor: "$primary4" },
      },
    },

    variant: {
      outlined: {
        bg: "transparent",
        borderColor: "$primary6",
        borderWidth: "$2",
        ":hover": { bg: "$primary3" },
        ":active": { bg: "$primary4" },
      },
      filled: {
        bg: "$primary3",
        ":hover": { bg: "$primary4" },
        ":active": { bg: "$primary5" },
      },
    },

    size: {
      xs: {
        px: "$3.5",
        h: "$8",
        _icon: {
          props: { size: "2xs" },
        },
        _text: {
          props: { size: "xs" },
        },
      },
      sm: {
        px: "$4",
        h: "$9",
        _icon: {
          props: {
            size: "sm",
          },
        },
        _text: {
          props: {
            size: "sm",
          },
        },
      },
      md: {
        px: "$5",
        h: "$10",
        _icon: { props: { size: "md" } },
        _text: { props: { size: "md" } },
      },
      lg: {
        px: "$6",
        h: "$11",
        _icon: { props: { size: "md" } },
        _text: { props: { size: "lg" } },
      },
      xl: {
        px: "$7",
        h: "$12",
        _icon: { props: { size: "lg" } },
        _text: { props: { size: "xl" } },
      },
    },
  },

  props: {
    size: "md",
    variant: "solid",
    action: "primary",
  },

  _web: {
    ":focusVisible": {
      outlineWidth: "$0.5",
      outlineColor: "$primary7",
      outlineStyle: "solid",
    },
  },

  ":disabled": {
    opacity: 0.4,
  },
});
