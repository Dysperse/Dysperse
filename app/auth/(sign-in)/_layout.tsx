import { JsStack } from "@/components/layout/_stack";
import Logo from "@/ui/logo";
import { Image, ImageBackground } from "expo-image";
import { Platform, View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";

export function inIframe() {
  if (Platform.OS !== "web") return false;
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

export default function Layout() {
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
      <View style={{ flexDirection: "row", flex: 1, padding: 20, gap: 20 }}>
        <ImageBackground
          style={{
            flex: 0.8,
            height: "100%",
            backgroundColor: "#fff",
            borderRadius: 20,
            paddingHorizontal: 30,
            overflow: "hidden",
          }}
          source={{
            uri: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.dev/svgjs' viewBox='0 0 700 700' width='700' height='700'%3E%3Cdefs%3E%3ClinearGradient gradientTransform='rotate(-150, 0.5, 0.5)' x1='50%25' y1='0%25' x2='50%25' y2='100%25' id='gggrain-gradient2'%3E%3Cstop stop-color='hsl(194, 83%25, 49%25)' stop-opacity='1' offset='-0%25'%3E%3C/stop%3E%3Cstop stop-color='rgba(255,255,255,0)' stop-opacity='0' offset='100%25'%3E%3C/stop%3E%3C/linearGradient%3E%3ClinearGradient gradientTransform='rotate(150, 0.5, 0.5)' x1='50%25' y1='0%25' x2='50%25' y2='100%25' id='gggrain-gradient3'%3E%3Cstop stop-color='hsl(0, 100%25, 60%25)' stop-opacity='1'%3E%3C/stop%3E%3Cstop stop-color='rgba(255,255,255,0)' stop-opacity='0' offset='100%25'%3E%3C/stop%3E%3C/linearGradient%3E%3Cfilter id='gggrain-filter' x='-20%25' y='-20%25' width='140%25' height='140%25' filterUnits='objectBoundingBox' primitiveUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='2' seed='2' stitchTiles='stitch' x='0%25' y='0%25' width='100%25' height='100%25' result='turbulence'%3E%3C/feTurbulence%3E%3CfeColorMatrix type='saturate' values='0' x='0%25' y='0%25' width='100%25' height='100%25' in='turbulence' result='colormatrix'%3E%3C/feColorMatrix%3E%3CfeComponentTransfer x='0%25' y='0%25' width='100%25' height='100%25' in='colormatrix' result='componentTransfer'%3E%3CfeFuncR type='linear' slope='3'%3E%3C/feFuncR%3E%3CfeFuncG type='linear' slope='3'%3E%3C/feFuncG%3E%3CfeFuncB type='linear' slope='3'%3E%3C/feFuncB%3E%3C/feComponentTransfer%3E%3CfeColorMatrix x='0%25' y='0%25' width='100%25' height='100%25' in='componentTransfer' result='colormatrix2' type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 19 -11'%3E%3C/feColorMatrix%3E%3C/filter%3E%3C/defs%3E%3Cg%3E%3Crect width='100%25' height='100%25' fill='hsl(22, 100%25, 60%25)'%3E%3C/rect%3E%3Crect width='100%25' height='100%25' fill='url(%23gggrain-gradient3)'%3E%3C/rect%3E%3Crect width='100%25' height='100%25' fill='url(%23gggrain-gradient2)'%3E%3C/rect%3E%3Crect width='100%25' height='100%25' fill='transparent' filter='url(%23gggrain-filter)' opacity='.4' style='mix-blend-mode: soft-light'%3E%3C/rect%3E%3C/g%3E%3C/svg%3E",
          }}
        >
          <Image
            style={{
              height: "100%",
              width: "100%",
              objectFit: "contain",
              maxHeight: "90%",
              marginTop: "auto",
              objectPosition: "bottom",
            }}
            contentPosition="bottom"
            contentFit="contain"
            source={{
              uri: `https://raw.githubusercontent.com/Dysperse/Assets/0056596a1b906148b3cc0f53e26efdabc98f2673/app/mockuuups-iphone-15-pro-mockup-on-textured-stone-with-dramatic-shadow.png`,
            }}
          />
        </ImageBackground>
        <View style={{ flex: 1, paddingHorizontal: 40 }}>
          <JsStack screenOptions={{ header: () => null }} />
        </View>
      </View>
    </View>
  );
}

