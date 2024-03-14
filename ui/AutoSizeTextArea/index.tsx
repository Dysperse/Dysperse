import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState } from "react";
import { Keyboard, StyleProp, TextInputProps } from "react-native";

interface DTextAreaProps extends TextInputProps {
  inputClassName?: string;
  fontSize?: number;
  inputStyle?: StyleProp<any>;
  inputDefaultValue?: string;
}

export default function AutoSizeTextArea(props: DTextAreaProps) {
  const ref: any = useRef();
  const [size, setSize] = useState(props.fontSize || 15);

  const [layoutHeight, setLayoutHeight] = useState(0);

  useEffect(() => {
    Keyboard.addListener("keyboardDidHide", () => {
      ref?.current?.blur();
    });
  }, [ref]);

  return (
    <BottomSheetTextInput
      ref={ref}
      {...props}
      defaultValue={props.inputDefaultValue}
      multiline
      style={[
        {
          height: layoutHeight,
          overflow: "hidden",
          fontSize: props.fontSize || 15,
        },
        props.style,
      ]}
      onContentSizeChange={(event) => {
        const contentHeight = event.nativeEvent.contentSize.height;
        setLayoutHeight(Math.max(layoutHeight, contentHeight));
      }}
      onLayout={(event) => {
        const height = event.nativeEvent.layout.height;
        if (height) {
          setLayoutHeight(event.nativeEvent.layout.height);
        }
      }}
    />
  );
}
