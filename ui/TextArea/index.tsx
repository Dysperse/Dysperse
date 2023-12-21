import { StyleProp, TextInput, TextStyle } from "react-native";
import { TextInputProps } from "react-native";
import { useColorTheme } from "../color/theme-provider";

interface DTextInputProps extends TextInputProps {
  style?: StyleProp<TextStyle>;
}

export default function TextField(props: DTextInputProps) {
  const theme = useColorTheme();
  return (
    <TextInput
      placeholderTextColor={theme[8]}
      cursorColor={theme[8]}
      selectionColor={theme[5]}
      {...props}
      style={{
        ...(props.style as any),
        color: theme[11],
        fontFamily: `body_400`,
      }}
    />
  );
}
