import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Ref } from "react";
import { StyleProp, TextInputProps, TextStyle } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { DTextProps, getFontName } from "../Text";
import { useColorTheme } from "../color/theme-provider";

interface DTextInputProps extends TextInputProps {
  style?: StyleProp<TextStyle>;
  variant?: "default" | "filled" | "outlined" | "filled+outlined";
  bottomSheet?: boolean;
  inputRef?: Ref<TextInput>;
  weight?: DTextProps["weight"];
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
        props.editable === false && {
          opacity: 0.7,
          boxShadow: "none",
          pointerEvents: "none",
        },
        props.multiline && {
          verticalAlign: "top",
        },
        {
          color: theme[11],
          fontFamily: getFontName("jost", props.weight || 400),
          fontSize: 16,
          ...(props.variant?.includes("filled") && {
            backgroundColor: theme[3],
            borderRadius: 15,
            paddingHorizontal: 15,
            paddingVertical: 7,
          }),
          ...(props.variant?.includes("outlined") && {
            borderWidth: 1,
            borderColor: theme[5],
          }),
        },
        Array.isArray(props.style)
          ? Object.assign({}, ...props.style)
          : props.style,
      ]}
    />
  );
}

