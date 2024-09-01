import Spinner from "@/ui/Spinner";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Platform, View } from "react-native";

export default function Page() {
  useEffect(() => {
    try {
      if (Platform.OS === "web") {
        WebBrowser.maybeCompleteAuthSession();
      } else {
        WebBrowser.dismissAuthSession();
        WebBrowser.dismissBrowser();
      }
    } catch (error) {
      console.error(error);
    }
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

