import Logo from "@/ui/logo";
import { Image } from "expo-image";
import { Platform, View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { SignIn } from "./SignIn";

export function inIframe() {
  if (Platform.OS !== "web") return false;
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

export default function Page() {
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <SystemBars style="light" />
      <View style={{ position: "absolute", top: 0, right: 0, padding: 50 }}>
        <Logo size={45} />
      </View>
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          maxWidth: 1000,
          marginHorizontal: "auto",
          gap: 50,
          width: "100%",
        }}
      >
        <View
          style={{
            flex: 1,
            height: "100%",
          }}
        >
          <Image
            style={{
              height: "100%",
              width: "100%",
              objectFit: "contain",
              objectPosition: "bottom",
            }}
            contentPosition="bottom"
            contentFit="contain"
            source={{
              uri: `https://raw.githubusercontent.com/Dysperse/Assets/0056596a1b906148b3cc0f53e26efdabc98f2673/app/mockuuups-iphone-15-pro-mockup-on-textured-stone-with-dramatic-shadow.png`,
            }}
          />
        </View>
        <View style={{ flex: 1, padding: 20 }}>
          <SignIn />
        </View>
      </View>
    </View>
  );
}

