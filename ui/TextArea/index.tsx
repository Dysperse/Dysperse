import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Ref } from "react";
import { StyleProp, TextInputProps, TextStyle } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useColorTheme } from "../color/theme-provider";

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
    // <View style={{ position: "relative" }}>
    // {props.placeholder && (
    //   <Text
    //     style={{
    //       position: "absolute",
    //       zIndex: 1,
    //       top: -10,
    //       left: 15,
    //       color: theme[8],
    //     }}
    //     weight={700}
    //   >
    //     {props.placeholder}
    //   </Text>
    // )}
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
    // </View>
  );
}
