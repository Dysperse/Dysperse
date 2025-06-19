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
  ref?: React.Ref<NText>;
}

export const getFontName = (family: string, weight: number) => {
  const fonts = {
    crimsonPro: {
      800: "serifText800",
    },
    jetBrainsMono: {
      500: "mono",
    },
    jost: {
      100: "body_100",
      200: "body_200",
      300: "body_300",
      400: "body_400",
      500: "body_500",
      600: "body_600",
      700: "body_700",
      800: "body_800",
      900: "body_900",
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

const Text = (props: DTextProps) => {
  const theme = useColorTheme();

  return (
    <NText
      {...props}
      ref={props?.ref}
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

export default Text;

