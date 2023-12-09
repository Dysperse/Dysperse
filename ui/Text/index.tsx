import { Text as NText, StyleProp, TextProps, TextStyle } from "react-native";

interface DTextProps extends TextProps {
  textClassName?: string;
  textStyle?: StyleProp<TextStyle>;
}

export default function Text(props: DTextProps) {
  return (
    <NText
      {...props}
      className={props.textClassName || undefined}
      style={{
        fontFamily: "body_300",
        ...(props.style as any),
        ...(props.textStyle as any),
      }}
    />
  );
}
