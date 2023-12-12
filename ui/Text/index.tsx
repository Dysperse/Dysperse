import { Text as NText, StyleProp, TextProps, TextStyle } from "react-native";

export interface DTextProps extends TextProps {
  textClassName?: string;
  textStyle?: StyleProp<TextStyle>;
  weight?: 100 | 300 | 400 | 500 | 600 | 700 | 800;
}

export default function Text(props: DTextProps) {
  return (
    <NText
      {...props}
      className={props.textClassName || undefined}
      style={{
        fontFamily: `body_${props.weight || 300}`,
        ...(props.style as any),
        ...(props.textStyle as any),
      }}
    />
  );
}
