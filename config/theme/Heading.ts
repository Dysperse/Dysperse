import { createStyle } from "@gluestack-style/react";
import { H1, H2, H3, H4, H5, H6 } from "@expo/html-elements";

export const Heading = createStyle({
  color: "$textLight900",
  letterSpacing: "$sm",
  fontWeight: "$bold",
  fontFamily: "$heading",

  // Overrides expo-html default styling
  marginVertical: 0,

  variants: {
    title: {
      true: {
        props: {
          fontSize: "$title",
          textShadowRadius: 20,
          textShadowOffset: { width: 0, height: 0 },
        },
      },
    },
    eyebrow: {
      true: {
        props: {
          textTransform: "uppercase",
          fontSize: "$xs",
          opacity: 0.6,
        },
      },
    },
    isTruncated: {
      true: {
        props: {
          // @ts-ignore
          numberOfLines: 1,
          ellipsizeMode: "tail",
        },
      },
    },
    bold: {
      true: {
        fontWeight: "$bold",
      },
    },
    underline: {
      true: {
        textDecorationLine: "underline",
      },
    },
    strikeThrough: {
      true: {
        textDecorationLine: "line-through",
      },
    },
    sub: {
      true: {
        fontSize: "$xs",
        lineHeight: "$xs",
      },
    },
    italic: {
      true: {
        fontStyle: "italic",
      },
    },
    highlight: {
      true: {
        bg: "$yellow500",
      },
    },
    size: {
      "2xl": {
        //@ts-ignore
        props: { as: H2 },
        fontSize: "$3xl",
        lineHeight: "$3xl",
      },

      xl: {
        //@ts-ignore
        props: { as: H3 },
        fontSize: "$xl",
        lineHeight: "$2xl",
      },

      lg: {
        //@ts-ignore
        props: { as: H4 },
        fontSize: "$lg",
        lineHeight: "$lg",
      },

      md: {
        //@ts-ignore
        props: { as: H5 },
        fontSize: "$md",
        lineHeight: "$md",
      },

      sm: {
        //@ts-ignore
        props: { as: H6 },
        fontSize: "$sm",
        lineHeight: "$sm",
      },

      xs: {
        //@ts-ignore
        props: { as: H6 },
        fontSize: "$xs",
        lineHeight: "$xs",
      },
    },
  },

  defaultProps: {
    size: "lg",
  },
});
