import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import { Platform, View } from "react-native";
import DomMapView from "./map";
import NativeMapView from "./NativeMap";

export default function MapView() {
  const theme = useColorTheme();

  return (
    <View style={{ flex: 1, flexDirection: "row", padding: 20, paddingTop: 0 }}>
      <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
        <Text style={{ fontFamily: "serifText800", fontSize: 37 }}>
          Coming soon!
        </Text>
        <Text style={{ opacity: 0.8, marginTop: 10, fontSize: 17 }}>
          Soon, you'll be able to view your {"\n"}collection on a map. Stay
          tuned!
        </Text>
      </View>
      <View
        style={{
          flex: 2,
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: theme[3],
        }}
      >
        {Platform.OS === "web" ? <DomMapView /> : <NativeMapView />}
      </View>
    </View>
  );
}
