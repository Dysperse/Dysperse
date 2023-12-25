import { StyleProp, TextStyle } from "react-native";
import { TextInputProps } from "react-native";
import { useColorTheme } from "../color/theme-provider";
import { TextInput } from "react-native-gesture-handler";

interface DTextInputProps extends TextInputProps {
  style?: StyleProp<TextStyle>;
  variant?: "default" | "filled";
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

        ...(props.variant === "filled" && {
          backgroundColor: theme[3],
          borderRadius: 15,
          paddingHorizontal: 15,
          paddingVertical: 7,
        }),
      }}
    />
  );
}
