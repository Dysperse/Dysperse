import { StyleProp, View, ViewStyle } from "react-native";
import { BaseToast } from "react-native-toast-message";
import Icon from "./Icon";

const toastStyles = (theme): StyleProp<ViewStyle> => ({
  borderRadius: 99,
  alignItems: "center",
  justifyContent: "center",
  borderLeftWidth: 0,
  minHeight: 50,
  padding: 5,
  backgroundColor: theme[4],
});

const toastContainerStyles: StyleProp<ViewStyle> = {
  marginTop: 10,
};

const text1Props = (theme) => ({
  style: {
    color: theme[11],
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
        text2NumberOfLines={null}
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
        text2Style={{ fontSize: 12, color: theme[11], opacity: 0.6 }}
      />
    </View>
  ),

  plain: (props) => (
    <View style={toastContainerStyles}>
      <BaseToast
        {...props}
        style={toastStyles(theme)}
        text1NumberOfLines={null}
        text2NumberOfLines={null}
        text1Props={text1Props(theme)}
        text2Style={{ fontSize: 12, color: theme[11], opacity: 0.6 }}
      />
    </View>
  ),

  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: (props) => (
    <View style={toastContainerStyles}>
      <BaseToast
        {...props}
        style={toastStyles(theme)}
        text1={props.text1 || "Something went wrong. Please try again later"}
        text1NumberOfLines={null}
        text2NumberOfLines={null}
        text2Style={{ fontSize: 12, color: theme[11], opacity: 0.6 }}
        text1Props={text1Props(theme)}
        renderLeadingIcon={() => (
          <Icon
            style={{ color: theme[8], marginLeft: 10, marginRight: -10 }}
            filled
            size={30}
          >
            error
          </Icon>
        )}
      />
    </View>
  ),
});
