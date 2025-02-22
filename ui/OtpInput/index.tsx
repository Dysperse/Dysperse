import { forwardRef } from "react";
import { Platform } from "react-native";
import {
  OtpInput as OriginalOTPInput,
  OtpInputProps,
} from "react-native-otp-entry";
import { useColorTheme } from "../color/theme-provider";

const OtpInput = forwardRef(
  (
    props: Partial<OtpInputProps> & {
      containerGap?: number;
      fontSize?: any;
      inputHeight?: any;
    },
    ref: any
  ) => {
    const theme = useColorTheme();

    return (
      <OriginalOTPInput
        ref={ref}
        numberOfDigits={6}
        focusColor={theme[9]}
        type="numeric"
        focusStickBlinkingDuration={500}
        onFilled={(text) => console.log(`OTP is ${text}`)}
        textInputProps={{
          accessibilityLabel: "One-Time Password",
        }}
        theme={{
          focusStickStyle: { borderRadius: 99, backgroundColor: theme[9] },
          pinCodeContainerStyle: {
            borderWidth: 2,
            borderColor: theme[3],
            borderRadius: 20,
            minHeight: "auto",
            height: 50,
            width: 50,
            height: props.inputHeight || 50,
            flex: 1,
          },
          containerStyle: { gap: props.containerGap || 20 },
          pinCodeTextStyle: {
            fontFamily: "body_500",
            color: theme[11],
            fontSize:
              props.fontSize || (props.secureTextEntry ? 50 : undefined),
            marginTop: props.secureTextEntry
              ? Platform.OS === "web"
                ? 10
                : Platform.OS === "ios"
                ? -8
                : 30
              : undefined,
          },
        }}
        {...props}
      />
    );
  }
);

export default OtpInput;

