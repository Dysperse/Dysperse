import { memo } from "react";
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
  heading?: boolean;
}

/**
 * body_100: Jost_100Thin,
    body_200: Jost_200ExtraLight,
    body_300: Jost_300Light,
    body_400: Jost_400Regular,
    body_500: Jost_500Medium,
    body_600: Jost_600SemiBold,
    body_700: Jost_700Bold,
    body_800: Jost_800ExtraBold,
    body_900: Jost_900Black,
 */
const fonts =
  Platform.OS === "web"
    ? {
        body_100: "body_100",
        body_200: "body_200",
        body_300: "body_300",
        body_400: "body_400",
        body_500: "body_500",
        body_600: "body_600",
        body_700: "body_700",
        body_800: "body_800",
        body_900: "body_900",
      }
    : {
        body_100: "Jost_100Thin",
        body_200: "Jost_200ExtraLight",
        body_300: "Jost_300Light",
        body_400: "Jost_400Regular",
        body_500: "Jost_500Medium",
        body_600: "Jost_600SemiBold",
        body_700: "Jost_700Bold",
        body_800: "Jost_800ExtraBold",
        body_900: "Jost_900Black",
      };

const textStyles = StyleSheet.create({
  default: {
    fontSize: 16,
  },
  eyebrow: {
    opacity: 0.6,
    textTransform: "uppercase",
  },
  heading: {
    textTransform: "uppercase",
  },
  menuItem: {
    fontFamily: fonts.body_300,
    fontSize: 17,
  },
});

function Text(props: DTextProps) {
  const theme = useColorTheme();

  return (
    <NText
      {...props}
      maxFontSizeMultiplier={1.1}
      style={[
        {
          fontSize: Platform.OS === "web" ? 15 : 16,
          color: theme[12],
          fontFamily: props.heading
            ? "heading"
            : fonts[`body_${props.weight || 400}`],
          ...(props.variant === "eyebrow" && {
            textTransform: "uppercase",
            fontFamily: `body_${props.weight || 800}`,
            color: theme[11],
          }),
        },
        props.variant === "eyebrow" && textStyles.eyebrow,
        props.variant === "menuItem" && textStyles.menuItem,
        props.variant === "menuItem" && { color: theme[11] },
        props.heading && textStyles.heading,
        props.textStyle,
        Array.isArray(props.style) ? [...props.style] : props.style,
      ]}
    />
  );
}

export default memo(Text);
