import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  StyleProp,
  TextInput,
  TextInputProps,
} from "react-native";

interface DTextAreaProps extends TextInputProps {
  inputClassName?: string;
  fontSize?: number;
  inputStyle?: StyleProp<any>;
  inputDefaultValue?: string;
  disabled?: boolean;
  bottomSheet?: boolean;
}

export default function AutoSizeTextArea(props: DTextAreaProps) {
  const ref: any = useRef();

  const [layoutHeight, setLayoutHeight] = useState(0);

  useEffect(() => {
    Keyboard.addListener("keyboardDidHide", () => {
      ref?.current?.blur();
    });
  }, [ref]);

  const SafeTextInput = props.bottomSheet ? BottomSheetTextInput : TextInput;

  return (
    <SafeTextInput
      ref={ref}
      {...props}
      defaultValue={props.inputDefaultValue}
      multiline
      style={[
        {
          height: layoutHeight,
          overflow: "hidden",
          fontSize: props.fontSize || 15,
          ...(Platform.OS === "web" && { textWrap: "pretty" }),
        },
        props.style,
      ]}
      onContentSizeChange={(event) => {
        const contentHeight = event.nativeEvent.contentSize.height;
        setLayoutHeight(Math.max(layoutHeight, contentHeight));
        props.onContentSizeChange?.(event);
      }}
      onLayout={(event) => {
        const height = event.nativeEvent.layout.height;
        if (height) {
          setLayoutHeight(event.nativeEvent.layout.height);
        }
        props.onLayout?.(event);
      }}
    />
  );
}

