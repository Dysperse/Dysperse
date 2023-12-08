import { Text as CustomText, TextProps } from "react-native";

export default function Text(props: TextProps) {
  return (
    <CustomText
      {...props}
      style={{
        fontFamily: "body_300",
        ...(props.style && (props.style as any)),
      }}
    />
  );
}
