import { forwardRef, ForwardRefRenderFunction, memo } from "react";
import {
  Text as NText,
  Platform,
  StyleProp,
  StyleSheet,
  TextProps,
  TextStyle,
} from "react-native";
import { useColorTheme } from "../color/theme-provider";

export interface DTextProps extends TextProps {
  textClassName?: string;
  textStyle?: StyleProp<TextStyle>;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  variant?: "default" | "eyebrow" | "menuItem";
}

export const getFontName = (family: string, weight: number) => {
  const fonts = {
    crimsonPro: {
      800: Platform.OS === "web" ? "serifText800" : "CrimsonPro_800ExtraBold",
    },
    jetBrainsMono: {
      500: Platform.OS === "web" ? "mono" : "JetBrainsMono_500Medium",
    },
    jost:
      Platform.OS === "web"
        ? {
            100: "Jost Thin",
            200: "Jost ExtraLight",
            300: "Jost Light",
            400: "Jost Regular",
            500: "Jost Medium",
            600: "Jost SemiBold",
            700: "Jost ExtraBold",
            800: "Jost ExtraBold",
            900: "Jost Black",
          }
        : {
            100: "Jost_100Thin",
            200: "Jost_200ExtraLight",
            300: "Jost_300Light",
            400: "Jost_400Regular",
            500: "Jost_500Medium",
            600: "Jost_600SemiBold",
            700: "Jost_700Bold",
            800: "Jost_800ExtraBold",
            900: "Jost_900Black",
          },
  };

  return fonts[family][weight];
};

const textStyles = StyleSheet.create({
  default: {
    fontSize: 16,
  },
  eyebrow: {
    opacity: 0.6,
    textTransform: "uppercase",
  },
  menuItem: {
    fontSize: 17,
  },
});

const Text: ForwardRefRenderFunction<NText, DTextProps> = (props, ref) => {
  const theme = useColorTheme();

  return (
    <NText
      {...props}
      ref={ref}
      maxFontSizeMultiplier={1.1}
      style={[
        {
          fontSize: Platform.OS === "web" ? 15 : 16,
          color: theme[12],
          fontFamily: getFontName("jost", props.weight || 400),
          ...(props.variant === "eyebrow" && {
            textTransform: "uppercase",
            fontFamily: getFontName("jost", props.weight || 900),
            color: theme[11],
          }),
        },
        props.variant === "eyebrow" && textStyles.eyebrow,
        props.variant === "menuItem" && textStyles.menuItem,
        props.variant === "menuItem" && {
          fontFamily: getFontName("jost", 300),
        },
        props.variant === "menuItem" && { color: theme[11] },
        props.textStyle,
        Array.isArray(props.style) ? [...props.style] : props.style,
      ]}
    />
  );
};

export default memo(forwardRef(Text));
