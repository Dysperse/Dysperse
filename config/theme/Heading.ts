import { createStyle } from "@gluestack-style/react";
import { H1, H2, H3, H4, H5, H6, P } from "@expo/html-elements";

export const Heading = createStyle({
  color: "$textLight900",
  letterSpacing: "$sm",
  fontWeight: "$bold",
  fontFamily: "$body",

  // Overrides expo-html default styling
  marginVertical: 0,

  variants: {
    eyebrow: {
      true: {
        props: {
          textTransform: "uppercase",
          fontSize: "$xs",
          opacity: 0.6,
          fontFamily: "$body700",
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
        lineHeight: "1.3",
      },
    },
    italic: {
      true: {
        fontStyle: "italic",
      },
    },
    size: {
      headlineLarge: {
        //@ts-ignore
        props: { as: H1 },
        fontSize: "$headlineLarge",
        lineHeight: "$headlineLarge",
        letterSpacing: "$headlineLarge",
        fontFamily: "$body400",
      },
      headlineMedium: {
        //@ts-ignore
        props: { as: H1 },
        fontSize: "$headlineMedium",
        lineHeight: "$headlineMedium",
        letterSpacing: "$headlineMedium",
        fontFamily: "$body400",
      },
      headlineSmall: {
        //@ts-ignore
        props: { as: H1 },
        fontSize: "$headlineSmall",
        lineHeight: "$headlineSmall",
        letterSpacing: "$headlineSmall",
        fontFamily: "$body400",
      },
      displayLarge: {
        //@ts-ignore
        props: { as: H1 },
        fontSize: "$displayLarge",
        lineHeight: "$displayLarge",
        letterSpacing: "$displayLarge",
        fontFamily: "$body400",
      },

      displayMedium: {
        //@ts-ignore
        props: { as: H2 },
        fontSize: "$displayMedium",
        lineHeight: "$displayMedium",
        letterSpacing: "$displayMedium",
        fontFamily: "$body400",
      },
      displaySmall: {
        //@ts-ignore
        props: { as: H3 },
        fontSize: "$displaySmall",
        lineHeight: "$displaySmall",
        letterSpacing: "$displaySmall",
        fontFamily: "$body400",
      },
      titlelarge: {
        //@ts-ignore
        props: { as: H4 },
        fontSize: "$titlelarge",
        lineHeight: "$titlelarge",
        letterSpacing: "$titlelarge",
        fontFamily: "$body400",
      },
      titleMedium: {
        //@ts-ignore
        props: { as: H5 },
        fontSize: "$titleMedium",
        lineHeight: "$titleMedium",
        letterSpacing: "$titleMedium",
        fontFamily: "$body500",
      },
      titleSmall: {
        //@ts-ignore
        props: { as: H6 },
        fontSize: "$titleSmall",
        lineHeight: "$titleSmall",
        letterSpacing: "$titleSmall",
        fontFamily: "$body500",
      },
      bodyLarge: {
        //@ts-ignore
        props: { as: P },
        fontSize: "$bodyLarge",
        lineHeight: "$bodyLarge",
        letterSpacing: "$bodyLarge",
        fontFamily: "$body400",
      },
      bodyMedium: {
        //@ts-ignore
        props: { as: P },
        fontSize: "$bodyMedium",
        lineHeight: "$bodyMedium",
        letterSpacing: "$bodyMedium",
        fontFamily: "$body400",
      },
      bodySmall: {
        //@ts-ignore
        props: { as: P },
        fontSize: "$bodySmall",
        lineHeight: "$bodySmall",
        letterSpacing: "$bodySmall",
        fontFamily: "$body400",
      },
      labelLarge: {
        //@ts-ignore
        props: { as: P },
        fontSize: "$labelLarge",
        lineHeight: "$labelLarge",
        letterSpacing: "$labelLarge",
        fontFamily: "$body700",
      },
      labelMedium: {
        //@ts-ignore
        props: { as: P },
        fontSize: "$labelMedium",
        lineHeight: "$labelMedium",
        letterSpacing: "$labelMedium",
        fontFamily: "$body700",
      },
      labelSmall: {
        //@ts-ignore
        props: { as: P },
        fontSize: "$labelSmall",
        lineHeight: "$labelSmall",
        letterSpacing: "$labelSmall",
        fontFamily: "$body700",
      },
    },
  },

  defaultProps: {
    size: "bodylarge",
  },
});
