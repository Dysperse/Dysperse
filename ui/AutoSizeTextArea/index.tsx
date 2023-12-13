import { useState } from "react";
import { StyleProp, TextInputProps } from "react-native";
import { TextInput } from "react-native-gesture-handler";

interface DTextAreaProps extends TextInputProps {
  inputClassName?: string;
  fontSize?: number;
  inputStyle?: StyleProp<any>;
  inputDefaultValue?: string;
}

export default function AutoSizeTextArea(props: DTextAreaProps) {
  const [size, setSize] = useState(props.fontSize || 15);
  return (
    <TextInput
      {...props}
      defaultValue={props.inputDefaultValue}
      multiline
      className={`border border-transparent ${props.inputClassName}`}
      style={{
        ...props.inputStyle,
        height: size,
        overflow: "hidden",
        fontSize: props.fontSize || 15,
      }}
      onContentSizeChange={(e) => setSize(e.nativeEvent.contentSize.height)}
    />
  );
}
