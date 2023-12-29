import { useState } from "react";
import { StyleProp, TextInputProps } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import TextField from "../TextArea";

interface DTextAreaProps extends TextInputProps {
  inputClassName?: string;
  fontSize?: number;
  inputStyle?: StyleProp<any>;
  inputDefaultValue?: string;
}

export default function AutoSizeTextArea(props: DTextAreaProps) {
  const [size, setSize] = useState(props.fontSize || 15);

  const handleChange = (e) => {
    setSize(e.nativeEvent.contentSize.height);
  };

  return (
    <TextField
      {...props}
      defaultValue={props.inputDefaultValue}
      multiline
      style={[
        {
          height: Math.max(props.fontSize || 15, size),
          overflow: "hidden",
          fontSize: props.fontSize || 15,
        },
        props.style,
      ]}
      onContentSizeChange={handleChange}
      onKeyPress={() => setSize(props.fontSize || 15)}
    />
  );
}
