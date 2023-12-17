import { AntDesign } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { StyleProp, View, ViewStyle } from "react-native";
import {
  BaseToast,
  ErrorToast,
  SuccessToast,
} from "react-native-toast-message";
import Icon from "./Icon";

const toastStyles = (theme): StyleProp<ViewStyle> => ({
  borderRadius: 99,
  alignItems: "center",
  justifyContent: "center",
  borderLeftWidth: 0,
  height: 50,
  padding: 5,
  backgroundColor: theme[4],
});

const toastContainerStyles: StyleProp<ViewStyle> = {
  marginTop: 20,
};

const text1Props = (theme) => ({
  style: {
    color: theme[9],
    fontFamily: "body_400",
    fontSize: 15,
  },
});

export const toastConfig = (theme) => ({
  /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
  success: (props) => (
    <View style={toastContainerStyles}>
      <BaseToast
        {...props}
        style={toastStyles(theme)}
        text1NumberOfLines={null}
        text1Props={text1Props(theme)}
        renderLeadingIcon={() => (
          <Icon
            style={{ color: theme[8], marginLeft: 10, marginRight: -10 }}
            filled
            size={30}
          >
            check_circle
          </Icon>
        )}
        text2Style={{ fontSize: 15 }}
      />
    </View>
  ),

  plain: (props) => (
    <View style={toastContainerStyles}>
      <ErrorToast
        {...props}
        style={toastStyles(theme)}
        text1NumberOfLines={null}
        text1Props={text1Props(theme)}
      />
    </View>
  ),
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: (props) => (
    <View style={toastContainerStyles}>
      <ErrorToast
        {...props}
        style={toastStyles(theme)}
        text1NumberOfLines={null}
        renderLeadingIcon={() => (
          <AntDesign name="closecircleo" size={24} color="black" />
        )}
        text1Style={{ fontSize: 17 }}
        text2Style={{ fontSize: 15 }}
      />
    </View>
  ),
});
