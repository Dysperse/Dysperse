import { useEffect, useState } from "react";
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
}

const AutoSizeTextArea = (props: DTextAreaProps) => {
  const [layoutHeight, setLayoutHeight] = useState(0);

  useEffect(() => {
    Keyboard.addListener("keyboardDidHide", () => {
      props.ref?.current?.blur();
    });
  }, [props.ref]);

  const SafeTextInput = TextInput;

  return (
    <SafeTextInput
      ref={props.ref}
      defaultValue={props.inputDefaultValue}
      multiline
      {...props}
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
};

export default AutoSizeTextArea;

