import { Platform } from "react-native";
import AutoSizeTextArea from "../AutoSizeTextArea";

let AutoGrowingTextInput;

if (Platform.OS !== "ios") {
  AutoGrowingTextInput = () => null; // Provide a fallback or use a working alternative.
} else {
  AutoGrowingTextInput =
    require("react-native-autogrow-textinput").AutoGrowingTextInput;
}

export const GrowingTextInput =
  Platform.OS === "ios" ? AutoGrowingTextInput : AutoSizeTextArea;
