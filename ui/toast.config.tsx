import { Platform, StyleProp, View, ViewStyle } from "react-native";
import { BaseToast } from "react-native-toast-message";
import Icon from "./Icon";

const toastStyles = (theme): StyleProp<ViewStyle> => ({
  borderRadius: 25,
  alignItems: "center",
  justifyContent: "center",
  borderLeftWidth: 0,
  minHeight: 50,
  width: "auto",
  maxWidth: 300,
  height: "auto",
  padding: 2,
  shadowOffset: { height: 20, width: 0 },
  shadowRadius: 50,
  shadowOpacity: 0.2,
  backgroundColor: theme[4],
});

const toastContainerStyles: StyleProp<ViewStyle> = {
  // marginTop: -20,
};

const text1Props = (theme) => ({
  style: {
    color: theme[11],
    fontFamily: "body_400",
    fontSize: 15,
  },
});

export const toastConfig = (theme) => ({
  success: (props) => (
    <View style={toastContainerStyles}>
      <BaseToast
        {...props}
        style={[toastStyles(theme), Platform.OS !== "web" && { minWidth: 200 }]}
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
        renderTrailingIcon={props.props?.renderTrailingIcon}
      />
    </View>
  ),

  info: (props) => (
    <View style={toastContainerStyles}>
      <BaseToast
        {...props}
        style={[toastStyles(theme), Platform.OS !== "web" && { minWidth: 200 }]}
        text1NumberOfLines={null}
        text2NumberOfLines={null}
        text1Props={text1Props(theme)}
        renderLeadingIcon={() => (
          <Icon
            style={{ color: theme[8], marginLeft: 10, marginRight: -10 }}
            filled
            size={30}
          >
            info
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
        style={[toastStyles(theme), Platform.OS !== "web" && { minWidth: 200 }]}
        text1NumberOfLines={null}
        text2NumberOfLines={null}
        text1Props={text1Props(theme)}
        text2Style={{ fontSize: 12, color: theme[11], opacity: 0.6 }}
      />
    </View>
  ),

  error: (props) => (
    <View style={toastContainerStyles}>
      <BaseToast
        {...props}
        style={[toastStyles(theme), Platform.OS !== "web" && { minWidth: 200 }]}
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
