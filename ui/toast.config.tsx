import { AntDesign } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { StyleProp, View, ViewStyle } from "react-native";
import { BaseToast, ErrorToast } from "react-native-toast-message";

const toastStyles: StyleProp<ViewStyle> = {
  borderRadius: 99,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 0,
  padding: 10,
  paddingLeft: 20,
  width: "auto",
  minWidth: "auto",
  maxWidth: 300,
  height: "auto",
  shadowColor: "rgba(0,0,0,0.05)",
  backgroundColor: "rgba(200,200,200,.5)",
  shadowRadius: 20,
  shadowOffset: {
    height: 10,
    width: 0,
  },
};

const toastContainerStyles: StyleProp<ViewStyle> = {
  borderRadius: 999,
  overflow: "hidden",
  shadowColor: "rgba(0,0,0,0.05)",
  backgroundColor: "rgba(200,200,200,.5)",
  shadowRadius: 20,
  shadowOffset: {
    height: 10,
    width: 0,
  },
};

export const toastConfig = {
  /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
  success: (props) => (
    <View style={toastContainerStyles}>
      <BlurView intensity={40}>
        <ErrorToast
          {...props}
          style={toastStyles}
          text1NumberOfLines={null}
          renderLeadingIcon={() => (
            <AntDesign name="checkcircleo" size={24} color="black" />
          )}
          text1Style={{ fontSize: 17 }}
          text2Style={{ fontSize: 15 }}
        />
      </BlurView>
    </View>
  ),

  plain: (props) => (
    <View style={toastContainerStyles}>
      <BlurView intensity={40}>
        <ErrorToast
          {...props}
          style={{ ...toastStyles, paddingLeft: 10 }}
          text1NumberOfLines={null}
          text1Style={{ fontSize: 17 }}
          text2Style={{ fontSize: 15 }}
        />
      </BlurView>
    </View>
  ),
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: (props) => (
    <View style={toastContainerStyles}>
      <BlurView intensity={40}>
        <ErrorToast
          {...props}
          style={toastStyles}
          text1NumberOfLines={null}
          renderLeadingIcon={() => (
            <AntDesign name="closecircleo" size={24} color="black" />
          )}
          text1Style={{ fontSize: 17 }}
          text2Style={{ fontSize: 15 }}
        />
      </BlurView>
    </View>
  ),
};
