import { createStyle } from "@gluestack-style/react";

export const Text = createStyle({
  color: "$primary12",
  fontWeight: "$normal",
  fontFamily: "$body",
  fontStyle: "normal",
  letterSpacing: "$bodyMedium",

  variants: {
    isTruncated: {
      true: {
        props: {
          // @ts-ignore
          numberOfLines: 1,
          ellipsizeMode: "tail",
        },
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
        fontSize: "$bodySmall",
        // lineHeight: "$xs",
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
      md: {
        fontSize: "$bodyMedium",
        lineHeight: "$bodyMedium",
      },
    },
  },

  defaultProps: {
    size: "md",
  },
});
