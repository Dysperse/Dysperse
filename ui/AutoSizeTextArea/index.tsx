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

  const handleChange = (e) => {
    console.log(e);
    setSize(e.nativeEvent.contentSize.height);
  };

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
          height: size,
          overflow: "hidden",
          fontSize: props.fontSize || 15,
          lineHeight: props.fontSize + 10,
        },
        props.style,
      ]}
      onContentSizeChange={handleChange}
      onKeyPress={() => setSize(props.fontSize || 15)}
    />
  );
}
