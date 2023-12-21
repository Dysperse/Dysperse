import { TextInput } from "react-native";
import { TextInputProps } from "react-native";
import { useColorTheme } from "../color/theme-provider";

export default function TextField(props: TextInputProps) {
  const theme = useColorTheme();
  return (
    <TextInput
      placeholderTextColor={theme[7]}
      cursorColor={theme[8]}
      selectionColor={theme[4]}
      {...props}
      style={{
        color: theme[11],
        fontFamily: `body_300`,
        ...(props.style as any),
      }}
    />
  );
}
