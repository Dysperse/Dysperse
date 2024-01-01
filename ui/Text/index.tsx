import {
  Text as NText,
  Platform,
  StyleProp,
  TextProps,
  TextStyle,
} from "react-native";
import { useColorTheme } from "../color/theme-provider";

export interface DTextProps extends TextProps {
  textClassName?: string;
  textStyle?: StyleProp<TextStyle>;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  variant?: "default" | "eyebrow";
  heading?: boolean;
}

export default function Text(props: DTextProps) {
  const theme = useColorTheme();

  return (
    <NText
      {...props}
      maxFontSizeMultiplier={1.1}
      style={[
        {
          fontSize: Platform.OS === "web" ? 15 : 16,
          color: theme[12],
          fontFamily: props.heading ? "heading" : `body_${props.weight || 400}`,
          ...(props.variant === "eyebrow" && {
            textTransform: "uppercase",
            fontFamily: `body_${props.weight || 800}`,
            opacity: 0.6,
            color: theme[11],
          }),
          ...(props.heading && {
            textTransform: "uppercase",
          }),
        },
        props.textStyle,
        Array.isArray(props.style) ? [...props.style] : props.style,
      ]}
    />
  );
}
