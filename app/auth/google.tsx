import Spinner from "@/ui/Spinner";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { View } from "react-native";

export default function Page() {
  useEffect(() => {
    console.log(WebBrowser.maybeCompleteAuthSession());
    WebBrowser.maybeCompleteAuthSession();
  }, []);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Spinner />
    </View>
  );
}
