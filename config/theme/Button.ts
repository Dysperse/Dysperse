import { createStyle } from "@gluestack-style/react";

export const Button = createStyle({
  height: 40,
  px: 24,
  gap: "$2",
  borderRadius: "$sm",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  background: "transparent",
  _spinner: { props: { color: "$primary11" } },
  _text: { fontFamily: "body_400" },
  variants: {
    // allow iconButton prop
    iconButton: {
      true: {
        height: 40,
        width: 40,
        p: 0,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
        _text: { display: "none" },
      },
    },
    action: {
      primary: {
        borderColor: "$transparent",
        borderWidth: "$2",
        ":hover": { bg: "$primary3", borderColor: "$primary3" },
        ":active": { bg: "$primary4", borderColor: "$primary4" },
      },
    },

    variant: {
      filled: {
        bg: "$primary11",
        _text: { color: "$primary3" },
        ":hover": { bg: "$primary12", borderColor: "$primary12" },
        ":active": { bg: "$primary12", borderColor: "$primary12" },
      },
      tonal: {
        bg: "$primary3",
        _text: { color: "$primary11" },
        ":hover": { bg: "$primary4", borderColor: "$primary4" },
        ":active": { bg: "$primary5", borderColor: "$primary5" },
      },
      outlined: {
        borderWidth: "$2",
        borderColor: "$primary6",
        _text: { color: "$primary11" },
        ":hover": { bg: "$primary3", borderColor: "$primary7" },
        ":active": { bg: "$primary4", borderColor: "$primary8" },
      },
      text: {
        _text: { color: "$primary11" },
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
    bg: "#adadad",
    color: "#fff",
    _web: {
      pointerEvents: "none",
    },
  },
  defaultProps: {
    variant: "text",
  },
});
