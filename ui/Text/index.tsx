import { Text as NText, StyleProp, TextProps, TextStyle } from "react-native";
import { useColorTheme } from "../color/theme-provider";

export interface DTextProps extends TextProps {
  textClassName?: string;
  textStyle?: StyleProp<TextStyle>;
  weight?: 100 | 300 | 400 | 500 | 600 | 700 | 800;
  variant?: "default" | "eyebrow";
  heading?: boolean;
}

export default function Text(props: DTextProps) {
  const theme = useColorTheme();

  return (
    <NText
      {...props}
      className={props.textClassName || undefined}
      style={{
        color: theme[12],
        fontFamily: props.heading ? "heading" : `body_${props.weight || 400}`,
        ...(props.style as any),
        ...(props.textStyle as any),

        ...(props.variant === "eyebrow" && {
          textTransform: "uppercase",
          fontFamily: `body_${props.weight || 700}`,
          opacity: 0.6,
          color: theme[11],
        }),
        ...(props.heading && {
          textTransform: "uppercase",
        }),
      }}
    />
  );
}
