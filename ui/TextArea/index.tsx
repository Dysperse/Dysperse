import { StyleProp, TextStyle } from "react-native";
import { TextInputProps } from "react-native";
import { useColorTheme } from "../color/theme-provider";
import { TextInput } from "react-native-gesture-handler";
import {
  BottomSheetTextInput,
  useBottomSheetInternal,
} from "@gorhom/bottom-sheet";
import { Ref } from "react";

interface DTextInputProps extends TextInputProps {
  style?: StyleProp<TextStyle>;
  variant?: "default" | "filled";
  bottomSheet?: boolean;
  inputRef?: Ref<TextInput>;
}

export default function TextField(props: DTextInputProps) {
  const theme = useColorTheme();
  const Component = props.bottomSheet ? BottomSheetTextInput : TextInput;

  return (
    <Component
      placeholderTextColor={theme[8]}
      cursorColor={theme[8]}
      selectionColor={theme[8]}
      {...props}
      ref={props.inputRef}
      style={[
        {
          color: theme[11],
          fontFamily: `body_400`,
          fontSize: 16,
          ...(props.variant === "filled" && {
            backgroundColor: theme[3],
            borderRadius: 15,
            paddingHorizontal: 15,
            paddingVertical: 7,
          }),
        },
        Array.isArray(props.style)
          ? Object.assign({}, ...props.style)
          : props.style,
      ]}
    />
  );
}
