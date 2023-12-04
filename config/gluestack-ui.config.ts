import { AnimationResolver } from "@gluestack-style/animation-resolver";
import { MotionAnimationDriver } from "@gluestack-style/legend-motion-animation-driver";
import { createConfig, createComponents } from "@gluestack-style/react";
import * as componentsTheme from "./theme";
import * as colors from "../themes";
import { ColorThemes } from "./colorThemes";

const flattenColors = (colors, result = {}, currentKey = "") => {
  for (const key in colors) {
    const newKey = currentKey ? `${currentKey}${key.slice(-1)}` : key;
    if (typeof colors[key] === "object") {
      flattenColors(colors[key], result, `${newKey}`);
    } else {
      result[`${newKey}`] = colors[key];
    }
  }
  return result;
};

export const gluestackUIConfig = createConfig({
  aliases: {
    bg: "backgroundColor",
    bgColor: "backgroundColor",
    h: "height",
    w: "width",
    p: "padding",
    px: "paddingHorizontal",
    py: "paddingVertical",
    pt: "paddingTop",
    pb: "paddingBottom",
    pr: "paddingRight",
    pl: "paddingLeft",
    m: "margin",
    mx: "marginHorizontal",
    my: "marginVertical",
    mt: "marginTop",
    mb: "marginBottom",
    mr: "marginRight",
    ml: "marginLeft",
    rounded: "borderRadius",
  } as const,
  tokens: {
    colors: {
      ...(flattenColors(colors) as ColorThemes),
    },
    space: {
      px: "1px",
      "0": 0,
      "0.5": 2,
      "1": 4,
      "1.5": 6,
      "2": 8,
      "2.5": 10,
      "3": 12,
      "3.5": 14,
      "4": 16,
      "4.5": 18,
      "5": 20,
      "6": 24,
      "7": 28,
      "8": 32,
      "9": 36,
      "10": 40,
      "11": 44,
      "12": 48,
      "16": 64,
      "20": 80,
      "24": 96,
      "32": 128,
      "40": 160,
      "48": 192,
      "56": 224,
      "64": 256,
      "72": 288,
      "80": 320,
      "96": 384,
      "1/2": "50%",
      "1/3": "33.333%",
      "2/3": "66.666%",
      "1/4": "25%",
      "2/4": "50%",
      "3/4": "75%",
      "1/5": "20%",
      "2/5": "40%",
      "3/5": "60%",
      "4/5": "80%",
      "1/6": "16.666%",
      "2/6": "33.333%",
      "3/6": "50%",
      "4/6": "66.666%",
      "5/6": "83.333%",
      full: "100%",
    },
    borderWidths: {
      "0": 0,
      "1": 1,
      "2": 2,
      "4": 4,
      "8": 8,
    },
    radii: {
      none: 0,
      xs: 2,
      sm: 20,
      md: 28,
      lg: 8,
      xl: 12,
      "2xl": 16,
      "3xl": 24,
      full: 9999,
    },
    breakpoints: {
      base: 0,
      sm: 480,
      md: 768,
      lg: 992,
      xl: 1280,
    },
    mediaQueries: {
      base: "@media screen and (min-width: 0)",
      xs: "@media screen and (min-width: 400px)",
      sm: "@media screen and (min-width: 480px)",
      md: "@media screen and (min-width: 768px)",
      lg: "@media screen and (min-width: 992px)",
      xl: "@media screen and (min-width: 1280px)",
    },
    letterSpacings: {
      displayLarge: -0.25,
      displayMedium: 0,
      displaySmall: 0,
      headlineLarge: 0,
      headlineMedium: 0,
      headlineSmall: 0,
      titleLarge: 0,
      titleMedium: 0.15,
      titleSmall: 0.1,
      bodyLarge: 0.5,
      bodyMedium: 0.25,
      bodySmall: 0.4,
      labelLarge: 0.1,
      labelMedium: 0.5,
      labelSmall: 0.5,
    },
    lineHeights: {
      displayLarge: 64,
      displayMedium: 52,
      displaySmall: 44,
      headlineLarge: 40,
      headlineMedium: 36,
      headlineSmall: 32,
      titleLarge: 28,
      titleMedium: 24,
      titleSmall: 20,
      bodyLarge: 24,
      bodyMedium: 20,
      bodySmall: 16,
      labelLarge: 20,
      labelMedium: 16,
      labelSmall: 16,
    },
    fontWeights: {
      100: "100",
      300: "300",
      400: "400",
      500: "500",
      600: "600",
      700: "700",
      800: "800",
    },
    fonts: {
      heading: undefined,
      body: "body_300",
      body100: "body_100",
      body300: "body_300",
      body400: "body_400",
      body500: "body_500",
      body600: "body_600",
      body700: "body_700",
      body800: "body_800",
    },
    fontSizes: {
      displayLarge: 57,
      displayMedium: 45,
      displaySmall: 36,
      headlineLarge: 32,
      headlineMedium: 28,
      headlineSmall: 24,
      titleLarge: 22,
      titleMedium: 16,
      titleSmall: 14,
      bodyLarge: 16,
      bodyMedium: 14,
      bodySmall: 12,
      labelLarge: 14,
      labelMedium: 12,
      labelSmall: 11,
    },
    opacity: {
      0: 0,
      5: 0.05,
      10: 0.1,
      20: 0.2,
      25: 0.25,
      30: 0.3,
      40: 0.4,
      50: 0.5,
      60: 0.6,
      70: 0.7,
      75: 0.75,
      80: 0.8,
      90: 0.9,
      95: 0.95,
      100: 1,
    },
  } as const,
  globalStyle: {
    variants: {
      hardShadow: {
        "1": {
          shadowColor: "$primary12",
          shadowOffset: {
            width: -2,
            height: 2,
          },
          shadowRadius: 8,
          shadowOpacity: 0.5,
          elevation: 10,
        },
        "2": {
          shadowColor: "$primary12",
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowRadius: 8,
          shadowOpacity: 0.5,
          elevation: 10,
        },
        "3": {
          shadowColor: "$primary12",
          shadowOffset: {
            width: 2,
            height: 2,
          },
          shadowRadius: 8,
          shadowOpacity: 0.5,
          elevation: 10,
        },
        "4": {
          shadowColor: "$primary12",
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowRadius: 8,
          shadowOpacity: 0.5,
          elevation: 10,
        },
        // this 5th version is only for toast shadow
        // temporary
        "5": {
          shadowColor: "$primary12",
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowRadius: 8,
          shadowOpacity: 0.2,
          elevation: 10,
        },
      },
      softShadow: {
        "1": {
          shadowColor: "$primary12",
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowRadius: 10,
          shadowOpacity: 0.1,
          _android: {
            shadowColor: "$primary5",
            elevation: 5,
            shadowOpacity: 0.05,
          },
        },
        "2": {
          shadowColor: "$primary12",
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowRadius: 20,
          elevation: 3,
          shadowOpacity: 0.1,
          _android: {
            shadowColor: "$primary5",
            elevation: 10,
            shadowOpacity: 0.1,
          },
        },
        "3": {
          shadowColor: "$primary12",
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowRadius: 30,
          shadowOpacity: 0.1,
          elevation: 4,
          _android: {
            shadowColor: "$primary5",
            elevation: 15,
            shadowOpacity: 0.15,
          },
        },
        "4": {
          shadowColor: "$primary12",
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowRadius: 40,
          shadowOpacity: 0.1,
          elevation: 10,
          _android: {
            shadowColor: "$primary5",
            elevation: 20,
            shadowOpacity: 0.2,
          },
        },
      },
    },
  },
  plugins: [new AnimationResolver(MotionAnimationDriver)],
});

type Config = typeof gluestackUIConfig; // Assuming `config` is defined elsewhere

type Components = typeof componentsConfig;

export const componentsConfig = createComponents(componentsTheme);

export type { UIConfig, UIComponents } from "@gluestack-ui/themed";

export interface IConfig {}
export interface IComponents {}

declare module "@gluestack-ui/themed" {
  interface UIConfig extends Omit<Config, keyof IConfig>, IConfig {}
  interface UIComponents
    extends Omit<Components, keyof IComponents>,
      IComponents {}
}

export const config = {
  ...gluestackUIConfig,
  components: componentsConfig,
};
