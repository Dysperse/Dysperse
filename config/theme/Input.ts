import { createStyle } from "@gluestack-style/react";

export const Input = createStyle({
  borderWidth: 2,
  borderColor: "$primary6",
  borderRadius: 14,
  flexDirection: "row",
  overflow: "hidden",
  alignContent: "center",
  maxHeight: 56,
  minHeight: 56,
  height: 56,
  ":hover": {
    borderColor: "$primary7",
  },

  ":focus": {
    borderColor: "$primary7",
    ":hover": {
      borderColor: "$primary7",
    },
  },

  ":disabled": {
    opacity: 0.4,
    ":hover": {
      borderColor: "$backgroundLight300",
    },
  },

  _input: {
    height: 56,
    px: 16,
    fontFamily: "body_500",
    color: "$primary12",
  },

  _icon: {
    color: "$primary1",
  },

  variants: {
    size: {
      xl: {
        h: "$12",
        _input: {
          props: {
            size: "xl",
          },
        },
        _icon: {
          props: {
            size: "xl",
          },
        },
      },
      lg: {
        h: "$11",
        _input: {
          props: {
            size: "lg",
          },
        },
        _icon: {
          props: {
            size: "lg",
          },
        },
      },
      md: {
        h: "$10",
        _input: {
          props: {
            size: "md",
          },
        },
        _icon: {
          props: {
            size: "sm",
          },
        },
      },
      sm: {
        h: "$9",
        _input: {
          props: {
            size: "sm",
          },
        },
        _icon: {
          props: {
            size: "xs",
          },
        },
      },
    },
    variant: {
      outline: {
        _input: {
          _web: {
            outlineWidth: 0,
            outline: "none",
          },
        },
        ":focus": {
          borderColor: "$primary11",
          _web: {
            boxShadow: "inset 0 0 0 1px $primary11",
          },
        },
      },

      filled: {
        backgroundColor: "$primary3",
        borderColor: "$primary5",
        _input: {
          _web: {
            outlineWidth: 0,
            outline: "none",
          },
        },
        ":focus": {
          borderColor: "$primary7",
          backgroundColor: "$primary4",
          _web: {
            boxShadow: "inset 0 0 0 1px $primary7",
          },
        },
      },
    },
  },

  defaultProps: {
    size: "md",
    variant: "outline",
  },
});
